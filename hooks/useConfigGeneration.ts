// 配置生成相关的 hooks

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { MihomoConfigGenerator } from '@/lib/mihomo-config';
import type { ParsedProxy, RuleMode } from '@/types/proxy';

export function useConfigGeneration(proxies: ParsedProxy[], ruleMode: RuleMode) {
  const [outputYaml, setOutputYaml] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // 生成配置的核心方法
  const generateConfig = useCallback((proxiesList: ParsedProxy[], showSuccessToast = true) => {
    if (proxiesList.length === 0) {
      setOutputYaml("");
      return;
    }

    try {
      const config = MihomoConfigGenerator.generateConfig(proxiesList, ruleMode);
      const yamlOutput = MihomoConfigGenerator.configToYaml(config);
      setOutputYaml(yamlOutput);
      if (showSuccessToast) {
        toast.success(`成功生成配置文件，包含 ${proxiesList.length} 个节点`);
      }
    } catch (error) {
      console.error("生成配置失败:", error);
      toast.error("生成配置失败");
    }
  }, [ruleMode]);

  // 监听变化自动重新生成配置
  useEffect(() => {
    if (proxies.length > 0) {
      generateConfig(proxies, false);
    } else {
      setOutputYaml("");
    }
  }, [ruleMode, proxies, generateConfig]);

  // 手动生成配置
  const handleGenerateConfig = useCallback(() => {
    if (proxies.length === 0) {
      toast.error("请先添加至少一个服务节点");
      return;
    }

    setIsProcessing(true);
    generateConfig(proxies, true);
    setIsProcessing(false);
  }, [proxies, generateConfig]);

  // 下载配置文件
  const downloadConfig = useCallback(() => {
    if (!outputYaml) return;

    const blob = new Blob([outputYaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.yaml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("配置文件下载成功");
  }, [outputYaml]);

  // 复制配置到剪贴板
  const copyConfig = useCallback(async () => {
    if (!outputYaml) return;
    
    try {
      await navigator.clipboard.writeText(outputYaml);
      toast.success("配置已复制到剪贴板");
    } catch (error) {
      console.error("复制失败:", error);
      toast.error("复制失败，请手动复制");
    }
  }, [outputYaml]);

  // 生成二维码
  const generateQR = useCallback(async () => {
    if (!outputYaml) return;
    
    try {
      // 将配置上传到配置托管API获取配置ID
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config: outputYaml })
      });
      
      if (!response.ok) {
        throw new Error('上传配置失败');
      }
      
      const { id } = await response.json();
      
      // 生成配置链接（自动适配当前域名）
      const baseUrl = window.location.origin;
      const subscriptionUrl = `${baseUrl}/api/subscription?id=${id}`;
      
      // 开发环境下记录配置链接
      if (process.env.NODE_ENV === 'development') {
        console.log('生成的配置链接:', subscriptionUrl);
      }
      
      // 将配置链接编码到二维码中
      const qrDataURL = await QRCode.toDataURL(subscriptionUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      // 创建一个新的窗口显示二维码
      const qrWindow = window.open('', '_blank', 'width=600,height=700,resizable=yes,scrollbars=yes');
      if (qrWindow) {
        qrWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>YAML 配置二维码</title>
              <meta charset="utf-8">
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: #f5f5f5;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  min-height: 100vh;
                }
                .container {
                  background: white;
                  border-radius: 12px;
                  padding: 30px;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                  text-align: center;
                  max-width: 500px;
                }
                h1 {
                  color: #333;
                  margin-bottom: 20px;
                  font-size: 24px;
                }
                .qr-code {
                  border: 1px solid #e0e0e0;
                  border-radius: 8px;
                  padding: 20px;
                  background: white;
                  margin: 20px 0;
                }
                .instructions {
                  color: #666;
                  font-size: 14px;
                  line-height: 1.6;
                  margin-top: 20px;
                  text-align: left;
                }
                .button {
                  background: #007bff;
                  color: white;
                  border: none;
                  padding: 12px 24px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 14px;
                  margin: 10px 5px;
                  text-decoration: none;
                  display: inline-block;
                  transition: background 0.2s;
                }
                .button:hover {
                  background: #0056b3;
                }
                .button.secondary {
                  background: #6c757d;
                }
                .button.secondary:hover {
                  background: #545b62;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>📱 配置链接二维码</h1>
                <div class="qr-code">
                  <img src="${qrDataURL}" alt="配置链接二维码" style="max-width: 100%; height: auto;">
                </div>
                <div class="instructions">
                  <strong>使用说明：</strong><br>
                  1. 使用支持 Mihomo 内核的客户端扫描上方二维码<br>
                  2. 客户端会自动识别并提示导入配置<br>
                  3. 确认导入后即可使用配置文件<br>
                  4. 配置链接有效期为30分钟，请及时导入
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 12px; color: #666;">
                  <strong>配置链接：</strong><br>
                  <code style="word-break: break-all; font-size: 11px;">${subscriptionUrl}</code>
                </div>
                <a href="${qrDataURL}" download="subscription-qrcode.png" class="button">下载二维码</a>
                <button class="button secondary" onclick="navigator.clipboard.writeText('${subscriptionUrl}').then(() => alert('配置链接已复制')).catch(() => alert('复制失败'))">复制链接</button>
                <button class="button secondary" onclick="window.close()">关闭窗口</button>
              </div>
            </body>
          </html>
        `);
        qrWindow.document.close();
      }
      
      toast.success("配置二维码已生成，有效期30分钟");
    } catch (error) {
      console.error("生成二维码失败:", error);
      toast.error("生成二维码失败");
    }
  }, [outputYaml]);

  return {
    outputYaml,
    isProcessing,
    handleGenerateConfig,
    downloadConfig,
    copyConfig,
    generateQR,
  };
}

