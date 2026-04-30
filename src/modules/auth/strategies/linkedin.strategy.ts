import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(private configService: ConfigService) {
    super({
      authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
      clientID: configService.get<string>('app.linkedin.clientId'),
      clientSecret: configService.get<string>('app.linkedin.clientSecret'),
      callbackURL: configService.get<string>('app.linkedin.callbackUrl'),
      scope: ['openid', 'profile', 'email'],
    } as any);
  }

  async validate(accessToken: string, refreshToken: string): Promise<any> {
    const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userinfo = response.data;

    return {
      id: userinfo.sub,
      email: userinfo.email,
      name: userinfo.name,
      displayName: userinfo.name,
      givenName: userinfo.given_name,
      familyName: userinfo.family_name,
      picture: userinfo.picture,
    };
  }
}
