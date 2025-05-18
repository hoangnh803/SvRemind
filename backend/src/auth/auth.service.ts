// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

/**
 * Service xử lý logic nghiệp vụ liên quan đến xác thực và quản lý người dùng
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  /**
   * Kiểm tra tài khoản người dùng thông qua hệ thống xác thực ToolHub
   * @param email - Email của người dùng (không phân biệt hoa thường)
   * @param password - Mật khẩu của người dùng
   * @returns {Promise<number>} - Trả về 1 nếu xác thực thành công, 0 nếu thất bại
   * @throws {InternalServerErrorException} - Nếu không thể kết nối đến ToolHub hoặc phản hồi không hợp lệ
   */
  async checkHustAccount(email: string, password: string): Promise<number> {
    // Chuẩn hóa email thành chữ thường
    const normalizedEmail = email.toLowerCase();

    try {
      const response = await firstValueFrom(
        this.httpService.get<string>(
          'https://api.toolhub.app/hust/KiemTraMatKhau',
          {
            params: {
              taikhoan: normalizedEmail,
              matkhau: password,
            },
            headers: {
              accept: 'text/plain',
            },
          },
        ),
      );
      const result = parseInt(response.data, 10);
      console.log('ToolHub Result:', result);
      return result;
    } catch (error) {
      console.error('ToolHub Error:', error);
      throw new InternalServerErrorException(
        'Không thể kết nối đến hệ thống xác thực ToolHub',
      );
    }
  }

  /**
   * Xử lý đăng nhập người dùng, tạo hoặc cập nhật thông tin người dùng và trả về JWT token
   * @param email - Email của người dùng (không phân biệt hoa thường)
   * @param password - Mật khẩu của người dùng
   * @returns {Promise<any>} - Trả về đối tượng chứa access_token và thông tin người dùng
   * @throws {UnauthorizedException} - Nếu thông tin đăng nhập không hợp lệ
   * @throws {InternalServerErrorException} - Nếu role mặc định không tồn tại hoặc lỗi hệ thống
   */
  async login(email: string, password: string): Promise<any> {
    // Chuẩn hóa email thành chữ thường
    const normalizedEmail = email.toLowerCase();

    const result = await this.checkHustAccount(normalizedEmail, password);
    if (result == 0) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Kiểm tra user trong CSDL
    let user = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
      relations: ['role'],
    });

    if (!user) {
      // Thêm mới user với role mặc định (HUST)
      const defaultRole = await this.rolesRepository.findOne({
        where: { name: 'HUST' },
      });
      if (!defaultRole) {
        throw new InternalServerErrorException('Role HUST không tồn tại');
      }
      user = this.usersRepository.create({
        email: normalizedEmail,
        description: 'Người dùng mới',
        role: defaultRole,
      });
      await this.usersRepository.save(user);
    } else {
      // Cập nhật latestData
      user.latestData = new Date();
      await this.usersRepository.save(user);
    }

    const payload = { sub: user.email, role: user.role.name, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: { email: user.email, role: user.role.name },
    };
  }

  /**
   * Lấy danh sách tất cả người dùng trong hệ thống
   * @returns {Promise<User[]>} - Trả về danh sách các đối tượng User kèm thông tin vai trò
   */
  async getAllUsers(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['role'] });
  }

  /**
   * Cập nhật vai trò của người dùng dựa trên email
   * @param email - Email của người dùng cần cập nhật (không phân biệt hoa thường)
   * @param roleName - Tên vai trò mới
   * @returns {Promise<User>} - Trả về đối tượng User đã được cập nhật
   * @throws {UnauthorizedException} - Nếu người dùng hoặc vai trò không tồn tại
   */
  async updateUserRole(email: string, roleName: string): Promise<User> {
    // Chuẩn hóa email thành chữ thường
    const normalizedEmail = email.toLowerCase();

    const user = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
      relations: ['role'],
    });
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    const role = await this.rolesRepository.findOne({
      where: { name: roleName },
    });
    if (!role) {
      throw new UnauthorizedException('Role không hợp lệ');
    }

    user.role = role;
    return this.usersRepository.save(user);
  }

  /**
   * Lấy danh sách tất cả vai trò có sẵn trong hệ thống
   * @returns {Promise<Role[]>} - Trả về danh sách các đối tượng Role
   */
  async getAllRoles(): Promise<Role[]> {
    return this.rolesRepository.find();
  }
}
