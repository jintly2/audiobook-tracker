import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { BookOpen, MicVocal } from 'lucide-react';
import type { RecommendationItem } from '@/types/api';
import { cn } from '@/lib/utils';

interface RecommendationCardProps {
  item: RecommendationItem;
}

const categoryIconMap: Record<string, React.ReactNode> = {
  audio_drama: <MicVocal className="size-8" />,
  audiobook: <BookOpen className="size-8" />,
};

const categoryBgMap: Record<string, string> = {
  audio_drama: 'from-rose-100 to-amber-100',
  audiobook: 'from-amber-100 to-orange-100',
};

const RecommendationCard: React.FC<RecommendationCardProps> = ({ item }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={item.coverUrl}
          alt={item.title}
          className="aspect-[3/4] w-full object-cover"
          fallback={
            <div
              className={cn(
                'flex h-full w-full items-center justify-center bg-gradient-to-br text-amber-400',
                categoryBgMap[item.category] || 'from-amber-100 to-orange-100',
              )}
            >
              {categoryIconMap[item.category] || <BookOpen className="size-12" />}
            </div>
          }
        />
        <div className="absolute left-2 top-2 flex gap-1">
          <Badge variant="secondary" className="text-xs">
            {item.platformLabel}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {item.categoryLabel}
          </Badge>
        </div>
      </div>
      <CardContent className="p-3">
        <h3 className="line-clamp-1 font-semibold text-foreground">
          {item.title}
        </h3>
        {item.originalWork && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            原著：{item.originalWork}
          </p>
        )}
        {item.voiceActors && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            CV：{item.voiceActors}
          </p>
        )}
        {item.synopsis && (
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
            {item.synopsis}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
