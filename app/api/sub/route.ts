// 节点转换 API - 类似 Sub Converter
// 通过 URL 参数传入单个或多个节点链接，直接返回 Mihomo 配置文件

import { NextRequest, NextResponse } from 'next/server';
import { ProxyParser } from '@/lib/proxy-parser';
import { MihomoConfigGenerator } from '@/lib/mihomo-config';

/**
 * POST: 节点转换接口（推荐，无需手动 URL 编码）
 * 
 * 请求体 (JSON):
 * {
 *   "urls": ["vless://xxx#香港节点", "ss://yyy#美国节点"],
 *   "type": "full",  // 可选: simple | full
 *   "mode": "whitelist"  // 可选: whitelist | blacklist
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls, type = 'full', mode = 'whitelist' } = body;

    // 验证参数
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: '缺少节点链接数组 (urls)' },
        { status: 400 }
      );
    }

    // 过滤空链接
    const proxyLinks = urls.filter((link: string) => link && link.trim().length > 0);

    if (proxyLinks.length === 0) {
      return NextResponse.json(
        { error: '没有找到有效的节点链接' },
        { status: 400 }
      );
    }

    // 验证配置类型
    const configType = type === 'simple' ? 'simple' : 'full';
    const ruleMode = mode === 'blacklist' ? 'blacklist' : 'whitelist';

    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log(`📡 节点转换请求 (POST): 链接数=${proxyLinks.length}, Type=${configType}, Mode=${ruleMode}`);
    }

    // 解析服务节点
    const proxies = ProxyParser.parseMultipleProxies(proxyLinks);

    if (proxies.length === 0) {
      return NextResponse.json(
        { error: '没有找到有效的服务节点，请检查连接串格式' },
        { status: 400 }
      );
    }

    // 生成配置
    const config = configType === 'simple'
      ? MihomoConfigGenerator.generateSimpleConfig(proxies, ruleMode)
      : MihomoConfigGenerator.generateConfig(proxies, ruleMode);

    // 转换为 YAML
    const yaml = MihomoConfigGenerator.configToYaml(config);

    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ 节点转换成功 (POST): 解析了 ${proxies.length} 个节点`);
    }

    // 返回 YAML 配置文件
    return new NextResponse(yaml, {
      status: 200,
      headers: {
        'Content-Type': 'text/yaml; charset=utf-8',
        'Content-Disposition': 'attachment; filename="mihomo-config.yaml"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('节点转换失败 (POST):', error);

    return NextResponse.json(
      {
        error: '节点转换失败',
        details: error instanceof Error ? error.message : '服务器内部错误'
      },
      { status: 500 }
    );
  }
}

/**
 * GET: 节点转换接口（需要 URL 编码）
 * 
 * 查询参数:
 * - url: 单个节点链接 (可以传入多个 url 参数，需要进行 URL 编码)
 * - urls: 多个节点链接，用 | 分隔 (可选，与 url 参数二选一或组合使用)
 * - type: 配置类型 simple | full (可选，默认: full)
 * - mode: 路由模式 whitelist | blacklist (可选，默认: whitelist)
 * 
 * 注意: 节点链接中如果包含中文或特殊字符，必须进行 URL 编码
 * 
 * 示例:
 * /api/sub?url=vless://xxx
 * /api/sub?url=vless://xxx&url=ss://yyy
 * /api/sub?urls=vless://xxx|ss://yyy|trojan://zzz
 * /api/sub?url=vless://xxx&type=simple&mode=blacklist
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 收集所有节点链接
    const proxyLinks: string[] = [];
    
    // 方式1: 获取所有 url 参数 (searchParams.getAll 会自动进行 URL 解码)
    const urlParams = searchParams.getAll('url');
    if (urlParams.length > 0) {
      proxyLinks.push(...urlParams.filter(link => link.trim().length > 0));
    }
    
    // 方式2: 获取 urls 参数（用 | 分隔，会自动进行 URL 解码）
    const urlsParam = searchParams.get('urls');
    if (urlsParam) {
      const links = urlsParam.split('|').filter(link => link.trim().length > 0);
      proxyLinks.push(...links);
    }
    
    // 检查是否有节点链接
    if (proxyLinks.length === 0) {
      return NextResponse.json(
        { error: '缺少节点链接参数 (url 或 urls)' },
        { status: 400 }
      );
    }

    // 获取配置类型 (simple 或 full，默认为 full)
    const configType = searchParams.get('type') === 'simple' ? 'simple' : 'full';
    
    // 获取路由模式 (whitelist 或 blacklist，默认为 whitelist)
    const ruleMode = searchParams.get('mode') === 'blacklist' ? 'blacklist' : 'whitelist';

    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log(`📡 节点转换请求: 链接数=${proxyLinks.length}, Type=${configType}, Mode=${ruleMode}`);
    }

    // 解析服务节点
    const proxies = ProxyParser.parseMultipleProxies(proxyLinks);
    
    if (proxies.length === 0) {
      return NextResponse.json(
        { error: '没有找到有效的服务节点，请检查连接串格式' },
        { status: 400 }
      );
    }

    // 生成配置
    const config = configType === 'simple' 
      ? MihomoConfigGenerator.generateSimpleConfig(proxies, ruleMode)
      : MihomoConfigGenerator.generateConfig(proxies, ruleMode);

    // 转换为 YAML
    const yaml = MihomoConfigGenerator.configToYaml(config);

    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ 节点转换成功: 解析了 ${proxies.length} 个节点`);
    }

    // 返回 YAML 配置文件
    return new NextResponse(yaml, {
      status: 200,
      headers: {
        'Content-Type': 'text/yaml; charset=utf-8',
        'Content-Disposition': 'attachment; filename="mihomo-config.yaml"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('节点转换失败:', error);
    
    return NextResponse.json(
      { 
        error: '节点转换失败',
        details: error instanceof Error ? error.message : '服务器内部错误'
      },
      { status: 500 }
    );
  }
}

