"use client";

import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download, X } from "lucide-react";
import { toast } from "sonner";

export interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrDataURL: string;
  subscriptionUrl: string;
  expireTip: string;
}

export function QRCodeDialog({
  open,
  onOpenChange,
  qrDataURL,
  subscriptionUrl,
  expireTip,
}: QRCodeDialogProps) {
  const [copying, setCopying] = useState(false);

  const handleCopyLink = useCallback(async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(subscriptionUrl);
      toast.success("配置链接已复制");
    } catch {
      toast.error("复制失败");
    } finally {
      setCopying(false);
    }
  }, [subscriptionUrl]);

  const handleDownloadQR = useCallback(() => {
    const a = document.createElement("a");
    a.href = qrDataURL;
    a.download = "subscription-qrcode.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [qrDataURL]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>配置链接二维码</DialogTitle>
          <DialogDescription>
            使用支持 Mihomo 内核的客户端扫描二维码导入配置
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {/* QR Code */}
          <div className="rounded-lg border p-4 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataURL}
              alt="配置链接二维码"
              className="w-64 h-64"
            />
          </div>

          {/* 使用说明 */}
          <div className="w-full text-sm text-muted-foreground space-y-1">
            <p>1. 使用客户端扫描上方二维码</p>
            <p>2. 确认导入后即可使用配置文件</p>
            <p>3. {expireTip}</p>
          </div>

          {/* 配置链接 */}
          <div className="w-full rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground mb-1 font-medium">
              配置链接：
            </p>
            <code className="text-xs break-all">{subscriptionUrl}</code>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDownloadQR}
            >
              <Download className="h-4 w-4 mr-2" />
              下载二维码
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCopyLink}
              disabled={copying}
            >
              <Copy className="h-4 w-4 mr-2" />
              复制链接
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
