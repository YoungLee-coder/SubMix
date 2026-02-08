// 配置缓存统计API - 仅开发环境可用

import { NextResponse } from 'next/server';

// 由于无法直接访问父级的 configCache，这里创建一个统计接口
// 在生产环境中应该移除或加强安全验证

export async function GET() {
  // 仅在开发环境提供统计信息
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: '此接口仅在开发环境可用' },
      { status: 403 }
    );
  }

  try {
    // 这里由于作用域限制，我们返回一个说明
    return NextResponse.json({
      message: '缓存统计',
      note: '详细统计信息请查看服务器控制台日志',
      endpoints: {
        'POST /api/subscription': '存储配置并获取配置ID',
        'GET /api/subscription?id=xxx': '获取指定配置',
        'GET /api/subscription/stats': '获取缓存统计（仅开发环境）'
      },
      expiration: {
        time: '30分钟',
        cleanup: '每5分钟自动清理过期数据',
        immediate: '访问时检查并立即删除过期数据'
      }
    });
  } catch {
    return NextResponse.json(
      { error: '获取统计信息失败' },
      { status: 500 }
    );
  }
}
