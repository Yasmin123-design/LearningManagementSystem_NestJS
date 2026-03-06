import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('app.jwt.accessSecret');
    if (!secret) {
      throw new Error('JWT Access Secret not found in configuration');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
