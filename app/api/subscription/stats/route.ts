import { NextRequest, NextResponse } from "next/server";
import { fail, ok } from "@/lib/http/response";
import { forbidden, internalServerError, tooManyRequests } from "@/lib/http/errors";
import { buildCorsHeaders, evaluateCors } from "@/lib/security/cors";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getCacheStats } from "@/lib/subscription-cache";

function createRateHeaders(remaining: number, retryAfterSeconds: number): Record<string, string> {
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
    headers: buildCorsHeaders(cors, "GET, OPTIONS"),
  });
}

export async function GET(request: NextRequest) {
  const cors = evaluateCors(request);
  const corsHeaders = buildCorsHeaders(cors, "GET, OPTIONS");
  if (!cors.allowed) {
    return fail(forbidden("跨域请求来源不在白名单中"), { headers: corsHeaders });
  }

  const rate = checkRateLimit(request, "subscription:stats:get", {
    limit: 20,
    windowMs: 60 * 1000,
  });
  if (!rate.success) {
    return fail(tooManyRequests("请求过于频繁，请稍后再试"), {
      headers: { ...corsHeaders, ...createRateHeaders(rate.remaining, rate.retryAfterSeconds) }
    });
  }

  if (process.env.NODE_ENV !== "development") {
    return fail(forbidden("此接口仅在开发环境可用"), {
      headers: { ...corsHeaders, ...createRateHeaders(rate.remaining, rate.retryAfterSeconds) }
    });
  }

  try {
    return ok({
      cache: getCacheStats(),
      note: "缓存为临时内存存储，不保证跨实例或重启可用",
    }, {
      headers: {
        ...corsHeaders,
        ...createRateHeaders(rate.remaining, rate.retryAfterSeconds),
      }
    });
  } catch {
    return fail(internalServerError("获取统计信息失败"), {
      headers: { ...corsHeaders, ...createRateHeaders(rate.remaining, rate.retryAfterSeconds) }
    });
  }
}
