/**
 * 字段类型和选项定义
 * 预定义常用的选项列表和验证规则
 */

// 加密方法选项
export const shadowsocksCiphers = [
  // AES 系列
  { value: 'aes-128-ctr', label: 'AES-128-CTR' },
  { value: 'aes-192-ctr', label: 'AES-192-CTR' },
  { value: 'aes-256-ctr', label: 'AES-256-CTR' },
  { value: 'aes-128-cfb', label: 'AES-128-CFB' },
  { value: 'aes-192-cfb', label: 'AES-192-CFB' },
  { value: 'aes-256-cfb', label: 'AES-256-CFB' },
  { value: 'aes-128-gcm', label: 'AES-128-GCM' },
  { value: 'aes-192-gcm', label: 'AES-192-GCM' },
  { value: 'aes-256-gcm', label: 'AES-256-GCM' },
  { value: 'aes-128-ccm', label: 'AES-128-CCM' },
  { value: 'aes-192-ccm', label: 'AES-192-CCM' },
  { value: 'aes-256-ccm', label: 'AES-256-CCM' },
  { value: 'aes-128-gcm-siv', label: 'AES-128-GCM-SIV' },
  { value: 'aes-256-gcm-siv', label: 'AES-256-GCM-SIV' },
  
  // ChaCha 系列
  { value: 'chacha20-ietf', label: 'ChaCha20-IETF' },
  { value: 'chacha20', label: 'ChaCha20' },
  { value: 'xchacha20', label: 'XChaCha20' },
  { value: 'chacha20-ietf-poly1305', label: 'ChaCha20-IETF-Poly1305' },
  { value: 'xchacha20-ietf-poly1305', label: 'XChaCha20-IETF-Poly1305' },
  { value: 'chacha8-ietf-poly1305', label: 'ChaCha8-IETF-Poly1305' },
  { value: 'xchacha8-ietf-poly1305', label: 'XChaCha8-IETF-Poly1305' },
  
  // 2022 Blake3 系列
  { value: '2022-blake3-aes-128-gcm', label: '2022-BLAKE3-AES-128-GCM' },
  { value: '2022-blake3-aes-256-gcm', label: '2022-BLAKE3-AES-256-GCM' },
  { value: '2022-blake3-chacha20-poly1305', label: '2022-BLAKE3-ChaCha20-Poly1305' },
  
  // LEA 系列
  { value: 'lea-128-gcm', label: 'LEA-128-GCM' },
  { value: 'lea-192-gcm', label: 'LEA-192-GCM' },
  { value: 'lea-256-gcm', label: 'LEA-256-GCM' },
  
  // 其他
  { value: 'rabbit128-poly1305', label: 'Rabbit128-Poly1305' },
  { value: 'aegis-128l', label: 'AEGIS-128L' },
  { value: 'aegis-256', label: 'AEGIS-256' },
  { value: 'aez-384', label: 'AEZ-384' },
  { value: 'deoxys-ii-256-128', label: 'Deoxys-II-256-128' },
  { value: 'rc4-md5', label: 'RC4-MD5' },
  { value: 'none', label: 'None' }
];

// SS2022 专用加密方法
export const ss2022Ciphers = [
  { value: '2022-blake3-aes-128-gcm', label: '2022-BLAKE3-AES-128-GCM' },
  { value: '2022-blake3-aes-256-gcm', label: '2022-BLAKE3-AES-256-GCM' },
  { value: '2022-blake3-chacha20-poly1305', label: '2022-BLAKE3-ChaCha20-Poly1305' }
];

// VMess 加密方法
export const vmessCiphers = [
  { value: 'auto', label: 'Auto' },
  { value: 'none', label: 'None' },
  { value: 'zero', label: 'Zero' },
  { value: 'aes-128-gcm', label: 'AES-128-GCM' },
  { value: 'chacha20-poly1305', label: 'ChaCha20-Poly1305' }
];

// 客户端指纹选项
export const clientFingerprintOptions = [
  { value: '', label: '默认' },
  { value: 'chrome', label: 'Chrome' },
  { value: 'firefox', label: 'Firefox' },
  { value: 'safari', label: 'Safari' },
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'edge', label: 'Edge' },
  { value: 'random', label: '随机' }
];

// VLESS 流控选项
export const vlessFlowOptions = [
  { value: '', label: '无流控' },
  { value: 'xtls-rprx-vision', label: 'xtls-rprx-vision' },
  { value: 'xtls-rprx-vision-udp443', label: 'xtls-rprx-vision-udp443' }
];

// UDP 包编码选项
export const packetEncodingOptions = [
  { value: '', label: '原始编码' },
  { value: 'packetaddr', label: 'PacketAddr (v2ray 5+)' },
  { value: 'xudp', label: 'XUDP (xray)' }
];

// Hysteria 协议类型选项
export const hysteriaProtocolOptions = [
  { value: 'udp', label: 'UDP' },
  { value: 'wechat-video', label: 'WeChat Video' },
  { value: 'faketcp', label: 'Fake TCP' }
];

// Hysteria2 混淆选项
export const hysteria2ObfsOptions = [
  { value: '', label: '无混淆' },
  { value: 'salamander', label: 'Salamander' }
];

// Shadowsocks 插件选项
export const shadowsocksPluginOptions = [
  { value: '', label: '无插件' },
  { value: 'obfs', label: 'Simple-obfs' },
  { value: 'v2ray-plugin', label: 'V2Ray Plugin' },
  { value: 'gost-plugin', label: 'GOST Plugin' },
  { value: 'shadow-tls', label: 'Shadow-TLS' },
  { value: 'restls', label: 'RestLS' }
];

// 插件模式选项
export const pluginModeOptions = [
  { value: 'http', label: 'HTTP (obfs)' },
  { value: 'tls', label: 'TLS (obfs)' },
  { value: 'websocket', label: 'WebSocket (v2ray-plugin/gost-plugin)' }
];

// Trojan SS AEAD 加密方法
export const trojanSSAEADOptions = [
  { value: 'aes-128-gcm', label: 'AES-128-GCM' },
  { value: 'aes-256-gcm', label: 'AES-256-GCM' },
  { value: 'chacha20-ietf-poly1305', label: 'ChaCha20-IETF-Poly1305' }
];

// UDP over TCP 版本选项
export const udpOverTcpVersionOptions = [
  { value: '1', label: '版本 1' },
  { value: '2', label: '版本 2' }
];

// IP 版本选项
export const ipVersionOptions = [
  { value: 'ipv4', label: 'IPv4' },
  { value: 'ipv6', label: 'IPv6' }
];

// 网络传输协议选项
export const networkOptions = [
  { value: 'tcp', label: 'TCP' },
  { value: 'ws', label: 'WebSocket' },
  { value: 'http', label: 'HTTP' },
  { value: 'h2', label: 'HTTP/2' },
  { value: 'grpc', label: 'gRPC' }
];

// 端口验证规则
export const portValidation = { min: 1, max: 65535 };

// 常用默认端口
export const defaultPorts = {
  ss: 8388,
  trojan: 443,
  vless: 443,
  hysteria: 443,
  hysteria2: 443,
  vmess: 443,
  anytls: 443
} as const;
