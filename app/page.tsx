"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, Github } from "lucide-react";

// 导入重构后的组件
import { AddNodeCard } from "@/components/proxy/AddNodeCard";
import { ConfigOptionsCard } from "@/components/proxy/ConfigOptionsCard";
import { NodeListCard } from "@/components/proxy/NodeListCard";
import { ConfigOutputCard } from "@/components/proxy/ConfigOutputCard";
import { EditNodeDialog } from "@/components/proxy/EditNodeDialog";
import { ProtocolSupportCard } from "@/components/proxy/ProtocolSupportCard";

// 导入hooks和类型
import { useProxyManagement } from "@/hooks/useProxyManagement";
import { useConfigGeneration } from "@/hooks/useConfigGeneration";
import type { ParsedProxy } from "@/types/proxy";

export default function Home() {
  // 编辑对话框状态
  const [editingProxy, setEditingProxy] = useState<ParsedProxy | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // 使用自定义hooks管理状态和逻辑
  const {
    parsedProxies,
    inputMode,
    ruleMode,
    setInputMode,
    setRuleMode,
    addSingleProxy,
    addBatchProxies,
    deleteProxy,
    moveProxy,
    updateProxy,
    clearAllProxies,
  } = useProxyManagement();

  const {
    outputYaml,
    isProcessing,
    handleGenerateConfig,
    downloadConfig,
    copyConfig,
    generateQR,
  } = useConfigGeneration(parsedProxies, ruleMode);

  // 编辑节点处理
  const handleEditProxy = (proxy: ParsedProxy) => {
    setEditingProxy({ ...proxy });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedProxy: ParsedProxy) => {
    updateProxy(updatedProxy);
    setEditDialogOpen(false);
    setEditingProxy(null);
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setEditingProxy(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* 页面标题 */}
        <div className="relative text-center mb-8">
          {/* GitHub 链接按钮 */}
          <div className="absolute top-0 right-0">
            <Button
              variant="outline"
              size="default"
              className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => window.open('https://github.com/YoungLee-coder/SubMix', '_blank')}
            >
              <Github className="h-5 w-5" />
              <span className="hidden sm:inline">GitHub</span>
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <Rocket className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              SubMix
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            企业多协议配置管理工具，支持逐个添加节点、自由编辑排序，生成统一的 YAML 配置
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-13 gap-6">
          
          {/* 左侧：添加节点和配置选项 */}
          <div className="lg:col-span-4 space-y-6">
            <AddNodeCard
              inputMode={inputMode}
              onInputModeChange={setInputMode}
              onAddSingle={addSingleProxy}
              onAddBatch={addBatchProxies}
            />

            <ConfigOptionsCard
              ruleMode={ruleMode}
              onRuleModeChange={setRuleMode}
              proxyCount={parsedProxies.length}
              isProcessing={isProcessing}
              onGenerateConfig={handleGenerateConfig}
              onClearAll={clearAllProxies}
            />
          </div>

          {/* 中间：节点列表 */}
          <div className="lg:col-start-5 lg:col-span-5 space-y-6">
            <NodeListCard
              proxies={parsedProxies}
              onEdit={handleEditProxy}
              onDelete={deleteProxy}
              onMove={moveProxy}
            />
          </div>

          {/* 右侧：输出配置 */}
          <div className="lg:col-start-10 lg:col-span-4 space-y-6">
            <ConfigOutputCard
              outputYaml={outputYaml}
              onDownload={downloadConfig}
              onCopy={copyConfig}
              onGenerateQR={generateQR}
            />
          </div>
        </div>

        {/* 协议支持说明 */}
        <ProtocolSupportCard />

        {/* 编辑节点对话框 */}
        <EditNodeDialog
          isOpen={editDialogOpen}
          onClose={handleCloseEdit}
          proxy={editingProxy}
          onSave={handleSaveEdit}
        />
      </div>
    </div>
  );
}
