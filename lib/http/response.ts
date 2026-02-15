import { NextResponse } from "next/server";
import { ApiError, toApiError } from "@/lib/http/errors";

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function ok<T>(data: T, init?: { status?: number; headers?: HeadersInit }) {
  return NextResponse.json<ApiSuccess<T>>(
    {
      success: true,
      data,
    },
    {
      status: init?.status,
      headers: init?.headers,
    },
  );
}

export function fail(error: ApiError | unknown, init?: { headers?: HeadersInit }) {
  const normalized = toApiError(error);

  return NextResponse.json<ApiFailure>(
    {
      success: false,
      error: {
        code: normalized.code,
        message: normalized.message,
        details: normalized.details,
      },
    },
    {
      status: normalized.status,
      headers: init?.headers,
    },
  );
}
