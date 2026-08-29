import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AudiobookService } from './audiobook.service';
import type {
  AudiobookRecord,
  AudiobookListResponse,
  AudiobookStatsResponse,
  CreateAudiobookDto,
  UpdateAudiobookDto,
  AudiobookListParams,
  AudiobookStatus,
} from '../../types/api';

@Controller('audiobook')
export class AudiobookController {
  constructor(private readonly audiobookService: AudiobookService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: AudiobookStatus | 'all',
    @Query('rating') rating?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'recordDate' | 'rating' | 'createdAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<AudiobookListResponse> {
    // @ts-ignore
    const userId = req.user?.id;
    const params: AudiobookListParams = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      status,
      rating: rating !== undefined ? parseInt(rating, 10) : undefined,
      search,
      sortBy,
      sortOrder,
      dateFrom,
      dateTo,
    };
    return this.audiobookService.findAll(params, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(@Req() req: Request): Promise<AudiobookStatsResponse> {
    // @ts-ignore
    const userId = req.user?.id;
    return this.audiobookService.getStats(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<AudiobookRecord> {
    // @ts-ignore
    const userId = req.user?.id;
    return this.audiobookService.findOne(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: Request,
    @Body() dto: CreateAudiobookDto,
  ): Promise<AudiobookRecord> {
    // @ts-ignore
    const userId = req.user?.id;
    return this.audiobookService.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateAudiobookDto,
  ): Promise<AudiobookRecord> {
    // @ts-ignore
    const userId = req.user?.id;
    return this.audiobookService.update(id, dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<void> {
    // @ts-ignore
    const userId = req.user?.id;
    return this.audiobookService.remove(id, userId);
  }
}
