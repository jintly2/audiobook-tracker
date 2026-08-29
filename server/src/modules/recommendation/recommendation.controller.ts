import { Controller, Get, Query } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import type {
  RecommendationItem,
  RecommendationPlatform,
  RecommendationCategory,
} from '../../types/api';

@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('batch')
  async getBatch(
    @Query('platform') platform: RecommendationPlatform,
    @Query('category') category: RecommendationCategory,
    @Query('limit') limit?: string,
  ): Promise<RecommendationItem[]> {
    return this.recommendationService.getBatch(
      platform,
      category,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('all')
  async getAll(
    @Query('platform') platform: RecommendationPlatform,
    @Query('category') category: RecommendationCategory,
  ): Promise<RecommendationItem[]> {
    return this.recommendationService.getAll(platform, category);
  }
}
