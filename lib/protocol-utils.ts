// 协议相关的工具函数

import { ProxyParser } from '@/lib/proxy-parser';
import type { ParsedProxy, ProtocolIconMap } from '@/types/proxy';
import { Shield, Network, Server, type LucideIcon } from 'lucide-react';

// 协议图标和颜色映射
export const protocolIconMap: ProtocolIconMap = {
  vless: {
    icon: 'Shield',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    name: 'VLESS'
  },
  hysteria: {
    icon: 'Network',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    name: 'Hysteria'
  },
  hysteria2: {
    icon: 'Network',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    name: 'Hysteria2'
  },
  ss: {
    icon: 'Server',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    name: 'Shadowsocks'
  },
  ss2022: {
    icon: 'Server',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    name: 'SS2022'
  },
  trojan: {
    icon: 'Shield',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    name: 'Trojan'
  },
  default: {
    icon: 'Server',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    name: 'Unknown'
  }
};

// 获取协议显示类型（根据加密方法判断SS/SS2022）
export function getDisplayProtocolType(proxy: ParsedProxy): string {
  if (proxy.type === 'ss' && proxy.cipher && ProxyParser.isSSR2022Cipher(proxy.cipher)) {
    return 'ss2022';
  }
  return proxy.type;
}

// 获取协议图标组件
export function getProtocolIcon(type: string): LucideIcon {
  switch (type) {
    case "vless": 
    case "trojan": 
      return Shield;
    case "hysteria":
    case "hysteria2": 
      return Network;
    case "ss":
    case "ss2022": 
    default: 
      return Server;
  }
}

// 获取协议颜色类名
export function getProtocolColor(type: string): string {
  return protocolIconMap[type]?.color || protocolIconMap.default.color;
}

// 获取协议名称
export function getProtocolName(type: string): string {
  return protocolIconMap[type]?.name || protocolIconMap.default.name;
}

// 获取协议图标的背景色类名
export function getProtocolIconBackground(type: string): string {
  const colorMap: Record<string, string> = {
    'vless': 'bg-blue-100 dark:bg-blue-900/20',
    'hysteria': 'bg-indigo-100 dark:bg-indigo-900/20',
    'hysteria2': 'bg-purple-100 dark:bg-purple-900/20',
    'ss': 'bg-green-100 dark:bg-green-900/20',
    'ss2022': 'bg-emerald-100 dark:bg-emerald-900/20',
    'trojan': 'bg-red-100 dark:bg-red-900/20',
    'default': 'bg-gray-100 dark:bg-gray-900/20'
  };
  
  return colorMap[type] || colorMap.default;
}
