import type { ApiErrorBody, ApiErrorCode } from "./contracts.ts";

export class ScanApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, status: number) {
    super(message);
    this.name = "ScanApiError";
    this.code = code;
    this.status = status;
  }
}

export function serializeApiError(error: ScanApiError, requestId: string): ApiErrorBody {
  return {
    error: {
      code: error.code,
      message: error.message,
    },
    requestId,
  };
}

export function errorResponse(error: ScanApiError, requestId: string): Response {
  return Response.json(serializeApiError(error, requestId), { status: error.status });
}
