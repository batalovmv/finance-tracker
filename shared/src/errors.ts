export enum ErrorCode {
  // Auth
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMAIL_EXISTS = 'AUTH_EMAIL_EXISTS',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',

  // Transaction
  TRANSACTION_NOT_FOUND = 'TRANSACTION_NOT_FOUND',
  TRANSACTION_FORBIDDEN = 'TRANSACTION_FORBIDDEN',

  // Category
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  CATEGORY_FORBIDDEN = 'CATEGORY_FORBIDDEN',
  CATEGORY_DUPLICATE = 'CATEGORY_DUPLICATE',
  CATEGORY_HAS_TRANSACTIONS = 'CATEGORY_HAS_TRANSACTIONS',

  // General
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(code: ErrorCode, message: string, details?: unknown) {
    return new AppError(code, message, 400, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(ErrorCode.AUTH_UNAUTHORIZED, message, 401);
  }

  static forbidden(code: ErrorCode, message = 'Forbidden') {
    return new AppError(code, message, 403);
  }

  static notFound(code: ErrorCode, message = 'Not found') {
    return new AppError(code, message, 404);
  }

  static conflict(code: ErrorCode, message: string) {
    return new AppError(code, message, 409);
  }

  static internal(message = 'Internal server error') {
    return new AppError(ErrorCode.INTERNAL_ERROR, message, 500);
  }
}
