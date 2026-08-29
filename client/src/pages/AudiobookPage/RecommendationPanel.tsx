import React, { useEffect, useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import RecommendationCard from './RecommendationCard';
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { Sparkles } from 'lucide-react';
import { getRecommendationBatch } from '@/api/recommendation';
import type {
  RecommendationItem,
  RecommendationPlatform,
  RecommendationCategory,
} from '@/types/api';

interface TabKey {
  platform: RecommendationPlatform;
  category: RecommendationCategory;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: { platform: 'missevan', category: 'audio_drama' }, label: '猫耳·广播剧' },
  { key: { platform: 'missevan', category: 'audiobook' }, label: '猫耳·有声书' },
  { key: { platform: 'manbo', category: 'audio_drama' }, label: '漫播·广播剧' },
  { key: { platform: 'manbo', category: 'audiobook' }, label: '漫播·有声书' },
];

const tabKeyToString = (k: TabKey): string => `${k.platform}-${k.category}`;

const RecommendationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(tabKeyToString(tabs[0].key));
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = tabs.find(
      (t) => tabKeyToString(t.key) === activeTab,
    );
    if (!current) return;

    let cancelled = false;
    setLoading(true);

    const fetchData = async (): Promise<void> => {
      try {
        const result: RecommendationItem[] = await getRecommendationBatch({
          platform: current.key.platform,
          category: current.key.category,
          limit: 12,
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
  }, [activeTab]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4 w-full flex-wrap bg-muted/50">
        {tabs.map((tab) => (
          <TabsTrigger key={tabKeyToString(tab.key)} value={tabKeyToString(tab.key)}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tabKeyToString(tab.key)} value={tabKeyToString(tab.key)}>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-xl border border-border bg-card"
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
