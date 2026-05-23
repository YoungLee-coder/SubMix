// AnyTLS 协议解析器

import { BaseProtocolParser, ProxyNode, AnytlsConfig } from './base';

/**
 * AnyTLS 协议解析器
 *
 * 参考 Mihomo 官方文档：
 * https://wiki.metacubex.one/config/proxies/anytls/
 *
 * 由于 AnyTLS 暂无官方统一的 URI Scheme，这里采用与 Trojan/Hysteria2 一致的形式：
 *   anytls://password@server:port?param1=value1&param2=value2#name
 *
 * 支持的查询参数：
 *   sni, alpn, skip-cert-verify (allowInsecure), client-fingerprint,
 *   fingerprint, udp, idle-session-check-interval, idle-session-timeout,
 *   min-idle-session
 */
export class AnytlsParser extends BaseProtocolParser {
  /**
   * 检查是否支持 AnyTLS 协议
   */
  supports(url: string): boolean {
    return url.startsWith('anytls://');
  }

  /**
   * 获取支持的客户端指纹
   */
  public static getSupportedClientFingerprints(): string[] {
    return [
      'chrome',
      'firefox',
      'safari',
      'ios',
      'android',
      'edge',
      'random',
    ];
  }

  /**
   * 解析 AnyTLS 链接
   */
  parse(url: string): ProxyNode | null {
    try {
      if (!this.supports(url)) {
        throw new Error('不是有效的 AnyTLS 链接');
      }

      const urlObj = new URL(url);
      const password = decodeURIComponent(urlObj.username);
      const server = urlObj.hostname;
      const port = parseInt(urlObj.port) || 443;
      const name = decodeURIComponent(urlObj.hash.slice(1)) || `anytls-${server}`;
      const params = this.parseUrlParams(urlObj.search);

      if (!password) {
        console.warn('AnyTLS 服务器密码为空');
      }

      const config: ProxyNode & AnytlsConfig = {
        name,
        type: 'anytls',
        server,
        port,
        password,
        udp: this.parseUdpParam(params.udp),
        id: this.generateId(),
      };

      this.parseTLSConfig(config, params);
      this.parseSessionConfig(config, params);

      return config;
    } catch (error) {
      console.error('解析 AnyTLS 链接失败:', error);
      return null;
    }
  }

  /**
   * 解析 TLS 相关配置
   */
  private parseTLSConfig(
    config: ProxyNode & AnytlsConfig,
    params: Record<string, string>,
  ): void {
    if (params.sni) {
      config.sni = params.sni;
    }

    if (params['skip-cert-verify'] || params.allowInsecure) {
      config['skip-cert-verify'] = this.parseBooleanParam(
        params['skip-cert-verify'] || params.allowInsecure,
      );
    }

    if (params.alpn) {
      const alpnList = params.alpn
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a);
      if (alpnList.length > 0) {
        config.alpn = alpnList;
      }
    } else {
      config.alpn = ['h2', 'http/1.1'];
    }

    if (params.fingerprint) {
      config.fingerprint = params.fingerprint;
    }

    const clientFp = params['client-fingerprint'] || params.clientFingerprint;
    if (clientFp) {
      if (AnytlsParser.getSupportedClientFingerprints().includes(clientFp)) {
        config['client-fingerprint'] = clientFp;
      } else {
        console.warn(`不支持的客户端指纹: ${clientFp}`);
      }
    }
  }

  /**
   * 解析空闲会话相关配置
   */
  private parseSessionConfig(
    config: ProxyNode & AnytlsConfig,
    params: Record<string, string>,
  ): void {
    const checkInterval =
      params['idle-session-check-interval'] || params.idleSessionCheckInterval;
    if (checkInterval !== undefined) {
      config['idle-session-check-interval'] = this.parseNumberParam(
        checkInterval,
        30,
      );
    }

    const timeout = params['idle-session-timeout'] || params.idleSessionTimeout;
    if (timeout !== undefined) {
      config['idle-session-timeout'] = this.parseNumberParam(timeout, 30);
    }

    const minIdle = params['min-idle-session'] || params.minIdleSession;
    if (minIdle !== undefined) {
      config['min-idle-session'] = this.parseNumberParam(minIdle, 0);
    }
  }
}
