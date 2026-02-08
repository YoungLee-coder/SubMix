// 节点管理相关的 hooks

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ProxyParser } from '@/lib/proxy-parser';
import type { ParsedProxy, InputMode, RuleMode } from '@/types/proxy';

export function useProxyManagement() {
  const [parsedProxies, setParsedProxies] = useState<ParsedProxy[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>("single");
  const [ruleMode, setRuleMode] = useState<RuleMode>("whitelist");

  // 生成唯一ID
  const generateId = useCallback(() => {
    return Math.random().toString(36).substr(2, 9);
  }, []);

  // 添加单个节点
  const addSingleProxy = useCallback((link: string) => {
    if (!link.trim()) {
      toast.error("请输入连接串");
      return false;
    }

    try {
      const proxy = ProxyParser.parseProxy(link.trim());
      if (!proxy) {
        toast.error("解析失败，请检查链接格式");
        return false;
      }

      const parsedProxy: ParsedProxy = {
        ...proxy,
        id: generateId()
      };

      setParsedProxies(prev => [...prev, parsedProxy]);
      toast.success(`成功解析节点: ${proxy.name}`);
      return true;
    } catch (error) {
      console.error("解析错误:", error);
      toast.error("解析失败，请检查链接格式");
      return false;
    }
  }, [generateId]);

  // 批量添加节点
  const addBatchProxies = useCallback((links: string) => {
    if (!links.trim()) {
      toast.error("请输入连接串");
      return false;
    }

    const linkArray = links.split('\n').filter(link => link.trim());
    if (linkArray.length === 0) {
      toast.error("请输入有效的连接串");
      return false;
    }

    let successCount = 0;
    let failCount = 0;
    const newParsedProxies: ParsedProxy[] = [];

    linkArray.forEach((link, index) => {
      try {
        const proxy = ProxyParser.parseProxy(link.trim());
        if (proxy) {
          const parsedProxy: ParsedProxy = {
            ...proxy,
            id: generateId()
          };
          newParsedProxies.push(parsedProxy);
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`解析第 ${index + 1} 个链接失败:`, error);
        failCount++;
      }
    });

    if (newParsedProxies.length > 0) {
      setParsedProxies(prev => [...prev, ...newParsedProxies]);
      toast.success(`批量解析完成：成功 ${successCount} 个，失败 ${failCount} 个`);
      return true;
    } else {
      toast.error("所有链接解析失败，请检查链接格式");
      return false;
    }
  }, [generateId]);

  // 删除节点
  const deleteProxy = useCallback((id: string) => {
    setParsedProxies(prev => prev.filter(p => p.id !== id));
    toast.success("节点已删除");
  }, []);

  // 移动节点位置
  const moveProxy = useCallback((id: string, direction: "up" | "down") => {
    setParsedProxies(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newArray = [...prev];
      [newArray[index], newArray[newIndex]] = [newArray[newIndex], newArray[index]];
      
      toast.success(`节点已${direction === "up" ? "上" : "下"}移`);
      return newArray;
    });
  }, []);

  // 更新节点信息
  const updateProxy = useCallback((updatedProxy: ParsedProxy) => {
    setParsedProxies(prev => 
      prev.map(p => p.id === updatedProxy.id ? updatedProxy : p)
    );
    toast.success("节点信息已更新");
  }, []);

  // 清空所有节点
  const clearAllProxies = useCallback(() => {
    setParsedProxies([]);
    toast.info("已清空所有节点");
  }, []);

  return {
    // 状态
    parsedProxies,
    inputMode,
    ruleMode,
    
    // 状态更新器
    setInputMode,
    setRuleMode,
    
    // 操作方法
    addSingleProxy,
    addBatchProxies,
    deleteProxy,
    moveProxy,
    updateProxy,
    clearAllProxies,
  };
}

