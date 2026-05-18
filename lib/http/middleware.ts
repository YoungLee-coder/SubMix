/**
 * API 路由中间件管道
 *
 * 将 CORS 检查、限流、错误处理等横切关注点从路由处理器中抽离，
 * 遵循优秀 Next.js 项目的 "thin route handler" 范式。
 */

import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/http/response";
import { forbidden, internalServerError, tooManyRequests } from "@/lib/http/errors";
import { buildCorsHeaders, evaluateCors } from "@/lib/security/cors";
import { checkRateLimit, type RateLimitOptions, type RateLimitResult } from "@/lib/security/rate-limit";
import { rateLimitHeaders } from "@/lib/http/headers";

export interface ApiContext {
  corsHeaders: Record<string, string>;
  rateLimit: RateLimitResult;
}

export interface ApiHandlerConfig {
  /** 允许的 HTTP 方法列表，用于 CORS 响应 */
  methods: string;
  /** 限流配置 */
  rateLimit: RateLimitOptions & { routeKey: string };
}

type ApiHandler = (
  request: NextRequest,
  ctx: ApiContext,
) => Promise<NextResponse> | NextResponse;

/**
 * 创建带有 CORS + 限流 + 错误兜底的 API 路由处理器。
 *
 * 用法：
 * ```ts
 * export const POST = withApiHandler(
 *   { methods: "POST, OPTIONS", rateLimit: { routeKey: "convert:post", limit: 30, windowMs: 60_000 } },
 *   async (request, { corsHeaders, rateLimit }) => {
 *     // 业务逻辑
 *   }
 * );
 * ```
 */
export function withApiHandler(config: ApiHandlerConfig, handler: ApiHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const cors = evaluateCors(request);
    const corsHeaders = buildCorsHeaders(cors, config.methods);

    if (!cors.allowed) {
      return fail(forbidden("跨域请求来源不在白名单中"), { headers: corsHeaders });
    }

    const rateLimit = checkRateLimit(request, config.rateLimit.routeKey, {
      limit: config.rateLimit.limit,
      windowMs: config.rateLimit.windowMs,
    });

    if (!rateLimit.success) {
      return fail(tooManyRequests("请求过于频繁，请稍后再试"), {
        headers: {
          ...corsHeaders,
          ...rateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
        },
      });
    }

    const ctx: ApiContext = { corsHeaders, rateLimit };

    try {
      return await handler(request, ctx);
    } catch (error) {
      console.error(`[${config.rateLimit.routeKey}] 未捕获异常:`, error);
      return fail(internalServerError("服务器内部错误"), {
        headers: {
          ...corsHeaders,
          ...rateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
        },
      });
    }
  };
}

/**
 * 创建标准 OPTIONS 预检处理器
 */
export function createOptionsHandler(methods: string) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const cors = evaluateCors(request);
    if (!cors.allowed) {
      return fail(forbidden("跨域请求来源不在白名单中"));
    }

    return new NextResponse(null, {
      status: 204,
      headers: buildCorsHeaders(cors, methods),
    });
  };
}
