const SPRING_ERROR_TO_CODE: Record<string, string> = {
  'Bad Request': 'BAD_REQUEST',
  'Unauthorized': 'UNAUTHORIZED',
  'Forbidden': 'FORBIDDEN',
  'Not Found': 'NOT_FOUND',
  'Method Not Allowed': 'METHOD_NOT_ALLOWED',
  'Conflict': 'CONFLICT',
  'Unprocessable Entity': 'VALIDATION_ERROR',
  'Too Many Requests': 'RATE_LIMIT_EXCEEDED',
  'Internal Server Error': 'INTERNAL_SERVER_ERROR',
  'Bad Gateway': 'BAD_GATEWAY',
  'Service Unavailable': 'SERVICE_UNAVAILABLE',
  'Gateway Timeout': 'GATEWAY_TIMEOUT',
};

export interface AdrErrorBody {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  traceId: string;
  details: unknown[];
}

export class UpstreamResponseNormalizer {
  static isSpringDefaultError(body: unknown): body is Record<string, unknown> {
    return (
      typeof body === 'object' &&
      body !== null &&
      'status' in body &&
      'error' in body &&
      !('traceId' in body)
    );
  }

  static normalize(
    body: Record<string, unknown>,
    gatewayPath: string,
    traceId: string,
  ): AdrErrorBody {
    const status = (body['status'] as number) ?? 500;
    const rawError = body['error'] as string | undefined;
    const errorCode = rawError
      ? (SPRING_ERROR_TO_CODE[rawError] ?? rawError.toUpperCase().replace(/ /g, '_'))
      : 'INTERNAL_SERVER_ERROR';

    return {
      status,
      error: errorCode,
      message: UpstreamResponseNormalizer.resolveMessage(status),
      path: gatewayPath,
      timestamp: new Date().toISOString(),
      traceId,
      details: [],
    };
  }

  private static resolveMessage(status: number): string {
    const messages: Record<number, string> = {
      400: 'La petición contiene datos inválidos.',
      401: 'Autenticación requerida.',
      403: 'No tiene permisos para realizar esta acción.',
      404: 'El recurso solicitado no fue encontrado.',
      405: 'Método HTTP no permitido.',
      409: 'El recurso ya existe o hay un conflicto.',
      422: 'Los datos enviados no son válidos.',
      429: 'Demasiadas peticiones. Intente más tarde.',
      500: 'Ocurrió un error interno. Por favor intente de nuevo.',
      502: 'El servicio no está disponible temporalmente. Intente de nuevo.',
      503: 'El servicio no está disponible temporalmente. Intente de nuevo.',
      504: 'El servicio no respondió a tiempo. Intente de nuevo.',
    };
    return messages[status] ?? 'Error inesperado.';
  }
}
