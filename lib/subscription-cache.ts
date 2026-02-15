import { parseMaxBytes } from "@/lib/security/request-validation";

export interface CacheEntry {
  config: string;
  createdAt: number;
  expiresAt: number;
  sizeBytes: number;
}

export interface SaveConfigResult {
  success: boolean;
  error?: string;
  status?: number;
  evictedCount?: number;
  entry?: CacheEntry;
}

const cache = new Map<string, CacheEntry>();

export const CACHE_TTL_MS = 30 * 60 * 1000;
export const MAX_CACHE_ITEMS = parseMaxBytes("MAX_CACHE_ITEMS", 500);
export const MAX_CONFIG_BYTES = parseMaxBytes("MAX_CONFIG_BYTES", 256 * 1024);

let cleanupTimer: NodeJS.Timeout | null = null;

function getConfigSize(config: string): number {
  return new TextEncoder().encode(config).length;
}

export function cleanupExpiredConfigs(now = Date.now()): number {
  let cleaned = 0;

  for (const [id, entry] of cache.entries()) {
    if (entry.expiresAt <= now) {
      cache.delete(id);
      cleaned += 1;
    }
  }

  return cleaned;
}

function evictOldest(): boolean {
  const oldestKey = cache.keys().next().value;
  if (!oldestKey) {
    return false;
  }

  cache.delete(oldestKey);
  return true;
}

export function saveConfig(id: string, config: string): SaveConfigResult {
  const now = Date.now();
  cleanupExpiredConfigs(now);

  if (MAX_CACHE_ITEMS <= 0) {
    return {
      success: false,
      status: 503,
      error: "服务暂不可用，请稍后重试",
    };
  }

  const sizeBytes = getConfigSize(config);
  if (sizeBytes > MAX_CONFIG_BYTES) {
    return {
      success: false,
      status: 413,
      error: `配置内容过大，最大允许 ${MAX_CONFIG_BYTES} 字节`,
    };
  }

  let evictedCount = 0;
  while (cache.size >= MAX_CACHE_ITEMS) {
    const evicted = evictOldest();
    if (!evicted) {
      return {
        success: false,
        status: 503,
        error: "缓存已满，请稍后重试",
      };
    }
    evictedCount += 1;
  }

  const entry: CacheEntry = {
    config,
    createdAt: now,
    expiresAt: now + CACHE_TTL_MS,
    sizeBytes,
  };

  cache.set(id, entry);

  return {
    success: true,
    entry,
    evictedCount,
  };
}

export function getConfigById(id: string): CacheEntry | null {
  const now = Date.now();
  cleanupExpiredConfigs(now);

  const entry = cache.get(id);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= now) {
    cache.delete(id);
    return null;
  }

  return entry;
}

export function startCacheCleanup() {
  if (cleanupTimer) {
    return;
  }

  cleanupTimer = setInterval(() => {
    const cleaned = cleanupExpiredConfigs();
    if (process.env.NODE_ENV === "development" && cleaned > 0) {
      console.log(`[subscription-cache] cleaned=${cleaned}, size=${cache.size}`);
    }
  }, 5 * 60 * 1000);

  if (typeof cleanupTimer.unref === "function") {
    cleanupTimer.unref();
  }
}

export function getCacheStats() {
  cleanupExpiredConfigs();

  let totalBytes = 0;
  let earliestExpiresAt: number | null = null;
  for (const entry of cache.values()) {
    totalBytes += entry.sizeBytes;
    if (!earliestExpiresAt || entry.expiresAt < earliestExpiresAt) {
      earliestExpiresAt = entry.expiresAt;
    }
  }

  return {
    items: cache.size,
    maxItems: MAX_CACHE_ITEMS,
    maxConfigBytes: MAX_CONFIG_BYTES,
    ttlMinutes: Math.floor(CACHE_TTL_MS / 60000),
    totalBytes,
    earliestExpiresAt: earliestExpiresAt ? new Date(earliestExpiresAt).toISOString() : null,
  };
}
