// 配置托管API端点
// 支持Vercel等云平台部署，自动适配域名

import { NextRequest, NextResponse } from 'next/server';

// 存储配置的临时缓存 (生产环境建议使用Redis等持久化存储)
const configCache = new Map<string, { config: string; timestamp: number }>();

// 配置过期时间（30分钟）
const EXPIRE_TIME = 30 * 60 * 1000;

// 清理过期配置的函数
function cleanExpiredConfigs() {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [key, value] of configCache.entries()) {
    if (now - value.timestamp > EXPIRE_TIME) {
      configCache.delete(key);
      cleanedCount++;
    }
  }
  
  // 开发环境下打印清理日志
  if (process.env.NODE_ENV === 'development' && cleanedCount > 0) {
    console.log(`🧹 清理了 ${cleanedCount} 个过期配置，当前缓存大小: ${configCache.size}`);
  }
  
  return cleanedCount;
}

// 检查单个配置是否过期
function isConfigExpired(timestamp: number): boolean {
  return Date.now() - timestamp > EXPIRE_TIME;
}

// 获取配置剩余有效时间（分钟）
function getRemainingTime(timestamp: number): number {
  const remaining = EXPIRE_TIME - (Date.now() - timestamp);
  return Math.max(0, Math.ceil(remaining / (60 * 1000)));
}

// 定时清理器 - 每5分钟自动清理一次过期数据
let cleanupInterval: NodeJS.Timeout | null = null;

function startPeriodicCleanup() {
  // 避免重复启动定时器
  if (cleanupInterval) return;
  
  cleanupInterval = setInterval(() => {
    const cleaned = cleanExpiredConfigs();
    if (process.env.NODE_ENV === 'development' && cleaned > 0) {
      console.log(`⏰ 定时清理完成，清理了 ${cleaned} 个过期配置`);
    }
  }, 5 * 60 * 1000); // 每5分钟执行一次
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 启动定时清理器，每5分钟清理一次过期配置');
  }
}

// 启动定时清理（在模块加载时执行）
startPeriodicCleanup();

// 生成唯一ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// POST: 存储配置并返回配置ID
export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json();
    
    if (!config || typeof config !== 'string') {
      return NextResponse.json(
        { error: '配置内容不能为空' },
        { status: 400 }
      );
    }

    // 清理过期配置
    cleanExpiredConfigs();
    
    // 生成唯一ID并存储配置
    const id = generateId();
    const timestamp = Date.now();
    configCache.set(id, {
      config,
      timestamp
    });

    // 开发环境下记录配置存储
    if (process.env.NODE_ENV === 'development') {
      console.log(`💾 新配置存储: ID=${id}, 缓存大小=${configCache.size}, 有效期=30分钟`);
    }

    return NextResponse.json({ 
      id,
      expiresIn: 30, // 30分钟
      expiresAt: new Date(timestamp + EXPIRE_TIME).toISOString()
    });
  } catch (error) {
    console.error('存储配置失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// GET: 根据ID获取配置
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '缺少配置ID' },
        { status: 400 }
      );
    }

    // 清理过期配置
    cleanExpiredConfigs();
    
    const configData = configCache.get(id);
    
    if (!configData) {
      return NextResponse.json(
        { error: '配置不存在或已过期' },
        { status: 404 }
      );
    }

    // 检查配置是否已过期
    if (isConfigExpired(configData.timestamp)) {
      configCache.delete(id); // 立即删除过期配置
      return NextResponse.json(
        { error: '配置已过期，请重新生成' },
        { status: 410 } // 410 Gone - 资源已过期
      );
    }

    // 开发环境下记录配置访问
    if (process.env.NODE_ENV === 'development') {
      const remainingTime = getRemainingTime(configData.timestamp);
      console.log(`📥 配置访问: ID=${id}, 剩余时间=${remainingTime}分钟`);
    }

    // 返回配置文件，设置正确的Content-Type和CORS头
    return new NextResponse(configData.config, {
      status: 200,
      headers: {
        'Content-Type': 'text/yaml; charset=utf-8',
        'Content-Disposition': 'attachment; filename="config.yaml"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('获取配置失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

