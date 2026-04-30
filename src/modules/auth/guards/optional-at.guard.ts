import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAtGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    // If there is an error or no user, just return null instead of throwing
    if (err || !user) {
      return null;
    }
    return user;
  }
}
