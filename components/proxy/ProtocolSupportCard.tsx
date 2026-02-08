// 协议支持说明卡片组件

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Network, Server, AlertTriangle } from "lucide-react";

export function ProtocolSupportCard() {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          支持的协议格式
        </CardTitle>
        <CardDescription>
          各协议连接串格式说明
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 协议格式 */}
        <div>
          <h4 className="font-medium mb-4">支持的协议格式</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">

              <ProtocolExample
                name="VLESS"
                icon={<Shield className="h-3 w-3" />}
                color="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                format="vless://uuid@server:port?type=ws&security=tls&flow=xtls-rprx-vision&fp=chrome#name"
                description="支持 TCP/WS/HTTP/H2/gRPC 传输，TLS/REALITY 加密，XTLS 流控"
              />
              
              <ProtocolExample
                name="Hysteria"
                icon={<Network className="h-3 w-3" />}
                color="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                format="hysteria://auth-str@server:port?protocol=udp&up=30&down=200&obfs=obfs_str#name"
                description="支持 UDP/FakeTCP/WeChat-Video 协议，Fast Open，连接窗口控制"
              />
              
              <ProtocolExample
                name="Hysteria2"
                icon={<Network className="h-3 w-3" />}
                color="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                format="hysteria2://password@server:port?ports=443-8443&obfs=salamander&up=30&down=200#name"
                description="基于 QUIC 的高性能协议，支持端口跳跃、brutal 速率控制、QUIC-GO 配置"
              />
            </div>
            
            <div className="space-y-4">
                                <ProtocolExample
                    name="Shadowsocks"
                    icon={<Server className="h-3 w-3" />}
                    color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    format="ss://method:password@server:port#name"
                    description="支持各种加密方法：AES-256-GCM、ChaCha20-Poly1305 等"
                  />
                  
                  <ProtocolExample
                    name="SS2022"
                    icon={<Server className="h-3 w-3" />}
                    color="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                    format="ss://2022-blake3-aes-256-gcm:password@server:port#name"
                    description="SS2022 协议：2022-BLAKE3 系列加密，增强安全性"
                  />
              
              <ProtocolExample
                name="Trojan"
                icon={<Shield className="h-3 w-3" />}
                color="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                format="trojan://password@server:port?network=ws&sni=domain&client-fingerprint=random#name"
                description="支持 TCP/WS/gRPC 传输，TLS/REALITY 加密，trojan-go SS AEAD，SMUX 多路复用"
              />
            </div>
          </div>
        </div>

        {/* 免责声明 */}
        <div className="border-t pt-6">
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              本工具仅供企业内部网络管理与技术学习用途，使用者应确保在合法合规的前提下使用本工具，并自行承担相关责任。
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProtocolExampleProps {
  name: string;
  icon: React.ReactNode;
  color: string;
  format: string;
  description: string;
}

function ProtocolExample({ name, icon, color, format, description }: ProtocolExampleProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge className={color}>
          {icon}
          {name}
        </Badge>
      </div>
      <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
        {format}
      </code>
      <div className="text-xs text-muted-foreground">
        {description}
      </div>
    </div>
  );
}
