import { z } from 'zod';
import { ok, fail } from '@/lib/http/response';
import { badRequest, payloadTooLarge } from '@/lib/http/errors';
import { withApiHandler, createOptionsHandler } from '@/lib/http/middleware';
import { rateLimitHeaders } from '@/lib/http/headers';
import { parseJsonBody, parseMaxBytes } from '@/lib/security/request-validation';
import { generateProxyConfig } from '@/features/proxy/application/generate-config';
import { parseProxyLinks } from '@/features/proxy/application/parse-links';

interface ConvertResponseData {
  yaml: string;
  proxies: number;
}

const convertSchema = z.object({
  links: z.array(z.string().min(1)).min(1),
  configType: z.enum(['simple', 'full']).default('full'),
});

const CONVERT_REQUEST_MAX_BYTES = parseMaxBytes('MAX_CONVERT_REQUEST_BYTES', 256 * 1024);

const METHODS = 'POST, OPTIONS';
const RATE_LIMIT_CONFIG = { routeKey: 'convert:post', limit: 30, windowMs: 60_000 };

export const OPTIONS = createOptionsHandler(METHODS);

export const POST = withApiHandler(
  { methods: METHODS, rateLimit: RATE_LIMIT_CONFIG },
  async (request, { corsHeaders, rateLimit }) => {
    const headers = {
      ...corsHeaders,
      ...rateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
    };

    const parsedBody = await parseJsonBody(request, convertSchema, CONVERT_REQUEST_MAX_BYTES);
    if (!parsedBody.success) {
      const error = parsedBody.status === 413
        ? payloadTooLarge(parsedBody.error, parsedBody.issues)
        : badRequest(parsedBody.error, parsedBody.issues);
      return fail(error, { headers });
    }

    const { links, configType } = parsedBody.data;
    const parsedLinks = parseProxyLinks(links);

    if (parsedLinks.links.length === 0) {
      return fail(badRequest('没有找到有效的连接串'), { headers });
    }

    if (parsedLinks.proxies.length === 0) {
      return fail(
        badRequest('没有成功解析到任何有效的服务节点，请检查连接串格式是否正确'),
        { headers },
      );
    }

    const { yaml, proxyCount } = generateProxyConfig({
      proxies: parsedLinks.proxies,
      configType,
    });

    return ok<ConvertResponseData>({ yaml, proxies: proxyCount }, { headers });
  },
);
