import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const traceId =
      (request.headers['x-trace-id'] as string) ?? randomUUID();

    const errorCode = this.resolveErrorCode(status, exception);
    const message = this.resolveMessage(status, exception);

    response.status(status).json({
      status,
      error: errorCode,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
      traceId,
      details: this.resolveDetails(exception),
    });
  }

  private resolveErrorCode(status: number, exception: unknown): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMIT_EXCEEDED',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT',
    };

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null && 'error' in body) {
        return (body as Record<string, string>).error;
      }
    }

    return codes[status] ?? 'INTERNAL_SERVER_ERROR';
  }

  private resolveMessage(status: number, exception: unknown): string {
    if (status === 500) {
      return 'Ocurrió un error interno. Por favor intente de nuevo.';
    }
    if (status === 502) {
      return 'El servicio no está disponible temporalmente. Intente de nuevo.';
    }
    if (status === 504) {
      return 'El servicio no respondió a tiempo. Intente de nuevo.';
    }
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'string') return body;
      if (typeof body === 'object' && body !== null && 'message' in body) {
        const msg = (body as Record<string, unknown>).message;
        return Array.isArray(msg) ? msg.join(', ') : String(msg);
      }
    }
    return 'Error inesperado.';
  }

  private resolveDetails(exception: unknown): unknown[] {
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null && 'details' in body) {
        return (body as Record<string, unknown[]>).details ?? [];
      }
    }
    return [];
  }
}
