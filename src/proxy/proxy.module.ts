import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SecurityProxyMiddleware } from './middlewares/security-proxy.middleware';
import { InventoryProxyMiddleware } from './middlewares/inventory-proxy.middleware';

@Module({})
export class ProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityProxyMiddleware)
      .forRoutes(
        { path: '/auth*', method: RequestMethod.ALL },
        { path: '/users*', method: RequestMethod.ALL },
        { path: '/roles*', method: RequestMethod.ALL },
      );

    consumer
      .apply(InventoryProxyMiddleware)
      .forRoutes(
        { path: '/catalog*', method: RequestMethod.ALL },
        { path: '/inventory*', method: RequestMethod.ALL },
      );
  }
}
