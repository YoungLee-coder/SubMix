import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { fail, ok } from "@/lib/http/response";
import {
  badRequest,
  forbidden,
  internalServerError,
  notFound,
  payloadTooLarge,
  serviceUnavailable,
  tooManyRequests,
} from "@/lib/http/errors";
import { buildCorsHeaders, evaluateCors } from "@/lib/security/cors";
import { parseJsonBody, parseMaxBytes } from "@/lib/security/request-validation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  getConfigById,
} from "@/lib/subscription-cache";
import { publishSubscription } from "@/features/proxy/application/publish-subscription";

const createConfigSchema = z.object({
  config: z.string().min(1, "配置内容不能为空"),
});

const SUBSCRIPTION_BODY_MAX_BYTES = parseMaxBytes(
  "MAX_SUBSCRIPTION_BODY_BYTES",
  300 * 1024,
);

function createRateLimitHeaders(remaining: number, retryAfterSeconds: number): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(remaining),
    "Retry-After": String(retryAfterSeconds),
  };
}

export async function OPTIONS(request: NextRequest) {
  const cors = evaluateCors(request);
  if (!cors.allowed) {
    return fail(forbidden("跨域请求来源不在白名单中"));
  }

  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(cors, "GET, POST, OPTIONS"),
  });
}

export async function POST(request: NextRequest) {
  const cors = evaluateCors(request);
  const corsHeaders = buildCorsHeaders(cors, "GET, POST, OPTIONS");

  if (!cors.allowed) {
    return fail(forbidden("跨域请求来源不在白名单中"), { headers: corsHeaders });
  }

  const rateLimit = checkRateLimit(request, "subscription:post", {
    limit: 20,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.success) {
    return fail(tooManyRequests("请求过于频繁，请稍后再试"), {
      headers: {
        ...corsHeaders,
        ...createRateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
      },
    });
  }

  try {
    const parsed = await parseJsonBody(request, createConfigSchema, SUBSCRIPTION_BODY_MAX_BYTES);
    if (!parsed.success) {
      const validationError =
        parsed.status === 413
          ? payloadTooLarge(parsed.error, parsed.issues)
          : badRequest(parsed.error, parsed.issues);

      return fail(validationError, {
        headers: {
          ...corsHeaders,
          ...createRateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
        },
      });
    }

    const published = publishSubscription(parsed.data.config);
    if (!published.success) {
      const publishError =
        published.status === 413
          ? payloadTooLarge(published.error ?? "配置内容过大")
          : published.status === 503
            ? serviceUnavailable(published.error ?? "缓存已满，请稍后重试")
            : internalServerError(published.error ?? "配置保存失败");

      return fail(publishError, {
        headers: {
          ...corsHeaders,
          ...createRateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
        },
      });
    }

    return ok(
      {
        id: published.id,
        expiresIn: published.expiresInMinutes,
        expiresAt: published.expiresAt,
        warning: "临时链接可能因缓存淘汰提前失效",
      },
      {
        headers: {
          ...corsHeaders,
          ...createRateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
        },
      },
    );
  } catch (error) {
    console.error("存储配置失败:", error);
    return fail(internalServerError("服务器内部错误"), {
      headers: {
        ...corsHeaders,
        ...createRateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
      },
    });
  }
}

export async function GET(request: NextRequest) {
  const cors = evaluateCors(request);
  const corsHeaders = buildCorsHeaders(cors, "GET, POST, OPTIONS");

  if (!cors.allowed) {
    return fail(forbidden("跨域请求来源不在白名单中"), { headers: corsHeaders });
  }

  const rateLimit = checkRateLimit(request, "subscription:get", {
    limit: 60,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.success) {
    return fail(tooManyRequests("请求过于频繁，请稍后再试"), {
      headers: {
        ...corsHeaders,
        ...createRateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
      },
    });
  }

  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return fail(badRequest("缺少配置ID"), {
        headers: {
          ...corsHeaders,
          ...createRateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
        },
      });
    }

    const entry = getConfigById(id);
    if (!entry) {
      return fail(notFound("配置不存在或已过期"), {
        headers: {
          ...corsHeaders,
          ...createRateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
        },
      });
    }

    return new NextResponse(entry.config, {
      status: 200,
      headers: {
        "Content-Type": "text/yaml; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"config.yaml\"",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        ...corsHeaders,
        ...createRateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
      },
    });
  } catch (error) {
    console.error("获取配置失败:", error);
    return fail(internalServerError("服务器内部错误"), {
      headers: {
        ...corsHeaders,
        ...createRateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
      },
    });
  }
}

