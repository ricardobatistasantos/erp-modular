import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthMiddleware } from '../meddleware/auth.middleware';
import { PermissionsGuard } from '../guards/permissions.guard';

@Module({
  providers: [PermissionsGuard],
  exports: [PermissionsGuard],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}