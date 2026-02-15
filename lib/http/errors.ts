export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message: string, details?: unknown) {
  return new ApiError(400, "BAD_REQUEST", message, details);
}

export function forbidden(message: string, details?: unknown) {
  return new ApiError(403, "FORBIDDEN", message, details);
}

export function notFound(message: string, details?: unknown) {
  return new ApiError(404, "NOT_FOUND", message, details);
}

export function payloadTooLarge(message: string, details?: unknown) {
  return new ApiError(413, "PAYLOAD_TOO_LARGE", message, details);
}

export function tooManyRequests(message: string, details?: unknown) {
  return new ApiError(429, "TOO_MANY_REQUESTS", message, details);
}

export function internalServerError(message = "服务器内部错误", details?: unknown) {
  return new ApiError(500, "INTERNAL_SERVER_ERROR", message, details);
}

export function serviceUnavailable(message: string, details?: unknown) {
  return new ApiError(503, "SERVICE_UNAVAILABLE", message, details);
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return internalServerError(error.message);
  }

  return internalServerError();
}
