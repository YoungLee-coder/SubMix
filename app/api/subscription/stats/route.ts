import { ok, fail } from "@/lib/http/response";
import { forbidden } from "@/lib/http/errors";
import { withApiHandler, createOptionsHandler } from "@/lib/http/middleware";
import { rateLimitHeaders } from "@/lib/http/headers";
import { getCacheStats } from "@/lib/subscription-cache";

const METHODS = "GET, OPTIONS";

export const OPTIONS = createOptionsHandler(METHODS);

export const GET = withApiHandler(
  { methods: METHODS, rateLimit: { routeKey: "subscription:stats:get", limit: 20, windowMs: 60_000 } },
  async (_request, { corsHeaders, rateLimit }) => {
    const headers = {
      ...corsHeaders,
      ...rateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
    };

    if (process.env.NODE_ENV !== "development") {
      return fail(forbidden("此接口仅在开发环境可用"), { headers });
    }

    return ok(
      {
        cache: getCacheStats(),
        note: "缓存为临时内存存储，不保证跨实例或重启可用",
      },
      { headers },
    );
  },
);
