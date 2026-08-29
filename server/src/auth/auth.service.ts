import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url');
    const serviceRoleKey = this.configService.get<string>('supabase.serviceRoleKey');

    if (!url || !serviceRoleKey) {
      this.logger.warn('Supabase credentials not fully configured. Auth will be limited.');
    }

    this.supabase = createClient(url || '', serviceRoleKey || '', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * 验证 JWT token 并返回用户信息
   */
  async verifyToken(token: string): Promise<AuthUser> {
    try {
      const { data, error } = await this.supabase.auth.getUser(token);
      if (error || !data.user) {
        throw new UnauthorizedException('无效的认证凭证');
      }
      return {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
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
    const { data, error } = await this.supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      throw new UnauthorizedException(error.message || '注册失败');
    }
    return {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
    };
  }

  /**
   * 邮箱+密码登录（返回 session）
   */
  async login(email: string, password: string): Promise<{ user: AuthUser; accessToken: string }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user || !data.session) {
      throw new UnauthorizedException(error?.message || '邮箱或密码错误');
    }
    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
      },
      accessToken: data.session.access_token,
    };
  }

  /**
   * 通过用户 ID 获取用户信息
   */
  async getUserById(userId: string): Promise<AuthUser | null> {
    const { data, error } = await this.supabase.auth.admin.getUserById(userId);
    if (error || !data.user) {
      return null;
    }
    return {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
    };
  }
}
