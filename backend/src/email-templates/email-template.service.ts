/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from './entities/email-template.entity';
import { User } from '../users/entities/user.entity';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  // Tạo mới email template
  async create(
    userId: number,
    templateData: CreateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    // Validate input data
    if (!templateData.name || !templateData.title || !templateData.body) {
      throw new BadRequestException(
        'Missing required fields: name, title, or body',
      );
    }

    // Kiểm tra xem tên template đã tồn tại cho user này chưa
    const existingTemplate = await this.emailTemplateRepository.findOne({
      where: { name: templateData.name, user: { id: userId } },
    });

    if (existingTemplate) {
      throw new BadRequestException(
        `Template với tên "${templateData.name}" đã tồn tại cho người dùng này.`,
      );
    }

    try {
      // Initialize a full entity with all required properties
      const template = new EmailTemplate();
      template.name = templateData.name;
      template.title = templateData.title;
      template.body = templateData.body;
      template.user = { id: userId } as User;

      // Save the entity
      return await this.emailTemplateRepository.save(template);
    } catch (error) {
      console.error('Error creating email template:', error);
      throw new BadRequestException('Failed to create email template');
    }
  }

  // Lấy danh sách template của user
  async findByUser(userId: number): Promise<EmailTemplate[]> {
    return this.emailTemplateRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  // Lấy một template theo ID
  async findOne(id: number, userId: number): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });
    if (!template) {
      throw new NotFoundException(`Email template with ID ${id} not found`);
    }
    return template;
  }

  async update(
    id: number,
    userId: number,
    templateData: Partial<CreateEmailTemplateDto>,
  ): Promise<EmailTemplate> {
    // Kiểm tra xem templateData có chứa ít nhất một trường hợp lệ để cập nhật không
    const updateData: Partial<EmailTemplate> = {};
    if (templateData.name !== undefined) updateData.name = templateData.name;
    if (templateData.title !== undefined) updateData.title = templateData.title;
    if (templateData.body !== undefined) updateData.body = templateData.body;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields provided to update');
    }

    // Kiểm tra xem tên template đã tồn tại cho user này chưa (trừ template hiện tại)
    if (templateData.name !== undefined) {
      const existingTemplate = await this.emailTemplateRepository.findOne({
        where: { name: templateData.name, user: { id: userId } },
      });

      if (existingTemplate && existingTemplate.id !== id) {
        throw new BadRequestException(
          `Template với tên "${templateData.name}" đã tồn tại cho người dùng này.`,
        );
      }
    }

    try {
      // Cập nhật template
      const result = await this.emailTemplateRepository
        .createQueryBuilder()
        .update(EmailTemplate)
        .set(updateData)
        .where('id = :id', { id })
        .andWhere('user.id = :userId', { userId })
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException(`Email template with ID ${id} not found`);
      }

      return this.findOne(id, userId);
    } catch (error) {
      console.error('Error updating email template:', error);
      throw error instanceof BadRequestException ||
        error instanceof NotFoundException
        ? error
        : new BadRequestException('Failed to update email template');
    }
  }

  // Xóa template
  async remove(id: number, userId: number): Promise<void> {
    const template = await this.findOne(id, userId);
    await this.emailTemplateRepository.remove(template);
  }
}
