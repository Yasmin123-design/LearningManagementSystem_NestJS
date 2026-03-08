import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'supersecretaccesskey',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '1h',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
}));
