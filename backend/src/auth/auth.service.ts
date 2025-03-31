/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// // src/auth/auth.service.ts
// import {
//   Injectable,
//   UnauthorizedException,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { HttpService } from '@nestjs/axios';
// import { firstValueFrom } from 'rxjs';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from '../users/entities/user.entity';
// import { Role } from '../roles/entities/role.entity';

// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly httpService: HttpService,
//     private readonly jwtService: JwtService,
//     @InjectRepository(User)
//     private usersRepository: Repository<User>,
//     @InjectRepository(Role)
//     private rolesRepository: Repository<Role>,
//   ) {}

//   async checkHustAccount(username: string, password: string): Promise<number> {
//     try {
//       const response = await firstValueFrom(
//         this.httpService.get<string>(
//           'https://api.toolhub.app/hust/KiemTraMatKhau',
//           {
//             params: {
//               taikhoan: username,
//               matkhau: password,
//             },
//             headers: {
//               accept: 'text/plain',
//             },
//           },
//         ),
//       );
//       const result = response.data.trim();
//       console.log('ToolHub Result:', result);

//       if (result === '1') {
//         return 1;
//       } else if (result === '0') {
//         return 0;
//       } else {
//         throw new InternalServerErrorException(
//           'Lỗi từ hệ thống xác thực ToolHub',
//         );
//       }
//     } catch (error) {
//       console.error('ToolHub Error:', error.response?.data);
//       throw new InternalServerErrorException(
//         'Không thể kết nối đến hệ thống xác thực ToolHub',
//       );
//     }
//   }

//   async login(username: string, password: string): Promise<any> {
//     const result = await this.checkHustAccount(username, password);
//     if (result !== 1) {
//       throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
//     }

//     // Kiểm tra user trong CSDL
//     let user = await this.usersRepository.findOne({
//       where: { email: username },
//       relations: ['role'],
//     });

//     if (!user) {
//       // Thêm mới user với role mặc định (HUST)
//       const defaultRole = await this.rolesRepository.findOne({
//         where: { name: 'HUST' },
//       });
//       if (!defaultRole) {
//         throw new InternalServerErrorException('Role HUST không tồn tại');
//       }
//       user = this.usersRepository.create({
//         email: username,
//         description: 'Người dùng mới',
//         role: defaultRole,
//       });
//       await this.usersRepository.save(user);
//     } else {
//       // Cập nhật latestData
//       user.latestData = new Date();
//       await this.usersRepository.save(user);
//     }

//     const payload = { sub: user.email, role: user.role.name };
//     return {
//       access_token: this.jwtService.sign(payload),
//       user: { email: user.email, role: user.role.name },
//     };
//   }

//   async getAllUsers(): Promise<User[]> {
//     return this.usersRepository.find({ relations: ['role'] });
//   }

//   async updateUserRole(email: string, roleName: string): Promise<User> {
//     const user = await this.usersRepository.findOne({
//       where: { email },
//       relations: ['role'],
//     });
//     if (!user) {
//       throw new UnauthorizedException('Người dùng không tồn tại');
//     }

//     const role = await this.rolesRepository.findOne({
//       where: { name: roleName },
//     });
//     if (!role) {
//       throw new UnauthorizedException('Role không hợp lệ');
//     }

//     user.role = role;
//     return this.usersRepository.save(user);
//   }
// }

// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  // Hardcode tài khoản test
  private readonly testAccounts = [
    { username: 'admin@test.com', password: 'admin123' },
    { username: 'user1@test.com', password: 'user123' },
    { username: 'disabled@test.com', password: 'disable123' },
  ];

  checkHustAccount(username: string, password: string): number {
    // Giả lập xác thực tài khoản
    const account = this.testAccounts.find(
      (acc) => acc.username === username && acc.password === password,
    );

    if (account) {
      return 1; // Đăng nhập thành công
    } else {
      return 0; // Đăng nhập thất bại
    }
  }

  async login(username: string, password: string): Promise<any> {
    const result = this.checkHustAccount(username, password);
    if (result !== 1) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Kiểm tra user trong CSDL
    let user = await this.usersRepository.findOne({
      where: { email: username },
      relations: ['role'],
    });

    if (!user) {
      // Thêm mới user với role mặc định (HUST)
      let defaultRole;
      if (username === 'admin@test.com') {
        defaultRole = await this.rolesRepository.findOne({
          where: { name: 'Admin' },
        });
      } else if (username === 'disabled@test.com') {
        defaultRole = await this.rolesRepository.findOne({
          where: { name: 'Disable' },
        });
      } else {
        defaultRole = await this.rolesRepository.findOne({
          where: { name: 'HUST' },
        });
      }

      if (!defaultRole) {
        throw new InternalServerErrorException('Role không tồn tại');
      }

      user = this.usersRepository.create({
        email: username,
        description: 'Người dùng mới',
        role: defaultRole,
      });
      await this.usersRepository.save(user);
    } else {
      // Cập nhật latestData
      user.latestData = new Date();
      await this.usersRepository.save(user);
    }

    if (user.role.name === 'Disable') {
      throw new UnauthorizedException('Tài khoản của bạn đã bị vô hiệu hóa.');
    }

    const payload = { sub: user.email, role: user.role.name };
    return {
      access_token: this.jwtService.sign(payload),
      user: { email: user.email, role: user.role.name },
    };
  }

  async getAllUsers(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['role'] });
  }

  async updateUserRole(email: string, roleName: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
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
  async getAllRoles(): Promise<Role[]> {
    return this.rolesRepository.find();
  }
}
