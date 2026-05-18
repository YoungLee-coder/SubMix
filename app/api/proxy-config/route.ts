/**
 * 协议配置 API 路由
 * 使用模块化架构提供协议编辑配置
 */

import {
  getAllProtocolConfigs,
  validateProtocolConfigs,
} from '@/lib/protocol-configs';
import { ok } from '@/lib/http/response';
import { withApiHandler, createOptionsHandler } from '@/lib/http/middleware';
import { rateLimitHeaders } from '@/lib/http/headers';

const METHODS = 'GET, OPTIONS';

export const OPTIONS = createOptionsHandler(METHODS);

/**
 * 获取协议配置
 */
export const GET = withApiHandler(
  { methods: METHODS, rateLimit: { routeKey: 'proxy-config:get', limit: 60, windowMs: 60_000 } },
  async (_request, { corsHeaders, rateLimit }) => {
    const headers = {
      ...corsHeaders,
      ...rateLimitHeaders(rateLimit.remaining, rateLimit.retryAfterSeconds),
    };

    // 验证配置完整性（开发时检查）
    if (process.env.NODE_ENV === 'development') {
      const validation = validateProtocolConfigs();
      if (!validation.valid) {
        console.warn('协议配置验证失败:', validation.errors);
      }
    }

    const protocolConfigs = getAllProtocolConfigs();

    return ok({ protocols: protocolConfigs }, { headers });
  },
);
