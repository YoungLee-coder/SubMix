/**
 * HTTP 响应头工具函数
 * 提取自各 API 路由中重复的 header 构建逻辑
 */

export function rateLimitHeaders(
  remaining: number,
  retryAfterSeconds: number,
): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(remaining),
    "Retry-After": String(retryAfterSeconds),
  };
}

export const YAML_DOWNLOAD_HEADERS = {
  "Content-Type": "text/yaml; charset=utf-8",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
} as const;

export function yamlDownloadHeaders(filename = "config.yaml"): Record<string, string> {
  return {
    ...YAML_DOWNLOAD_HEADERS,
    "Content-Disposition": `attachment; filename="${filename}"`,
  };
}
