import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { BlacklistService } from '../services/blacklist.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

const PUBLIC_PATH_PREFIXES = ['/api/v1/auth/', '/api/v1/health'];

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly blacklist: BlacklistService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublic(context)) return true;

    await super.canActivate(context);

    const request = context.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    const payload = request.user;

    if (payload.jti && (await this.blacklist.isBlacklisted(payload.jti))) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Token revocado.',
      });
    }

    request.headers['x-user-id'] = payload.sub;
    request.headers['x-user-email'] = payload.email;
    request.headers['x-user-roles'] = Array.isArray(payload.roles)
      ? payload.roles.join(',')
      : String(payload.roles ?? '');

    return true;
  }

  handleRequest<T>(err: Error, user: T, info: { name?: string } | undefined): T {
    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException({
        error: 'TOKEN_EXPIRED',
        message: 'El token ha expirado.',
      });
    }
    if (err || !user) {
      throw (
        err ??
        new UnauthorizedException({
          error: 'UNAUTHORIZED',
          message: 'Token inválido o ausente.',
        })
      );
    }
    return user;
  }

  private isPublic(context: ExecutionContext): boolean {
    const decorated = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (decorated) return true;

    const request = context.switchToHttp().getRequest<Request>();
    return PUBLIC_PATH_PREFIXES.some((prefix) =>
      request.path.startsWith(prefix),
    );
  }
}
