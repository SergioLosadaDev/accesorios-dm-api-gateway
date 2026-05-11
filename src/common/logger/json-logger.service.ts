import { LoggerService, LogLevel } from '@nestjs/common';

const LEVEL_PRIORITY: Record<string, number> = {
  verbose: 0,
  debug: 1,
  log: 2,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};

export class JsonLoggerService implements LoggerService {
  private readonly minPriority: number;

  constructor() {
    const raw = (process.env.LOG_LEVEL ?? 'info').toLowerCase();
    this.minPriority = LEVEL_PRIORITY[raw] ?? LEVEL_PRIORITY['info'];
  }

  log(message: unknown, context?: string) {
    this.write('info', message, context);
  }

  error(message: unknown, trace?: string, context?: string) {
    this.write('error', message, context, trace);
  }

  warn(message: unknown, context?: string) {
    this.write('warn', message, context);
  }

  debug(message: unknown, context?: string) {
    this.write('debug', message, context);
  }

  verbose(message: unknown, context?: string) {
    this.write('verbose', message, context);
  }

  fatal(message: unknown, context?: string) {
    this.write('fatal', message, context);
  }

  isEnabled(level: LogLevel): boolean {
    return (LEVEL_PRIORITY[level] ?? 0) >= this.minPriority;
  }

  private write(
    level: string,
    message: unknown,
    context?: string,
    trace?: string,
  ): void {
    if ((LEVEL_PRIORITY[level] ?? 0) < this.minPriority) return;

    const base: Record<string, unknown> = {
      level,
      timestamp: new Date().toISOString(),
    };
    if (context) base.context = context;

    const entry: Record<string, unknown> =
      typeof message === 'object' && message !== null
        ? { ...base, ...(message as Record<string, unknown>) }
        : { ...base, message };

    if (trace) entry.trace = trace;

    process.stdout.write(JSON.stringify(entry) + '\n');
  }
}
