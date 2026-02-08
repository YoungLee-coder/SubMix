// 主要的协议解析器入口类 - 重构后版本
// 导入所有具体的协议解析器

import type { ProxyNode, IProtocolParser } from './parsers/base';
import { VlessParser } from './parsers/vless';
import { HysteriaParser } from './parsers/hysteria';
import { Hysteria2Parser } from './parsers/hysteria2';
import { ShadowsocksParser } from './parsers/shadowsocks';
import { TrojanParser } from './parsers/trojan';

// 重新导出常用接口和类型，保持向后兼容
export type { ProxyNode } from './parsers/base';

/**
 * 协议解析器主入口类
 * 统一管理所有协议解析器，提供统一的解析接口
 */
export class ProxyParser {
  // 初始化所有协议解析器实例
  private static readonly parsers: IProtocolParser[] = [
    new VlessParser(),
    new HysteriaParser(),
    new Hysteria2Parser(),
    new ShadowsocksParser(),
    new TrojanParser(),
  ];

  /**
   * 检测是否为SS2022加密方法 - 兼容旧版本API
   */
  public static isSSR2022Cipher(cipher: string): boolean {
    return ShadowsocksParser.isSSR2022Cipher(cipher);
  }

  /**
   * 获取支持的 Shadowsocks 加密方法 - 兼容旧版本API
   */
  static getSupportedSSMethods(): string[] {
    return ShadowsocksParser.getSupportedSSMethods();
  }

  /**
   * 获取允许的插件名称列表 - 兼容旧版本API
   */
  static getAllowedPlugins(): string[] {
    return ShadowsocksParser.getAllowedPlugins();
  }

  /**
   * 解析 VLESS 链接 - 兼容旧版本API
   */
  static parseVless(url: string): ProxyNode | null {
    const parser = new VlessParser();
    return parser.parse(url);
  }

  /**
   * 解析 Hysteria2 链接 - 兼容旧版本API
   */
  static parseHysteria2(url: string): ProxyNode | null {
    const parser = new Hysteria2Parser();
    return parser.parse(url);
  }

  /**
   * 解析 Shadowsocks 链接 - 兼容旧版本API
   */
  static parseShadowsocks(url: string): ProxyNode | null {
    const parser = new ShadowsocksParser();
    return parser.parse(url);
  }

  /**
   * 解析 Trojan 链接 - 兼容旧版本API
   */
  static parseTrojan(url: string): ProxyNode | null {
    const parser = new TrojanParser();
    return parser.parse(url);
  }

  /**
   * 自动检测并解析协议连接串
   * 遍历所有已注册的解析器，找到第一个支持该协议的解析器进行解析
   */
  static parseProxy(url: string): ProxyNode | null {
    const trimmedUrl = url.trim();
    
    // 遍历所有解析器，找到支持该协议的解析器
    for (const parser of this.parsers) {
      if (parser.supports(trimmedUrl)) {
        const result = parser.parse(trimmedUrl);
        if (result) {
          return result;
        }
      }
    }
    
    // 如果没有找到支持的协议解析器
    const protocol = trimmedUrl.split('://')[0];
    console.error('不支持的协议类型:', protocol);
    return null;
  }

  /**
   * 解析多个协议连接串
   */
  static parseMultipleProxies(urls: string[]): ProxyNode[] {
    const proxies: ProxyNode[] = [];
    
    for (const url of urls) {
      const proxy = this.parseProxy(url);
      if (proxy) {
        proxies.push(proxy);
      }
    }
    
    return proxies;
  }

  /**
   * 获取所有支持的协议列表
   */
  static getSupportedProtocols(): string[] {
    const protocols: string[] = [];
    
    // 收集所有解析器支持的协议
    const testUrls = [
      'vless://',
      'hysteria2://',
      'hy2://',
      'ss://',
      'trojan://'
    ];
    
    for (const testUrl of testUrls) {
      for (const parser of this.parsers) {
        if (parser.supports(testUrl)) {
          const protocol = testUrl.replace('://', '');
          if (!protocols.includes(protocol)) {
            protocols.push(protocol);
          }
        }
      }
    }
    
    return protocols;
  }

  /**
   * 注册新的协议解析器
   * 允许动态添加新的协议支持
   */
  static registerParser(parser: IProtocolParser): void {
    if (parser && typeof parser.supports === 'function' && typeof parser.parse === 'function') {
      this.parsers.push(parser);
      console.info('成功注册新的协议解析器');
    } else {
      console.error('无效的协议解析器，必须实现 supports 和 parse 方法');
    }
  }

  /**
   * 获取解析器统计信息
   */
  static getParserStats(): { totalParsers: number; supportedProtocols: string[] } {
    return {
      totalParsers: this.parsers.length,
      supportedProtocols: this.getSupportedProtocols()
    };
  }
}
