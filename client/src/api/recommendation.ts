import apiClient from './index';
import type {
  RecommendationItem,
  RecommendationBatchParams,
} from '@/types/api';

export async function getRecommendationBatch(
  params: RecommendationBatchParams,
): Promise<RecommendationItem[]> {
  const usp = new URLSearchParams();
  usp.set('platform', params.platform);
  usp.set('category', params.category);
  if (params.limit !== undefined) usp.set('limit', String(params.limit));
  const { data } = await apiClient.get(`/recommendation/batch?${usp.toString()}`);
  return data;
}

export async function getAllRecommendations(
  platform: string,
  category: string,
): Promise<RecommendationItem[]> {
  const usp = new URLSearchParams();
  usp.set('platform', platform);
  usp.set('category', category);
  const { data } = await apiClient.get(`/recommendation/all?${usp.toString()}`);
  return data;
}
