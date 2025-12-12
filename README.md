# SubMix

[English](#english) | [中文](#中文)

---

## English

A proxy subscription converter that transforms VLESS, Hysteria, Hysteria2, Shadowsocks, Trojan links into Mihomo YAML configuration.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/YoungLee-coder/SubMix)

### Features

- Multi-protocol: VLESS, Hysteria, Hysteria2, Shadowsocks, SS2022, Trojan
- Visual node management: add, edit, reorder, delete
- API endpoints: Sub Converter style, supports GET/POST
- Routing modes: whitelist/blacklist with Loyalsoldier/clash-rules
- One-click export: copy or download config

### Quick Start

```bash
pnpm install
pnpm dev
```

### API Usage

#### POST (Recommended)

```bash
curl -X POST https://your-domain.com/api/sub \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["vless://...", "ss://..."],
    "type": "full",
    "mode": "whitelist"
  }'
```

#### GET

```
https://your-domain.com/api/sub?url=vless://...&url=ss://...&type=full&mode=whitelist
```

> Node links must be URL-encoded for GET requests

#### Parameters

| Param | Description | Default |
|-------|-------------|---------|
| urls/url | Node links | - |
| type | `simple` / `full` | full |
| mode | `whitelist` / `blacklist` | whitelist |

### Tech Stack

Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui

---

## 中文

代理订阅链接转换器，将 VLESS、Hysteria、Hysteria2、Shadowsocks、Trojan 等协议链接转换为 Mihomo YAML 配置。

[![部署到 Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/YoungLee-coder/SubMix)

### 功能

- 多协议支持：VLESS、Hysteria、Hysteria2、Shadowsocks、SS2022、Trojan
- 可视化节点管理：添加、编辑、排序、删除
- API 接口：类似 Sub Converter，支持 GET/POST 请求
- 路由模式：白名单/黑名单，基于 Loyalsoldier/clash-rules 规则集
- 一键导出：复制、下载配置文件

### 快速开始

```bash
pnpm install
pnpm dev
```

### API 使用

#### POST 请求（推荐）

```bash
curl -X POST https://your-domain.com/api/sub \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["vless://...", "ss://..."],
    "type": "full",
    "mode": "whitelist"
  }'
```

#### GET 请求

```
https://your-domain.com/api/sub?url=vless://...&url=ss://...&type=full&mode=whitelist
```

> GET 请求需要对节点链接进行 URL 编码

#### 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| urls/url | 节点链接 | - |
| type | `simple` 简化版 / `full` 完整版 | full |
| mode | `whitelist` 白名单 / `blacklist` 黑名单 | whitelist |

### 技术栈

Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui

---

## Credits

- [Mihomo](https://github.com/MetaCubeX/mihomo)
- [Loyalsoldier/clash-rules](https://github.com/Loyalsoldier/clash-rules)
- [shadcn/ui](https://ui.shadcn.com/)

## Disclaimer / 免责声明

For learning and testing purposes only. Please comply with local laws and regulations.

本工具仅用于学习和测试目的，请遵守当地法律法规。
