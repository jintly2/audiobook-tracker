import { Module, OnModuleInit } from '@nestjs/common';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';

@Module({
  controllers: [RecommendationController],
  providers: [RecommendationService],
  exports: [RecommendationService],
})
export class RecommendationModule implements OnModuleInit {
  constructor(private readonly recommendationService: RecommendationService) {}

  async onModuleInit() {
    // 应用启动时确保种子数据已存在
    try {
      await this.recommendationService.ensureSeeded();
    } catch (err) {
      console.warn('[Recommendation] Seed check skipped:', (err as Error).message);
    }
  }
}
