/**
 * 协议配置模块统一导出
 */

// 导出配置生成器
export {
  getAllProtocolConfigs,
  getProtocolConfig,
  getProtocolConfigsByCategory,
  validateProtocolConfigs,
  getProtocolStats
} from './generator';

// 导出字段分组
export { fieldGroups, type FieldGroupKey } from './base/field-groups';

// 导出公共字段（供扩展使用）
export * from './base/common-fields';
export * from './base/field-types';

// 导出具体协议配置（供直接使用）
export { vlessConfig } from './protocols/vless.config';
export { hysteriaConfig } from './protocols/hysteria.config';
export { hysteria2Config } from './protocols/hysteria2.config';
export { shadowsocksConfig, ss2022Config } from './protocols/shadowsocks.config';
export { trojanConfig } from './protocols/trojan.config';
export { anytlsConfig } from './protocols/anytls.config';
