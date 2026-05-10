import { Injectable } from '@nestjs/common';

@Injectable()
export class BlacklistService {
  // Phase 1 stub — Phase 2 will call Security Service HTTP endpoint (HU-DEV-SALB_07)
  async isBlacklisted(_jti: string): Promise<boolean> {
    return false;
  }
}
