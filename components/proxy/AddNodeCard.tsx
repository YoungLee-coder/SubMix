// 添加节点卡片组件

"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Plus, FileText } from "lucide-react";
import type { InputMode } from '@/types/proxy';

interface AddNodeCardProps {
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  onAddSingle: (link: string) => boolean;
  onAddBatch: (links: string) => boolean;
}

export function AddNodeCard({
  inputMode,
  onInputModeChange,
  onAddSingle,
  onAddBatch
}: AddNodeCardProps) {
  const [singleLink, setSingleLink] = useState("");
  const [batchLinks, setBatchLinks] = useState("");

  const handleSingleSubmit = () => {
    if (onAddSingle(singleLink)) {
      setSingleLink("");
    }
  };

  const handleBatchSubmit = () => {
    if (onAddBatch(batchLinks)) {
      setBatchLinks("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              添加节点
            </CardTitle>
            <CardDescription>
              {inputMode === "single" 
                ? "输入单个连接串，解析后添加到节点列表" 
                : "批量输入多个连接串，一次性解析并添加"
              }
            </CardDescription>
          </div>
          <Select value={inputMode} onValueChange={onInputModeChange}>
            <SelectTrigger className="w-auto border-none shadow-none bg-transparent p-1 h-8 w-8 flex items-center justify-center [&>span]:!hidden">
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  单个连接串
                </div>
              </SelectItem>
              <SelectItem value="batch">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  批量导入
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {inputMode === "single" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="single-link">连接串</Label>
              <Input
                id="single-link"
                value={singleLink}
                onChange={(e) => setSingleLink(e.target.value)}
                placeholder="粘贴单个协议连接串..."
                onKeyDown={(e) => handleKeyDown(e, handleSingleSubmit)}
              />
            </div>
            
            <Button 
              onClick={handleSingleSubmit}
              disabled={!singleLink.trim()}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              解析并添加
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="batch-links">批量连接串</Label>
              <Textarea
                id="batch-links"
                value={batchLinks}
                onChange={(e) => setBatchLinks(e.target.value)}
                placeholder="粘贴多个连接串，每行一个..."
                className="min-h-32 resize-none"
                rows={6}
              />
              <div className="text-xs text-muted-foreground">
                每行输入一个连接串，支持各种协议格式
              </div>
            </div>
            
            <Button 
              onClick={handleBatchSubmit}
              disabled={!batchLinks.trim()}
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              批量解析并添加
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

