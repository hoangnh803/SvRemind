/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Put,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.username, body.password);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Put('users/:email/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async updateUserRole(
    @Param('email') email: string,
    @Body('role') role: string,
  ) {
    return this.authService.updateUserRole(email, role);
  }
  @Get('roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  getAllRoles() {
    return this.authService.getAllRoles();
  }
}
