// 编辑配置相关的 hooks

import { useState, useEffect } from 'react';
import type { ProtocolEditConfig } from '@/types/proxy';

interface EditConfigApiResponse {
  success: boolean;
  data?: {
    protocols: ProtocolEditConfig[];
  };
  error?: {
    message?: string;
  };
}

export function useEditConfig() {
  const [configs, setConfigs] = useState<ProtocolEditConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/proxy-config');
        const data: EditConfigApiResponse = await response.json();

        if (data.success && data.data?.protocols) {
          setConfigs(data.data.protocols);
          setError(null);
        } else {
          setError(data.error?.message || '获取配置失败');
        }
      } catch (err) {
        console.error('获取编辑配置失败:', err);
        setError('网络错误，无法获取配置');
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  // 根据协议类型获取配置
  const getConfigByType = (type: string): ProtocolEditConfig | null => {
    return configs.find(config => config.type === type) || null;
  };

  return {
    configs,
    loading,
    error,
    getConfigByType
  };
}

