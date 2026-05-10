import { Controller, Get } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Public } from '../auth/decorators/public.decorator';

interface ServiceStatus {
  status: 'UP' | 'DOWN';
  responseTimeMs: number | null;
}

@Controller('health')
@Public()
export class HealthController {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  gateway() {
    return { status: 'UP', timestamp: new Date().toISOString() };
  }

  @Get('services')
  async services() {
    const [security, inventory] = await Promise.all([
      this.ping('security-service', this.config.get<string>('SECURITY_SERVICE_URL')!),
      this.ping('inventory-service', this.config.get<string>('INVENTORY_SERVICE_URL')!),
    ]);

    const statuses = [security.status, inventory.status];
    const overall = statuses.every(s => s === 'UP')
      ? 'UP'
      : statuses.every(s => s === 'DOWN')
        ? 'DOWN'
        : 'DEGRADED';

    return {
      status: overall,
      timestamp: new Date().toISOString(),
      services: {
        'security-service': { status: security.status, responseTimeMs: security.responseTimeMs },
        'inventory-service': { status: inventory.status, responseTimeMs: inventory.responseTimeMs },
      },
    };
  }

  private async ping(name: string, baseUrl: string): Promise<ServiceStatus> {
    const start = Date.now();
    try {
      await firstValueFrom(
        this.httpService.get(`${baseUrl}/api/v1/health`, { timeout: 2000 }),
      );
      return { status: 'UP', responseTimeMs: Date.now() - start };
    } catch {
      return { status: 'DOWN', responseTimeMs: null };
    }
  }
}
