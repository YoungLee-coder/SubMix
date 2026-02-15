"use client";

import { useState } from "react";
import { AddNodeCard } from "@/components/proxy/AddNodeCard";
import { ConfigOptionsCard } from "@/components/proxy/ConfigOptionsCard";
import { NodeListCard } from "@/components/proxy/NodeListCard";
import { ConfigOutputCard } from "@/components/proxy/ConfigOutputCard";
import { EditNodeDialog } from "@/components/proxy/EditNodeDialog";
import { useProxyManagement } from "@/hooks/useProxyManagement";
import { useConfigGeneration } from "@/hooks/useConfigGeneration";
import type { ParsedProxy } from "@/types/proxy";

export function ProxyWorkbench() {
  const [editingProxy, setEditingProxy] = useState<ParsedProxy | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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
    <>
      <div className="grid grid-cols-1 lg:grid-cols-13 gap-6">
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

        <div className="lg:col-start-5 lg:col-span-5 space-y-6">
          <NodeListCard
            proxies={parsedProxies}
            onEdit={handleEditProxy}
            onDelete={deleteProxy}
            onMove={moveProxy}
          />
        </div>

        <div className="lg:col-start-10 lg:col-span-4 space-y-6">
          <ConfigOutputCard
            outputYaml={outputYaml}
            onDownload={downloadConfig}
            onCopy={copyConfig}
            onGenerateQR={generateQR}
          />
        </div>
      </div>

      <EditNodeDialog
        isOpen={editDialogOpen}
        onClose={handleCloseEdit}
        proxy={editingProxy}
        onSave={handleSaveEdit}
      />
    </>
  );
}
