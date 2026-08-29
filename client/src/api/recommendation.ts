import { supabase } from '@/lib/supabase';
import type {
  RecommendationItem,
  RecommendationPlatform,
  RecommendationCategory,
  RecommendationBatchParams,
} from '@/types/api';

const PLATFORM_LABEL: Record<RecommendationPlatform, string> = {
  missevan: '猫耳',
  manbo: '漫播',
};

const CATEGORY_LABEL: Record<RecommendationCategory, string> = {
  audio_drama: '广播剧',
  audiobook: '有声剧',
};

/**
 * 数据库行 -> 前端推荐条目
 */
function mapRow(row: Record<string, unknown>): RecommendationItem {
  const platform = row.platform as RecommendationPlatform;
  const category = row.category as RecommendationCategory;
  return {
    id: String(row.id),
    title: String(row.title),
    platform,
    category,
    platformLabel: PLATFORM_LABEL[platform] ?? platform,
    categoryLabel: CATEGORY_LABEL[category] ?? category,
    voiceActors: row.voice_actors ? String(row.voice_actors) : '',
    originalWork: row.original_work ? String(row.original_work) : '',
    synopsis: row.synopsis ? String(row.synopsis) : '',
    coverUrl: row.cover_url ? String(row.cover_url) : '',
    sourceType: (row.source_type as RecommendationItem['sourceType']) ?? 'seed',
  };
}

export async function getAllRecommendations(
  platform: RecommendationPlatform,
  category: RecommendationCategory,
): Promise<RecommendationItem[]> {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('platform', platform)
    .eq('category', category)
    .order('sort_order', { ascending: true })
    .order('title', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

/**
 * 随机获取一批推荐（客户端洗牌，数据量小，一次拉全量即可）
 */
export async function getRecommendationBatch(
  params: RecommendationBatchParams,
): Promise<RecommendationItem[]> {
  const all = await getAllRecommendations(params.platform, params.category);
  const limit = params.limit ?? 10;
  // Fisher-Yates 洗牌
  const shuffled = [...all];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, limit);
}
