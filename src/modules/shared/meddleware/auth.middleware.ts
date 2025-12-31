import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      return res.status(401).json({ message: 'Token not provided' });

    const [, token] = authHeader.split(' ');

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
      );

      req['user'] = decoded;
      next();
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
}