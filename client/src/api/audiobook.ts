import apiClient from './index';
import type {
  AudiobookRecord,
  AudiobookListResponse,
  AudiobookStatsResponse,
  CreateAudiobookDto,
  UpdateAudiobookDto,
  AudiobookListParams,
} from '@/types/api';

function buildQuery(params: AudiobookListParams): string {
  const usp = new URLSearchParams();
  if (params.page !== undefined) usp.set('page', String(params.page));
  if (params.pageSize !== undefined) usp.set('pageSize', String(params.pageSize));
  if (params.status) usp.set('status', params.status);
  if (params.rating !== undefined) usp.set('rating', String(params.rating));
  if (params.search) usp.set('search', params.search);
  if (params.sortBy) usp.set('sortBy', params.sortBy);
  if (params.sortOrder) usp.set('sortOrder', params.sortOrder);
  if (params.dateFrom) usp.set('dateFrom', params.dateFrom);
  if (params.dateTo) usp.set('dateTo', params.dateTo);
  const q = usp.toString();
  return q ? `?${q}` : '';
}

export async function getList(
  params: AudiobookListParams,
): Promise<AudiobookListResponse> {
  const { data } = await apiClient.get(`/audiobook${buildQuery(params)}`);
  return data;
}

export async function getStats(): Promise<AudiobookStatsResponse> {
  const { data } = await apiClient.get('/audiobook/stats');
  return data;
}

export async function getById(id: string): Promise<AudiobookRecord> {
  const { data } = await apiClient.get(`/audiobook/${id}`);
  return data;
}

export async function create(dto: CreateAudiobookDto): Promise<AudiobookRecord> {
  const { data } = await apiClient.post('/audiobook', dto);
  return data;
}

export async function update(
  id: string,
  dto: UpdateAudiobookDto,
): Promise<AudiobookRecord> {
  const { data } = await apiClient.patch(`/audiobook/${id}`, dto);
  return data;
}

export async function remove(id: string): Promise<void> {
  await apiClient.delete(`/audiobook/${id}`);
}
