import type { ZodType } from "zod";

export interface ValidationIssue {
  path: string;
  message: string;
}

export type ParseJsonResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      status: number;
      error: string;
      issues?: ValidationIssue[];
    };

export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
  maxBytes: number,
): Promise<ParseJsonResult<T>> {
  const bodyText = await request.text();
  const bodySize = new TextEncoder().encode(bodyText).length;

  if (bodySize > maxBytes) {
    return {
      success: false,
      status: 413,
      error: `请求体过大，最大允许 ${maxBytes} 字节`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    return {
      success: false,
      status: 400,
      error: "请求体必须是合法 JSON",
    };
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    return {
      success: false,
      status: 400,
      error: "请求参数校验失败",
      issues: result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

export function parseMaxBytes(envKey: string, fallback: number): number {
  const rawValue = process.env[envKey];
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}
