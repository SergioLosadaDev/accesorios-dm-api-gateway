import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { BlacklistService } from './services/blacklist.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        publicKey: config
          .get<string>('JWT_PUBLIC_KEY', '')
          .replace(/\\n/g, '\n'),
        verifyOptions: {
          algorithms: ['RS256' as const],
          issuer: config.get<string>('JWT_ISSUER'),
        },
      }),
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard, BlacklistService],
  exports: [JwtAuthGuard, BlacklistService],
})
export class AuthModule {}
