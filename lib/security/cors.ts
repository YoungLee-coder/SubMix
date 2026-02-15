import type { NextRequest } from "next/server";

export interface CorsEvaluation {
  allowed: boolean;
  origin: string | null;
}

function normalizeOrigin(origin: string): string {
  return origin.trim().toLowerCase();
}

function parseAllowedOrigins(): Set<string> {
  const raw = process.env.CORS_ALLOWED_ORIGINS ?? "";
  const values = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  return new Set(values);
}

export function evaluateCors(request: NextRequest): CorsEvaluation {
  const requestOrigin = request.headers.get("origin");
  if (!requestOrigin) {
    return { allowed: true, origin: null };
  }

  if (process.env.NODE_ENV === "development") {
    return { allowed: true, origin: requestOrigin };
  }

  const normalizedOrigin = normalizeOrigin(requestOrigin);
  const allowedOrigins = parseAllowedOrigins();
  const sameOrigin = normalizedOrigin === normalizeOrigin(new URL(request.url).origin);

  if (sameOrigin || allowedOrigins.has(normalizedOrigin)) {
    return { allowed: true, origin: requestOrigin };
  }

  return { allowed: false, origin: requestOrigin };
}

export function buildCorsHeaders(
  cors: CorsEvaluation,
  methods: string,
): Record<string, string> {
  if (!cors.allowed || !cors.origin) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": cors.origin,
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}
