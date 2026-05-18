// 节点转换 API - 类似 Sub Converter
// 通过 URL 参数传入单个或多个节点链接，直接返回 Mihomo 配置文件

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fail } from '@/lib/http/response';
import { badRequest, payloadTooLarge } from '@/lib/http/errors';
import { withApiHandler, createOptionsHandler } from '@/lib/http/middleware';
import { rateLimitHeaders, yamlDownloadHeaders } from '@/lib/http/headers';
import { parseJsonBody, parseMaxBytes } from '@/lib/security/request-validation';
import { parseProxyLinks } from '@/features/proxy/application/parse-links';
import { generateProxyConfig } from '@/features/proxy/application/generate-config';

const postSubSchema = z.object({
  urls: z.array(z.string().min(1)).min(1),
  type: z.enum(['simple', 'full']).optional(),
  mode: z.enum(['whitelist', 'blacklist']).optional(),
});

const SUB_REQUEST_MAX_BYTES = parseMaxBytes('MAX_SUB_REQUEST_BYTES', 256 * 1024);
const METHODS = 'GET, POST, OPTIONS';

export const OPTIONS = createOptionsHandler(METHODS);

/**
 * POST: 节点转换接口（推荐，无需手动 URL 编码）
 */
export const POST = withApiHandler(
  { methods: METHODS, rateLimit: { routeKey: 'sub:post', limit: 30, windowMs: 60_000 } },
  async (request, { corsHeaders, rateLimit }) => {
    const headers = {
      ...corsHeaders,
      ...rateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
    };

    const parsedBody = await parseJsonBody(request, postSubSchema, SUB_REQUEST_MAX_BYTES);
    if (!parsedBody.success) {
      const error = parsedBody.status === 413
        ? payloadTooLarge(parsedBody.error, parsedBody.issues)
        : badRequest(parsedBody.error, parsedBody.issues);
      return fail(error, { headers });
    }

    const { urls, type = 'full', mode = 'whitelist' } = parsedBody.data;
    const parsedLinks = parseProxyLinks(urls);

    if (parsedLinks.links.length === 0) {
      return fail(badRequest('没有找到有效的节点链接'), { headers });
    }

    if (parsedLinks.proxies.length === 0) {
      return fail(badRequest('没有找到有效的服务节点，请检查连接串格式'), { headers });
    }

    const configType = type === 'simple' ? 'simple' : 'full';
    const ruleMode = mode === 'blacklist' ? 'blacklist' : 'whitelist';

    if (process.env.NODE_ENV === 'development') {
      console.log(`[sub:post] links=${parsedLinks.links.length}, type=${configType}, mode=${ruleMode}`);
    }

    const { yaml } = generateProxyConfig({ proxies: parsedLinks.proxies, configType, ruleMode });

    return new NextResponse(yaml, {
      status: 200,
      headers: { ...yamlDownloadHeaders('mihomo-config.yaml'), ...headers },
    });
  },
);

/**
 * GET: 节点转换接口（需要 URL 编码）
 *
 * 查询参数:
 * - url: 单个节点链接 (可传多个)
 * - urls: 多个节点链接，用 | 分隔
 * - type: simple | full (默认 full)
 * - mode: whitelist | blacklist (默认 whitelist)
 */
export const GET = withApiHandler(
  { methods: METHODS, rateLimit: { routeKey: 'sub:get', limit: 60, windowMs: 60_000 } },
  async (request, { corsHeaders, rateLimit }) => {
    const headers = {
      ...corsHeaders,
      ...rateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
    };

    const { searchParams } = new URL(request.url);

    // 收集所有节点链接
    const proxyLinks: string[] = [];
    const urlParams = searchParams.getAll('url');
    if (urlParams.length > 0) {
      proxyLinks.push(...urlParams.filter(link => link.trim().length > 0));
    }
    const urlsParam = searchParams.get('urls');
    if (urlsParam) {
      proxyLinks.push(...urlsParam.split('|').filter(link => link.trim().length > 0));
    }

    if (proxyLinks.length === 0) {
      return fail(badRequest('缺少节点链接参数 (url 或 urls)'), { headers });
    }

    const configType = searchParams.get('type') === 'simple' ? 'simple' : 'full';
    const ruleMode = searchParams.get('mode') === 'blacklist' ? 'blacklist' : 'whitelist';

    if (process.env.NODE_ENV === 'development') {
      console.log(`[sub:get] links=${proxyLinks.length}, type=${configType}, mode=${ruleMode}`);
    }

    const { proxies } = parseProxyLinks(proxyLinks);

    if (proxies.length === 0) {
      return fail(badRequest('没有找到有效的服务节点，请检查连接串格式'), { headers });
    }

    const { yaml } = generateProxyConfig({ proxies, configType, ruleMode });

    return new NextResponse(yaml, {
      status: 200,
      headers: { ...yamlDownloadHeaders('mihomo-config.yaml'), ...headers },
    });
  },
);
