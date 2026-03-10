import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // For now, we'll use a simple user ID from headers or body
    // In a real app, this would validate a JWT token
    const userId = request.headers['user-id'] || request.body?.userId;
    
    if (!userId) {
      return false;
    }
    
    // Mock user object
    request.user = {
      id: parseInt(userId),
      email: 'user@example.com',
    };
    
    return true;
  }
}
