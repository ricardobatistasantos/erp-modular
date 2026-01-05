import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.get(
      'permissions',
      context.getHandler(),
    );
    
    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const modulePermission = user.modules.find(
      (m) => m.code === permission.module,
    );

    if (!modulePermission)
      throw new ForbiddenException('Module access denied');

    if (modulePermission.totalAccess) return true;

    if (
      permission.action &&
      !modulePermission.actions.includes(permission.action)
    ) {
      throw new ForbiddenException('Action not allowed');
    }

    return true;
  }
}