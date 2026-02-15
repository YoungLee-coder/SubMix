import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fail, ok } from '@/lib/http/response';
import { badRequest, forbidden, internalServerError, payloadTooLarge, tooManyRequests } from '@/lib/http/errors';
import { buildCorsHeaders, evaluateCors } from '@/lib/security/cors';
import { parseJsonBody, parseMaxBytes } from '@/lib/security/request-validation';
import { checkRateLimit } from '@/lib/security/rate-limit';
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

function createRateHeaders(remaining: number, retryAfterSeconds: number): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(remaining),
    'Retry-After': String(retryAfterSeconds)
  };
}

export async function OPTIONS(request: NextRequest) {
  const cors = evaluateCors(request);
  if (!cors.allowed) {
    return fail(forbidden('跨域请求来源不在白名单中'));
  }

  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(cors, 'POST, OPTIONS')
  });
}

export async function POST(request: NextRequest) {
  const cors = evaluateCors(request);
  const corsHeaders = buildCorsHeaders(cors, 'POST, OPTIONS');
  if (!cors.allowed) {
    return fail(forbidden('跨域请求来源不在白名单中'), { headers: corsHeaders });
  }

  const rate = checkRateLimit(request, 'convert:post', {
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (!rate.success) {
    return fail(tooManyRequests('请求过于频繁，请稍后再试'), {
      headers: { ...corsHeaders, ...createRateHeaders(rate.remaining, rate.retryAfterSeconds) }
    });
  }

  try {
    const parsedBody = await parseJsonBody(request, convertSchema, CONVERT_REQUEST_MAX_BYTES);
    if (!parsedBody.success) {
      const error = parsedBody.status === 413
        ? payloadTooLarge(parsedBody.error, parsedBody.issues)
        : badRequest(parsedBody.error, parsedBody.issues);

      return fail(error, {
        headers: { ...corsHeaders, ...createRateHeaders(rate.remaining, rate.retryAfterSeconds) }
      });
    }

    const { links, configType } = parsedBody.data;

    const parsedLinks = parseProxyLinks(links);
    const validLinks = parsedLinks.links;

    if (validLinks.length === 0) {
      return fail(badRequest('没有找到有效的连接串'), {
        headers: { ...corsHeaders, ...createRateHeaders(rate.remaining, rate.retryAfterSeconds) }
      });
    }

    const proxies = parsedLinks.proxies;

    if (proxies.length === 0) {
      return fail(badRequest('没有成功解析到任何有效的服务节点，请检查连接串格式是否正确'), {
        headers: { ...corsHeaders, ...createRateHeaders(rate.remaining, rate.retryAfterSeconds) }
      });
    }

    const { yaml, proxyCount } = generateProxyConfig({
      proxies,
      configType,
    });

    return ok<ConvertResponseData>({
      yaml,
      proxies: proxyCount
    }, { headers: { ...corsHeaders, ...createRateHeaders(rate.remaining, rate.retryAfterSeconds) } });

  } catch (error) {
    console.error('转换失败:', error);
    
    return fail(internalServerError('转换失败', error instanceof Error ? error.message : undefined), {
      headers: { ...corsHeaders, ...createRateHeaders(rate.remaining, rate.retryAfterSeconds) }
    });
  }
}
