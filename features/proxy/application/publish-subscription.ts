import {
  CACHE_TTL_MS,
  saveConfig,
  startCacheCleanup,
} from "@/lib/subscription-cache";

export interface PublishSubscriptionResult {
  success: boolean;
  id?: string;
  expiresAt?: string;
  expiresInMinutes?: number;
  error?: string;
  status?: number;
}

startCacheCleanup();

function createId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export function publishSubscription(config: string): PublishSubscriptionResult {
  const id = createId();
  const saved = saveConfig(id, config);

  if (!saved.success || !saved.entry) {
    return {
      success: false,
      error: saved.error,
      status: saved.status,
    };
  }

  return {
    success: true,
    id,
    expiresAt: new Date(saved.entry.expiresAt).toISOString(),
    expiresInMinutes: Math.floor(CACHE_TTL_MS / 60000),
  };
}
