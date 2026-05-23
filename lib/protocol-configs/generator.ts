/**
 * 协议配置生成器
 * 动态生成和组合协议配置
 */

import type { ProtocolEditConfig } from '@/types/proxy';
import { vlessConfig } from './protocols/vless.config';
import { hysteriaConfig } from './protocols/hysteria.config';
import { hysteria2Config } from './protocols/hysteria2.config';
import { shadowsocksConfig, ss2022Config } from './protocols/shadowsocks.config';
import { trojanConfig } from './protocols/trojan.config';
import { anytlsConfig } from './protocols/anytls.config';

/**
 * 获取所有协议配置
 */
export function getAllProtocolConfigs(): ProtocolEditConfig[] {
  return [
    vlessConfig,
    hysteriaConfig,
    hysteria2Config,
    shadowsocksConfig,
    ss2022Config,
    trojanConfig,
    anytlsConfig
  ];
}

/**
 * 根据协议类型获取配置
 */
export function getProtocolConfig(type: string): ProtocolEditConfig | undefined {
  return getAllProtocolConfigs().find(config => config.type === type);
}

/**
 * 获取协议配置按分类分组
 */
export function getProtocolConfigsByCategory() {
  const configs = getAllProtocolConfigs();
  
  return {
    modern: configs.filter(config => 
      ['vless', 'hysteria', 'hysteria2', 'anytls'].includes(config.type)
    ),
    classic: configs.filter(config => 
      ['ss', 'ss2022', 'trojan'].includes(config.type)
    )
  };
}

/**
 * 动态验证协议配置完整性
 */
export function validateProtocolConfigs(): {
  valid: boolean;
  errors: string[];
} {
  const configs = getAllProtocolConfigs();
  const errors: string[] = [];
  
  // 检查必需字段
  configs.forEach(config => {
    if (!config.type) {
      errors.push(`协议配置缺少 type 字段: ${config.name}`);
    }
    
    if (!config.name) {
      errors.push(`协议配置缺少 name 字段: ${config.type}`);
    }
    
    if (!config.fields || !Array.isArray(config.fields)) {
      errors.push(`协议配置缺少有效的 fields 字段: ${config.type}`);
    }
    
    // 检查基本字段是否存在
    const hasNameField = config.fields?.some(field => field.key === 'name');
    const hasServerField = config.fields?.some(field => field.key === 'server');
    const hasPortField = config.fields?.some(field => field.key === 'port');
    
    if (!hasNameField) {
      errors.push(`协议配置缺少 name 字段: ${config.type}`);
    }
    
    if (!hasServerField) {
      errors.push(`协议配置缺少 server 字段: ${config.type}`);
    }
    
    if (!hasPortField) {
      errors.push(`协议配置缺少 port 字段: ${config.type}`);
    }
  });
  
  // 检查类型唯一性
  const types = configs.map(config => config.type);
  const duplicateTypes = types.filter((type, index) => types.indexOf(type) !== index);
  
  if (duplicateTypes.length > 0) {
    errors.push(`发现重复的协议类型: ${duplicateTypes.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 获取协议统计信息
 */
export function getProtocolStats() {
  const configs = getAllProtocolConfigs();
  
  return {
    total: configs.length,
    byType: configs.reduce((acc, config) => {
      acc[config.type] = {
        name: config.name,
        fieldCount: config.fields?.length || 0,
        groups: [...new Set(config.fields?.map(field => field.group).filter((group): group is string => Boolean(group)) || [])]
      };
      return acc;
    }, {} as Record<string, { name: string; fieldCount: number; groups: string[] }>)
  };
}
