import { api } from '@/lib/api';
import type {
  AudiobookRecord,
  AudiobookListResponse,
  AudiobookStatsResponse,
  CreateAudiobookDto,
  UpdateAudiobookDto,
  AudiobookListParams,
} from '@/types/api';

export async function getList(
  params: AudiobookListParams,
): Promise<AudiobookListResponse> {
  return api.get<AudiobookListResponse>('/audiobook', {
    page: params.page,
    pageSize: params.pageSize,
    status: params.status,
    rating: params.rating,
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });
}

export async function getStats(): Promise<AudiobookStatsResponse> {
  return api.get<AudiobookStatsResponse>('/audiobook/stats');
}

export async function getById(id: string): Promise<AudiobookRecord> {
  return api.get<AudiobookRecord>(`/audiobook/${id}`);
}

export async function create(dto: CreateAudiobookDto): Promise<AudiobookRecord> {
  return api.post<AudiobookRecord>('/audiobook', dto);
}

export async function update(
  id: string,
  dto: UpdateAudiobookDto,
): Promise<AudiobookRecord> {
  return api.patch<AudiobookRecord>(`/audiobook/${id}`, dto);
}

export async function remove(id: string): Promise<void> {
  return api.delete<void>(`/audiobook/${id}`);
}
