// 配置选项卡片组件

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Settings, Trash2 } from "lucide-react";
import type { RuleMode } from '@/types/proxy';

interface ConfigOptionsCardProps {
  ruleMode: RuleMode;
  onRuleModeChange: (mode: RuleMode) => void;
  proxyCount: number;
  isProcessing: boolean;
  onGenerateConfig: () => void;
  onClearAll: () => void;
}

export function ConfigOptionsCard({
  ruleMode,
  onRuleModeChange,
  proxyCount,
  isProcessing,
  onGenerateConfig,
  onClearAll
}: ConfigOptionsCardProps) {
  return (
    <>
      {/* 配置选项卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            配置选项
          </CardTitle>
          <CardDescription>
            选择路由模式
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 路由模式 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">路由模式</Label>
            <RadioGroup 
              value={ruleMode} 
              onValueChange={(value) => onRuleModeChange(value as RuleMode)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whitelist" id="whitelist" />
                <Label htmlFor="whitelist" className="cursor-pointer">
                  白名单模式
                  <span className="block text-xs text-muted-foreground">
                    未匹配规则的流量走转发通道
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="blacklist" id="blacklist" />
                <Label htmlFor="blacklist" className="cursor-pointer">
                  黑名单模式
                  <span className="block text-xs text-muted-foreground">
                    仅指定流量走转发通道
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="space-y-3">
        <Button 
          onClick={onGenerateConfig}
          disabled={proxyCount === 0 || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? "生成中..." : "生成 YAML 配置"}
        </Button>
        
        {proxyCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                清空所有节点
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认清空</AlertDialogTitle>
                <AlertDialogDescription>
                  这将删除所有已添加的节点，此操作不可撤销。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={onClearAll}>
                  确认清空
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </>
  );
}

