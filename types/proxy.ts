// 前端节点相关类型定义

import type { ProxyNode } from '@/lib/proxy-parser';

export interface ParsedProxy extends ProxyNode {
  id: string;
}

export type InputMode = "single" | "batch";
export type RuleMode = "whitelist" | "blacklist";

// 编辑表单字段配置
export interface FormFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'password';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  description?: string;
  group?: string;
  defaultValue?: string | number | boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// 协议编辑配置
export interface ProtocolEditConfig {
  type: string;
  name: string;
  icon: string;
  color: string;
  fields: FormFieldConfig[];
}

// 编辑配置响应类型
export interface EditConfigResponse {
  success: boolean;
  protocols: ProtocolEditConfig[];
  error?: string;
}

// 协议图标映射
export interface ProtocolIconInfo {
  icon: string;
  color: string;
  name: string;
}

export type ProtocolIconMap = Record<string, ProtocolIconInfo>;

