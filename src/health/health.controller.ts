import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
@Public()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const securityUrl = this.config.get<string>('SECURITY_SERVICE_URL');
    const inventoryUrl = this.config.get<string>('INVENTORY_SERVICE_URL');

    return this.health.check([
      () => this.http.pingCheck('security-service', `${securityUrl}/actuator/health`),
      () => this.http.pingCheck('inventory-service', `${inventoryUrl}/actuator/health`),
    ]);
  }
}
