import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RecommendationItem } from '@/types/api';

interface RecommendationCardProps {
  item: RecommendationItem;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ item }) => {
  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardContent className="flex h-full flex-col p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
          {item.title}
        </h3>
        <div className="mt-1.5 flex shrink-0 flex-wrap gap-1">
          {item.platformLabel && (
            <Badge variant="secondary" className="text-[10px]">
              {item.platformLabel}
            </Badge>
          )}
          {item.categoryLabel && (
            <Badge variant="outline" className="text-[10px]">
              {item.categoryLabel}
            </Badge>
          )}
        </div>
        {item.voiceActors && (
          <p className="mt-2 text-xs text-muted-foreground">CV：{item.voiceActors}</p>
        )}
        {item.synopsis && (
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {item.synopsis}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
