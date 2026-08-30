import { Injectable, UnauthorizedException, Logger, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { DRIZZLE_DATABASE } from '../database/db';
import { users, type User } from '../database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: string;

  constructor(
    private configService: ConfigService,
    @Inject(DRIZZLE_DATABASE) private db: PostgresJsDatabase,
  ) {
    this.jwtSecret = this.configService.get<string>('jwtSecret') || 'audiobook-tracker-dev-secret-change-in-production';
  }

  /**
   * 验证 JWT token 并返回用户信息
   */
  async verifyToken(token: string): Promise<AuthUser> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as { sub: string; email: string };
      return {
        id: payload.sub,
        email: payload.email,
        role: 'user',
      };
    } catch (err) {
      this.logger.warn(`Token verification failed: ${(err as Error).message}`);
      throw new UnauthorizedException('认证失败，请重新登录');
    }
  }

  /**
   * 邮箱+密码注册
   */
  async signup(email: string, password: string): Promise<AuthUser> {
    // 检查邮箱是否已存在
    const existing = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      throw new ConflictException('该邮箱已注册');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUsers = await this.db.insert(users).values({
      email,
      passwordHash,
    }).returning();

    const user = newUsers[0];
    return {
      id: user.id,
      email: user.email,
      role: 'user',
    };
  }

  /**
   * 邮箱+密码登录（返回 session）
   */
  async login(email: string, password: string): Promise<{ user: AuthUser; accessToken: string }> {
    const found = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (found.length === 0) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const user = found[0];
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email },
      this.jwtSecret,
      { expiresIn: '7d' },
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: 'user',
      },
      accessToken,
    };
  }

  /**
   * 通过用户 ID 获取用户信息
   */
  async getUserById(userId: string): Promise<AuthUser | null> {
    const found = await this.db.select().from(users).where(eq(users.id, userId as any)).limit(1);
    if (found.length === 0) {
      return null;
    }
    return {
      id: found[0].id,
      email: found[0].email,
      role: 'user',
    };
  }
}
