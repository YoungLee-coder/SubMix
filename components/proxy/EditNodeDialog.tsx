// 编辑节点对话框组件

"use client";

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { ParsedProxy, FormFieldConfig } from '@/types/proxy';
import { useEditConfig } from '@/hooks/useEditConfig';
import { getDisplayProtocolType, getProtocolColor } from '@/lib/protocol-utils';
import { Shield, Network, Server } from 'lucide-react';

interface EditNodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  proxy: ParsedProxy | null;
  onSave: (updatedProxy: ParsedProxy) => void;
}

export function EditNodeDialog({
  isOpen,
  onClose,
  proxy,
  onSave
}: EditNodeDialogProps) {
  const { configs, loading, error } = useEditConfig();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [originalFields, setOriginalFields] = useState<Set<string>>(new Set());

  // 当代理或配置改变时，初始化表单数据
  useEffect(() => {
    if (proxy && configs.length > 0) {
      const initialData: Record<string, unknown> = {};
      const existingFields = new Set<string>();
      
      // 从代理对象中提取现有值
      const copyProxyValue = (obj: Record<string, unknown>, path: string): unknown => {
        const keys = path.split('.');
        let current: unknown = obj;
        for (const key of keys) {
          if (current && typeof current === 'object' && key in current) {
            current = (current as Record<string, unknown>)[key];
          } else {
            return undefined;
          }
        }
        return current;
      };

      const protocolType = getDisplayProtocolType(proxy);
      // 直接在这里查找配置，避免依赖函数引用
      const config = configs.find(c => c.type === protocolType) || null;
      
      if (config) {
        config.fields.forEach(field => {
          const value = copyProxyValue(proxy as Record<string, unknown>, field.key);
          if (value !== undefined) {
            // 只有当原始节点中存在该字段时，才记录并初始化
            existingFields.add(field.key);
            initialData[field.key] = value;
          } else {
            // 对于不存在的字段，使用默认值但不记录为原始字段
            initialData[field.key] = field.defaultValue || '';
          }
        });
      }
      
      setOriginalFields(existingFields);
      setFormData(initialData);
    }
  }, [proxy, configs]);

  // 获取当前协议的配置
  const currentConfig = useMemo(() => {
    if (!proxy) return null;
    const protocolType = getDisplayProtocolType(proxy);
    return configs.find(c => c.type === protocolType) || null;
  }, [proxy, configs]);

  // 分组字段
  const fieldGroups = useMemo(() => {
    if (!currentConfig) return {};
    
    const groups: Record<string, FormFieldConfig[]> = {};
    
    currentConfig.fields.forEach(field => {
      const group = field.group || 'basic';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(field);
    });
    
    return groups;
  }, [currentConfig]);

  const handleFieldChange = (fieldKey: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleSave = () => {
    if (!proxy) return;

    // 检查字段是否被用户修改过
    const isFieldModified = (fieldKey: string, value: unknown): boolean => {
      const copyProxyValue = (obj: Record<string, unknown>, path: string): unknown => {
        const keys = path.split('.');
        let current: unknown = obj;
        for (const key of keys) {
          if (current && typeof current === 'object' && key in current) {
            current = (current as Record<string, unknown>)[key];
          } else {
            return undefined;
          }
        }
        return current;
      };

      const originalValue = copyProxyValue(proxy as Record<string, unknown>, fieldKey);
      return originalValue !== value;
    };

    // 深度设置嵌套属性
    const setNestedValue = (obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> => {
      const keys = path.split('.');
      const result = { ...obj };
      let current: Record<string, unknown> = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object') {
          current[key] = {};
        } else {
          current[key] = { ...(current[key] as Record<string, unknown>) };
        }
        current = current[key] as Record<string, unknown>;
      }
      
      const lastKey = keys[keys.length - 1];
      if (value === '' || value === undefined || value === null) {
        delete current[lastKey];
      } else {
        current[lastKey] = value;
      }
      
      return result;
    };

    // 深度删除嵌套属性
    const deleteNestedValue = (obj: Record<string, unknown>, path: string): Record<string, unknown> => {
      const keys = path.split('.');
      const result = { ...obj };
      let current: Record<string, unknown> = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object') {
          return result; // 路径不存在，无需删除
        }
        current[key] = { ...(current[key] as Record<string, unknown>) };
        current = current[key] as Record<string, unknown>;
      }
      
      const lastKey = keys[keys.length - 1];
      delete current[lastKey];
      
      return result;
    };

    let updatedProxy = { ...proxy } as Record<string, unknown>;
    
    // 只处理原始存在的字段或用户修改过的字段
    Object.entries(formData).forEach(([key, value]) => {
      const wasOriginalField = originalFields.has(key);
      const isModified = isFieldModified(key, value);
      
      if (wasOriginalField || isModified) {
        // 如果是空值且不是原始字段，则删除
        if ((value === '' || value === undefined || value === null) && !wasOriginalField) {
          updatedProxy = deleteNestedValue(updatedProxy, key);
        } else if (value !== '' && value !== undefined && value !== null) {
          // 非空值才设置
          updatedProxy = setNestedValue(updatedProxy, key, value);
        } else if (wasOriginalField && (value === '' || value === undefined || value === null)) {
          // 原始字段被清空，则删除
          updatedProxy = deleteNestedValue(updatedProxy, key);
        }
      }
    });

    onSave(updatedProxy as ParsedProxy);
    onClose();
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">加载配置中...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-destructive">加载配置失败: {error}</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!proxy || !currentConfig) return null;

  const displayType = getDisplayProtocolType(proxy);
  
  // 安全的图标渲染函数
  const renderProtocolIcon = () => {
    const iconClass = "h-4 w-4 mr-1";
    switch (displayType) {
      case "vless": 
      case "trojan": 
        return <Shield className={iconClass} />;
      case "hysteria2": 
        return <Network className={iconClass} />;
      case "ss":
      case "ss2022": 
      default: 
        return <Server className={iconClass} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] lg:max-h-[calc(100vh-6rem)] overflow-y-auto dialog-scrollbar">
        <DialogHeader>
          <DialogTitle>编辑节点</DialogTitle>
          <DialogDescription>
            修改节点的详细配置参数
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 协议类型显示 */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-2">协议类型</div>
            <Badge className={getProtocolColor(displayType)}>
              {renderProtocolIcon()}
              <span>{displayType.toUpperCase()}</span>
            </Badge>
          </div>

          {/* 动态表单字段 */}
          {Object.entries(fieldGroups).map(([groupKey, fields]) => (
            <div key={groupKey} className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                {getGroupName(groupKey)}
              </h4>
              
              <div className="grid grid-cols-1 gap-4">
                {fields.map(field => (
                  <FormField
                    key={field.key}
                    field={field}
                    value={formData[field.key] || ''}
                    onChange={(value) => handleFieldChange(field.key, value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 表单字段组件
interface FormFieldProps {
  field: FormFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

function FormField({ field, value, onChange }: FormFieldProps) {
  const handleChange = (newValue: unknown) => {
    // 类型转换
    if (field.type === 'number') {
      const numValue = parseInt(String(newValue));
      onChange(isNaN(numValue) ? '' : numValue);
    } else if (field.type === 'boolean') {
      onChange(newValue === 'true' || newValue === true);
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.key}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {field.type === 'select' ? (
        <select
          id={field.key}
          value={String(value)}
          onChange={(e) => handleChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {field.options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === 'boolean' ? (
        <select
          id={field.key}
          value={value ? 'true' : 'false'}
          onChange={(e) => handleChange(e.target.value === 'true')}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="false">否</option>
          <option value="true">是</option>
        </select>
      ) : (
        <Input
          id={field.key}
          type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
          value={String(value || '')}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          min={field.validation?.min}
          max={field.validation?.max}
        />
      )}
      
      {field.description && (
        <div className="text-xs text-muted-foreground">
          {field.description}
        </div>
      )}
    </div>
  );
}

// 获取分组名称
function getGroupName(groupKey: string): string {
  const groupNames: Record<string, string> = {
    basic: '基本信息',
    protocol: '协议参数',
    transport: '传输层配置',
    tls: 'TLS 配置',
    reality: 'REALITY 配置',
    plugin: '插件配置',
    websocket: 'WebSocket 配置',
    http: 'HTTP 配置',
    http2: 'HTTP/2 配置',
    grpc: 'gRPC 配置',
    bandwidth: '带宽控制',
    certificate: '证书配置',
    connection: '连接配置',
    'quic-go': 'QUIC-GO 配置',
    'trojan-go': 'Trojan-Go 配置',
    advanced: '高级参数'
  };
  
  return groupNames[groupKey] || groupKey;
}
