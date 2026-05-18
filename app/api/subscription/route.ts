import { z } from "zod";
import { NextResponse } from "next/server";
import { fail, ok } from "@/lib/http/response";
import {
  badRequest,
  internalServerError,
  notFound,
  payloadTooLarge,
  serviceUnavailable,
} from "@/lib/http/errors";
import { withApiHandler, createOptionsHandler } from "@/lib/http/middleware";
import { rateLimitHeaders, yamlDownloadHeaders } from "@/lib/http/headers";
import { parseJsonBody, parseMaxBytes } from "@/lib/security/request-validation";
import { getConfigById } from "@/lib/subscription-cache";
import { publishSubscription } from "@/features/proxy/application/publish-subscription";

const createConfigSchema = z.object({
  config: z.string().min(1, "配置内容不能为空"),
});

const SUBSCRIPTION_BODY_MAX_BYTES = parseMaxBytes(
  "MAX_SUBSCRIPTION_BODY_BYTES",
  300 * 1024,
);

const METHODS = "GET, POST, OPTIONS";

export const OPTIONS = createOptionsHandler(METHODS);

export const POST = withApiHandler(
  { methods: METHODS, rateLimit: { routeKey: "subscription:post", limit: 20, windowMs: 60_000 } },
  async (request, { corsHeaders, rateLimit }) => {
    const headers = {
      ...corsHeaders,
      ...rateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
    };

    const parsed = await parseJsonBody(request, createConfigSchema, SUBSCRIPTION_BODY_MAX_BYTES);
    if (!parsed.success) {
      const validationError =
        parsed.status === 413
          ? payloadTooLarge(parsed.error, parsed.issues)
          : badRequest(parsed.error, parsed.issues);
      return fail(validationError, { headers });
    }

    const published = publishSubscription(parsed.data.config);
    if (!published.success) {
      const publishError =
        published.status === 413
          ? payloadTooLarge(published.error ?? "配置内容过大")
          : published.status === 503
            ? serviceUnavailable(published.error ?? "缓存已满，请稍后重试")
            : internalServerError(published.error ?? "配置保存失败");
      return fail(publishError, { headers });
    }

    return ok(
      {
        id: published.id,
        expiresIn: published.expiresInMinutes,
        expiresAt: published.expiresAt,
        warning: "临时链接可能因缓存淘汰提前失效",
      },
      { headers },
    );
  },
);

export const GET = withApiHandler(
  { methods: METHODS, rateLimit: { routeKey: "subscription:get", limit: 60, windowMs: 60_000 } },
  async (request, { corsHeaders, rateLimit }) => {
    const headers = {
      ...corsHeaders,
      ...rateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
    };

    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return fail(badRequest("缺少配置ID"), { headers });
    }

    const entry = getConfigById(id);
    if (!entry) {
      return fail(notFound("配置不存在或已过期"), { headers });
    }

    return new NextResponse(entry.config, {
      status: 200,
      headers: { ...yamlDownloadHeaders("config.yaml"), ...headers },
    });
  },
);
