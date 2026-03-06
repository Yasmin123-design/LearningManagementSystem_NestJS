import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('app.jwt.refreshSecret');
    if (!secret) {
      throw new Error('JWT Refresh Secret not found in configuration');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const authHeader = req.get('authorization');
    if (!authHeader) {
      throw new ForbiddenException('Refresh token malformed');
    }
    const refreshToken = authHeader.replace('Bearer', '').trim();
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      refreshToken,
    };
  }
}
