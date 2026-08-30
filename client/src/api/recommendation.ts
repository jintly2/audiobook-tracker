import { api } from '@/lib/api';
import type {
  RecommendationItem,
  RecommendationPlatform,
  RecommendationCategory,
} from '@/types/api';

interface BatchParams {
  platform: RecommendationPlatform;
  category: RecommendationCategory;
  blOnly?: boolean;
  limit?: number;
}

export async function getAllRecommendations(
  platform: RecommendationPlatform,
  category: RecommendationCategory,
  blOnly = false,
): Promise<RecommendationItem[]> {
  const items = await api.get<RecommendationItem[]>('/recommendation/all', {
    platform,
    category,
  });
  if (blOnly) {
    return items.filter((item) => (item as any).blPair === true);
  }
  return items;
}

export async function getRecommendationBatch(
  params: BatchParams,
): Promise<RecommendationItem[]> {
  const all = await getAllRecommendations(
    params.platform,
    params.category,
    params.blOnly,
  );
  const limit = params.limit ?? 10;
  // Fisher-Yates 洗牌
  const shuffled = [...all];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, limit);
}
