import React, { useEffect, useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import RecommendationCard from './RecommendationCard';
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { Sparkles, RefreshCw } from 'lucide-react';
import { getRecommendationBatch } from '@/api/recommendation';
import type {
  RecommendationItem,
  RecommendationPlatform,
  RecommendationCategory,
} from '@/types/api';

interface TabDef {
  id: string;
  label: string;
  platform?: RecommendationPlatform;
  category?: RecommendationCategory;
  blOnly?: boolean;
}

const tabs: TabDef[] = [
  { id: 'missevan-audio_drama', label: '猫耳·广播剧', platform: 'missevan', category: 'audio_drama' },
  { id: 'missevan-audiobook', label: '猫耳·有声书', platform: 'missevan', category: 'audiobook' },
  { id: 'manbo-audio_drama', label: '漫播·广播剧', platform: 'manbo', category: 'audio_drama' },
  { id: 'manbo-audiobook', label: '漫播·有声书', platform: 'manbo', category: 'audiobook' },
  { id: 'bl', label: '双男主', blOnly: true },
];

const BATCH_SIZE = 10;

const RecommendationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  // refreshKey 变化时重新拉取随机批次（实现“换一批”）
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const current = tabs.find((t) => t.id === activeTab);
    if (!current) return;
    let cancelled = false;
    setLoading(true);
    const fetchData = async (): Promise<void> => {
      try {
        const result: RecommendationItem[] = await getRecommendationBatch({
          platform: current.platform ?? 'missevan',
          category: current.category ?? 'audio_drama',
          blOnly: current.blOnly,
          limit: BATCH_SIZE,
        });
        if (!cancelled) {
          setItems(result);
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [activeTab, refreshKey]);

  const handleShuffle = (): void => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <TabsList className="w-full flex-wrap bg-muted/50">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShuffle}
          disabled={loading}
          className="shrink-0"
        >
          <RefreshCw className="mr-1 size-3.5" />
          换一批
        </Button>
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-xl border border-border bg-card"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <Empty>
              <EmptyMedia>
                <Sparkles className="size-8" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>暂无推荐</EmptyTitle>
                <EmptyDescription>
                  当前分类下还没有推荐内容
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item: RecommendationItem) => (
                <RecommendationCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default RecommendationPanel;
