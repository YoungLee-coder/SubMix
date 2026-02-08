import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "SubMix - 协议配置管理工具",
  description: "SubMix - 企业内网多协议连接串解析与 YAML 配置生成工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="9d983291-3037-4389-8845-de20d10a30a2"
          defer
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
