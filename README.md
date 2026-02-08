# SubMix

[English](#english) | [中文](#中文)

---

## English

An enterprise intranet protocol configuration management tool that parses and converts multi-protocol connection strings into unified YAML configuration files, suitable for internal network service orchestration and traffic scheduling.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/YoungLee-coder/SubMix)

### Features

- Multi-protocol support: VLESS, Hysteria, Hysteria2, Shadowsocks, SS2022, Trojan
- Visual node management: add, edit, reorder, delete service nodes
- RESTful API: supports GET/POST for automated integration
- Routing policies: whitelist/blacklist traffic scheduling modes
- One-click export: copy or download YAML configuration

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

> Connection strings must be URL-encoded for GET requests.

#### Parameters

| Param | Description | Default |
|-------|-------------|---------|
| urls/url | Service node connection strings | - |
| type | `simple` (minimal) / `full` (complete) | full |
| mode | `whitelist` / `blacklist` | whitelist |

### Tech Stack

Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui

---

## 中文

企业内网协议配置管理工具，可将多种协议连接串解析并转换为统一的 YAML 配置文件，适用于内部网络服务编排与流量调度场景。

[![部署到 Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/YoungLee-coder/SubMix)

### 功能

- 多协议支持：VLESS、Hysteria、Hysteria2、Shadowsocks、SS2022、Trojan
- 可视化节点管理：添加、编辑、排序、删除服务节点
- RESTful API 接口：支持 GET/POST 请求，便于自动化集成
- 路由策略：白名单/黑名单流量调度模式
- 一键导出：复制、下载 YAML 配置文件

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

> GET 请求需要对连接串进行 URL 编码。

#### 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| urls/url | 服务节点连接串 | - |
| type | `simple` 精简版 / `full` 完整版 | full |
| mode | `whitelist` 白名单 / `blacklist` 黑名单 | whitelist |

### 技术栈

Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui

---

## 致谢

- [Mihomo](https://github.com/MetaCubeX/mihomo)
- [shadcn/ui](https://ui.shadcn.com/)

## 免责声明 / Disclaimer

本工具仅供企业内部网络管理与技术学习用途，使用者应确保在合法合规的前提下使用本工具，并自行承担相关责任。

This tool is intended for enterprise internal network management and technical learning purposes only. Users are responsible for ensuring compliance with applicable laws and regulations.
