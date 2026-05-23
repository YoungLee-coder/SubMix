/**
 * 字段分组配置
 * 定义前端表单的字段分组显示
 */

export const fieldGroups = {
  basic: '基本信息',
  protocol: '协议参数',
  transport: '传输层配置',
  tls: 'TLS 配置',
  reality: 'REALITY 配置',
  plugin: '插件配置',
  websocket: 'WebSocket 配置',
  http: 'HTTP 配置',
  http2: 'HTTP/2 配置',
  grpc: 'gRPC 配置',
  bandwidth: '带宽控制',
  certificate: '证书配置',
  connection: '连接配置',
  'quic-go': 'QUIC-GO 配置',
  'trojan-go': 'Trojan-Go 配置',
  session: '会话管理',
  advanced: '高级参数'
} as const;

export type FieldGroupKey = keyof typeof fieldGroups;
