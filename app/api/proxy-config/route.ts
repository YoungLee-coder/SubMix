/**
 * 协议配置 API 路由
 * 使用模块化架构提供协议编辑配置
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  getAllProtocolConfigs, 
  validateProtocolConfigs 
} from '@/lib/protocol-configs';
import { fail, ok } from '@/lib/http/response';
import { forbidden, tooManyRequests, internalServerError } from '@/lib/http/errors';
import { buildCorsHeaders, evaluateCors } from '@/lib/security/cors';
import { checkRateLimit } from '@/lib/security/rate-limit';

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
    headers: buildCorsHeaders(cors, 'GET, OPTIONS')
  });
}

/**
 * 获取协议配置
 */
export async function GET(request: NextRequest) {
  const cors = evaluateCors(request);
  const corsHeaders = buildCorsHeaders(cors, 'GET, OPTIONS');
  if (!cors.allowed) {
    return fail(forbidden('跨域请求来源不在白名单中'), { headers: corsHeaders });
  }

  const rate = checkRateLimit(request, 'proxy-config:get', {
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rate.success) {
    return fail(tooManyRequests('请求过于频繁，请稍后再试'), {
      headers: {
        ...corsHeaders,
        ...createRateHeaders(rate.remaining, rate.retryAfterSeconds)
      }
    });
  }

  try {
    // 验证配置完整性（开发时检查）
    if (process.env.NODE_ENV === 'development') {
      const validation = validateProtocolConfigs();
      if (!validation.valid) {
        console.warn('协议配置验证失败:', validation.errors);
      }
    }
    
    // 获取所有协议配置
    const protocolConfigs = getAllProtocolConfigs();
    
    return ok({ protocols: protocolConfigs }, {
      headers: {
        ...corsHeaders,
        ...createRateHeaders(rate.remaining, rate.retryAfterSeconds)
      }
    });
  } catch (error) {
    console.error('获取协议配置失败:', error);

    return fail(internalServerError('获取协议配置失败'), {
      headers: {
        ...corsHeaders,
        ...createRateHeaders(rate.remaining, rate.retryAfterSeconds)
      }
    });
  }
}

// 注意：FIELD_GROUPS 暂时未使用，如需要可通过 /lib/protocol-configs 直接导入
