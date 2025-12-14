// 基础协议解析器接口和工具类

export interface ProxyNode {
  name: string;
  type: string;
  server: string;
  port: number;
  id?: string;
   
  [key: string]: any;
}

/**
 * 协议解析器接口
 */
export interface IProtocolParser {
  /**
   * 解析协议链接
   * @param url 协议链接
   * @returns 解析后的代理节点，失败返回 null
   */
  parse(url: string): ProxyNode | null;
  
  /**
   * 检查是否支持该协议
   * @param url 协议链接
   */
  supports(url: string): boolean;
}

/**
 * 基础协议解析器抽象类
 */
export abstract class BaseProtocolParser implements IProtocolParser {
  abstract parse(url: string): ProxyNode | null;
  abstract supports(url: string): boolean;

  /**
   * 生成随机ID
   */
  protected generateId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 11; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 解析布尔值参数的通用方法
   */
  protected parseBooleanParam(value: string | undefined, defaultValue: boolean = false): boolean {
    if (!value) return defaultValue;
    
    const param = value.toLowerCase();
    if (param === 'true' || param === '1') return true;
    if (param === 'false' || param === '0') return false;
    
    return defaultValue;
  }

  /**
   * 解析数值参数的通用方法
   */
  protected parseNumberParam(value: string | undefined, defaultValue: number = 0): number {
    if (!value) return defaultValue;
    
    const num = parseInt(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * 解析 Base64 编码的字符串
   */
  protected decodeBase64(str: string): string {
    try {
      // 清理 Base64 字符串，移除可能的 URL 编码
      let cleanStr = str.trim();
      
      // 处理 URL 安全的 Base64 (替换 - 和 _ 为标准 Base64 字符)
      cleanStr = cleanStr.replace(/-/g, '+').replace(/_/g, '/');
      
      // 确保 Base64 字符串的长度是 4 的倍数
      while (cleanStr.length % 4) {
        cleanStr += '=';
      }
      
      return atob(cleanStr);
    } catch (error) {
      console.warn('Base64 解码失败:', str, error);
      // 如果不是有效的 Base64，直接返回原字符串
      return str;
    }
  }

  /**
   * 解析 URL 参数
   */
  protected parseUrlParams(search: string): Record<string, string> {
    const params: Record<string, string> = {};
    if (!search) return params;
    
    const urlParams = new URLSearchParams(search);
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
    return params;
  }

  /**
   * 解析UDP参数，支持多种格式
   * @param udpParam UDP参数值
   */
  protected parseUdpParam(udpParam: string | undefined): boolean {
    return this.parseBooleanParam(udpParam, true); // 默认为true
  }
}

// 协议特定的配置接口
export interface VlessConfig {
  uuid: string;
  network?: string;
  tls?: boolean;
  sni?: string;
  alpn?: string[];
  path?: string;
  host?: string;
  headers?: Record<string, string>;
  security?: string;
  flow?: string;
  'client-fingerprint'?: string;
}

export interface HysteriaConfig {
  'auth-str': string;
  obfs?: string;
  protocol?: string;
  up?: string;
  down?: string;
  sni?: string;
  'skip-cert-verify'?: boolean;
  alpn?: string[];
  'recv-window-conn'?: number;
  'recv-window'?: number;
  ca?: string;
  'ca-str'?: string;
  'disable_mtu_discovery'?: boolean;
  fingerprint?: string;
  'fast-open'?: boolean;
}

export interface Hysteria2Config {
  password: string;
  ports?: string;
  obfs?: string;
  'obfs-password'?: string;
  sni?: string;
  'skip-cert-verify'?: boolean;
  alpn?: string[];
  fingerprint?: string;
  ca?: string;
  'ca-str'?: string;
  up?: string;
  down?: string;
  'initial-stream-receive-window'?: number;
  'max-stream-receive-window'?: number;
  'initial-connection-receive-window'?: number;
  'max-connection-receive-window'?: number;
}

export interface ShadowsocksConfig {
  cipher: string;
  password: string;
  plugin?: string;
  'plugin-opts'?: Record<string, string | number | boolean>;
  // SS2022 专用字段
  'server-port'?: number;
}

export interface TrojanConfig {
  password: string;
  sni?: string;
  'skip-cert-verify'?: boolean;
  alpn?: string[];
  'client-fingerprint'?: string;
  fingerprint?: string;
  'reality-opts'?: {
    'public-key'?: string;
    'short-id'?: string;
  };
  'ss-opts'?: {
    enabled?: boolean;
    method?: string;
    password?: string;
  };
  network?: string;
  'ws-opts'?: {
    path?: string;
    headers?: Record<string, string>;
  };
  'grpc-opts'?: {
    'grpc-service-name'?: string;
  };
  smux?: {
    enabled?: boolean;
  };
}



