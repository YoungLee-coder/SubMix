/**
 * AnyTLS 协议配置
 */

import type { ProtocolEditConfig } from '@/types/proxy';
import {
  basicFields,
  createPortField,
  createPasswordField,
  clientFingerprintField,
  advancedFields,
} from '../base/common-fields';
import { defaultPorts } from '../base/field-types';

export const anytlsConfig: ProtocolEditConfig = {
  type: 'anytls',
  name: 'AnyTLS',
  icon: 'Shield',
  color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  fields: [
    // 基本信息
    ...basicFields,
    createPortField(defaultPorts.anytls),

    // 协议参数
    {
      ...createPasswordField('服务器密码', 'AnyTLS 服务器密码（必须）'),
      key: 'password',
    },

    // TLS 配置
    {
      key: 'sni',
      label: 'SNI',
      type: 'text',
      group: 'tls',
      placeholder: 'example.com',
      description: 'TLS Server Name Indication',
    },
    {
      key: 'alpn',
      label: 'ALPN 协议',
      type: 'text',
      group: 'tls',
      placeholder: 'h2,http/1.1',
      description: 'Application Layer Protocol Negotiation，逗号分隔',
    },
    clientFingerprintField,
    {
      key: 'fingerprint',
      label: '服务器指纹',
      type: 'text',
      group: 'tls',
      placeholder: 'xxxx',
      description: '服务器证书指纹',
    },
    {
      key: 'skip-cert-verify',
      label: '跳过证书验证',
      type: 'boolean',
      group: 'tls',
      defaultValue: false,
      description: '跳过 TLS 证书验证（不安全）',
    },

    // 会话管理
    {
      key: 'idle-session-check-interval',
      label: '空闲会话检查间隔',
      type: 'number',
      group: 'session',
      defaultValue: 30,
      placeholder: '30',
      description: '检查空闲会话的时间间隔（秒），默认 30',
    },
    {
      key: 'idle-session-timeout',
      label: '空闲会话超时',
      type: 'number',
      group: 'session',
      defaultValue: 30,
      placeholder: '30',
      description: '检查时，空闲超过该时长的会话将被关闭（秒），默认 30',
    },
    {
      key: 'min-idle-session',
      label: '最小空闲会话数',
      type: 'number',
      group: 'session',
      defaultValue: 0,
      placeholder: '0',
      description: '检查时至少保留前 n 个空闲会话不被关闭，默认 0',
    },

    // 高级参数
    ...advancedFields,
  ],
};
