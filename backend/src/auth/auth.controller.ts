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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

/**
 * Controller xử lý các endpoint liên quan đến xác thực và quản lý người dùng
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Xử lý đăng nhập người dùng và trả về JWT token
   * @param body - Đối tượng DTO chứa thông tin đăng nhập (email và password)
   * @returns {Promise<any>} - Trả về đối tượng chứa access_token và thông tin người dùng
   * @throws {UnauthorizedException} - Nếu thông tin đăng nhập không hợp lệ
   */
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đăng nhập người dùng' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công, trả về JWT token',
    schema: {
      example: {
        access_token: 'jwt.token.here',
        user: { email: 'user@example.com', role: 'HUST' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không hợp lệ' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  /**
   * Lấy danh sách tất cả người dùng
   * @returns {Promise<User[]>} - Trả về danh sách các đối tượng User
   * @throws {ForbiddenException} - Nếu người dùng không có quyền Admin
   */
  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả người dùng',
    schema: {
      example: [{ email: 'user@example.com', role: 'User' }],
    },
  })
  @ApiResponse({ status: 403, description: 'Cần quyền Admin' })
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  /**
   * Cập nhật vai trò của người dùng dựa trên email
   * @param email - Email của người dùng cần cập nhật
   * @param role - Tên vai trò mới
   * @returns {Promise<User>} - Trả về đối tượng User đã được cập nhật
   * @throws {ForbiddenException} - Nếu người dùng không có quyền Admin
   * @throws {UnauthorizedException} - Nếu người dùng hoặc vai trò không tồn tại
   */
  @Put('users/:email/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật vai trò của người dùng' })
  @ApiParam({
    name: 'email',
    description: 'Email của người dùng cần cập nhật',
    example: 'user@example.com',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: { type: 'string', example: 'Admin' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Vai trò của người dùng được cập nhật thành công',
    schema: {
      example: { email: 'user@example.com', role: 'Admin' },
    },
  })
  @ApiResponse({ status: 403, description: 'Cần quyền Admin' })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại' })
  async updateUserRole(
    @Param('email') email: string,
    @Body('role') role: string,
  ) {
    return this.authService.updateUserRole(email, role);
  }

  /**
   * Lấy danh sách tất cả vai trò có sẵn
   * @returns {Promise<Role[]>} - Trả về danh sách các đối tượng Role
   * @throws {ForbiddenException} - Nếu người dùng không có quyền Admin
   */
  @Get('roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách tất cả vai trò' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả vai trò',
    schema: {
      example: ['Admin', 'User', 'HUST'],
    },
  })
  @ApiResponse({ status: 403, description: 'Cần quyền Admin' })
  getAllRoles() {
    return this.authService.getAllRoles();
  }
}
