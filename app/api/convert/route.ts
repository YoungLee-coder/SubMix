import { NextRequest, NextResponse } from 'next/server';
import { ProxyParser } from '@/lib/proxy-parser';
import { MihomoConfigGenerator } from '@/lib/mihomo-config';

export interface ConvertRequest {
  links: string[];
  configType: 'simple' | 'full';
}

export interface ConvertResponse {
  success: boolean;
  yaml?: string;
  proxies?: number;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ConvertRequest;
    const { links, configType } = body;

    if (!links || !Array.isArray(links) || links.length === 0) {
      return NextResponse.json<ConvertResponse>({
        success: false,
        error: '请提供有效的连接串数组'
      }, { status: 400 });
    }

    // 过滤空行和无效链接
    const validLinks = links
      .map(link => link.trim())
      .filter(link => link.length > 0);

    if (validLinks.length === 0) {
      return NextResponse.json<ConvertResponse>({
        success: false,
        error: '没有找到有效的连接串'
      }, { status: 400 });
    }

    // 解析协议连接串
    const proxies = ProxyParser.parseMultipleProxies(validLinks);

    if (proxies.length === 0) {
      return NextResponse.json<ConvertResponse>({
        success: false,
        error: '没有成功解析到任何有效的服务节点，请检查连接串格式是否正确'
      }, { status: 400 });
    }

    // 生成配置
    const config = configType === 'full' 
      ? MihomoConfigGenerator.generateConfig(proxies)
      : MihomoConfigGenerator.generateSimpleConfig(proxies);

    // 转换为 YAML
    const yaml = MihomoConfigGenerator.configToYaml(config);

    return NextResponse.json<ConvertResponse>({
      success: true,
      yaml,
      proxies: proxies.length
    });

  } catch (error) {
    console.error('转换失败:', error);
    
    return NextResponse.json<ConvertResponse>({
      success: false,
      error: error instanceof Error ? error.message : '服务器内部错误'
    }, { status: 500 });
  }
}
