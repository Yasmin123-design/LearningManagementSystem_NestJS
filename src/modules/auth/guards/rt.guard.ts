import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RtGuard extends AuthGuard('jwt-refresh') {
  getRequest(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization || '';

    if (authHeader.startsWith('Bearer ')) {
      const refreshToken = authHeader.replace('Bearer ', '');
      request.refreshToken = refreshToken;
    }

    return request;
  }
}
