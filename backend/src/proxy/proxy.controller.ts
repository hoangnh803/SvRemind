/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/proxy/proxy.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly httpService: HttpService) {}

  @Get('student')
  async getStudent(@Query('barcode') barcode: string) {
    const apiUrl = `https://api.toolhub.app/hust/TheSinhVien?barcode=${encodeURIComponent(barcode)}`;
    const response = await lastValueFrom(
      this.httpService.get(apiUrl, { headers: { accept: 'text/plain' } }),
    );
    return response.data;
  }
}
