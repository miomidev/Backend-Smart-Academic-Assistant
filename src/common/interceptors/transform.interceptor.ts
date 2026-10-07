import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  status: 'success';
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the controller already returned { status: 'success', data: ... }, avoid double wrapping
        if (data && typeof data === 'object' && 'status' in data && 'data' in data) {
          return data;
        }
        return {
          status: 'success' as const,
          data: data ?? null,
        };
      }),
    );
  }
}
