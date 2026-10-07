import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Terjadi kesalahan pada server';
    let details: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;

      if (typeof res === 'string') {
        message = res;
        code = HttpStatus[status] || 'HTTP_EXCEPTION';
      } else if (typeof res === 'object' && res !== null) {
        message = res.message || exception.message;
        code = res.code || HttpStatus[status] || 'HTTP_EXCEPTION';
        if (Array.isArray(res.message)) {
          details = res.message;
          message = 'Validasi gagal';
          code = 'VALIDATION_ERROR';
        } else if (res.details) {
          details = Array.isArray(res.details) ? res.details : [res.details];
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
      message = exception.message;
    }

    response.status(status).json({
      status: 'error',
      error: {
        code,
        message,
        details,
      },
    });
  }
}
