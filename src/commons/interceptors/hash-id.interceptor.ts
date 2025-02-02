import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { HashId } from '../utils/hash-id.util';

@Injectable()
export class HashIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const hashids = new HashId();
    const request: Request = context.switchToHttp().getRequest();
    if (request.params.id) {
      request.params.id = hashids.decode(request.params.id).toString();
    }
    return next.handle();
  }
}
