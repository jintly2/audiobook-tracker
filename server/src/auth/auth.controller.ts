import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

class LoginDto {
  email: string;
  password: string;
}

class SignupDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const result = await this.authService.login(body.email, body.password);
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('signup')
  async signup(@Body() body: SignupDto) {
    const user = await this.authService.signup(body.email, body.password);
    // 注册后自动登录
    const result = await this.authService.login(body.email, body.password);
    return {
      user,
      accessToken: result.accessToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    // @ts-ignore - user is set by JwtAuthGuard
    return req.user;
  }
}
