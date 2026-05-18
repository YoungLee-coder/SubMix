// 配置生成相关的 hooks

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { generateProxyConfig } from '@/features/proxy/application/generate-config';
import type { ParsedProxy, RuleMode } from '@/types/proxy';

export interface QRDialogState {
  open: boolean;
  qrDataURL: string;
  subscriptionUrl: string;
  expireTip: string;
}

export function useConfigGeneration(proxies: ParsedProxy[], ruleMode: RuleMode) {
  const [outputYaml, setOutputYaml] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrDialog, setQrDialog] = useState<QRDialogState>({
    open: false,
    qrDataURL: "",
    subscriptionUrl: "",
    expireTip: "",
  });

  // 生成配置的核心方法
  const generateConfig = useCallback((proxiesList: ParsedProxy[], showSuccessToast = true) => {
    if (proxiesList.length === 0) {
      setOutputYaml("");
      return;
    }

    try {
      const { yaml } = generateProxyConfig({
        proxies: proxiesList,
        configType: 'full',
        ruleMode,
      });
      setOutputYaml(yaml);
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

  // 生成二维码（改为在 Dialog 中展示）
  const generateQR = useCallback(async () => {
    if (!outputYaml) return;

    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: outputYaml }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null) as {
          error?: { message?: string };
        } | null;
        throw new Error(errorPayload?.error?.message || '上传配置失败');
      }

      const payload = await response.json() as {
        success: boolean;
        data: { id: string; expiresAt?: string; warning?: string };
      };

      const { id, expiresAt, warning } = payload.data;
      const baseUrl = window.location.origin;
      const subscriptionUrl = `${baseUrl}/api/subscription?id=${id}`;

      if (process.env.NODE_ENV === 'development') {
        console.log('生成的配置链接:', subscriptionUrl);
      }

      const qrDataURL = await QRCode.toDataURL(subscriptionUrl, {
        width: 512,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
        errorCorrectionLevel: 'M',
      });

      const expireTip = expiresAt
        ? `预计到期时间：${new Date(expiresAt).toLocaleString()}`
        : '默认有效期30分钟';

      setQrDialog({
        open: true,
        qrDataURL,
        subscriptionUrl,
        expireTip,
      });

      toast.success(`配置二维码已生成，${expireTip}${warning ? '。' + warning : ''}`);
    } catch (error) {
      console.error("生成二维码失败:", error);
      toast.error("生成二维码失败");
    }
  }, [outputYaml]);

  const setQrDialogOpen = useCallback((open: boolean) => {
    setQrDialog(prev => ({ ...prev, open }));
  }, []);

  return {
    outputYaml,
    isProcessing,
    qrDialog,
    setQrDialogOpen,
    handleGenerateConfig,
    downloadConfig,
    copyConfig,
    generateQR,
  };
}
