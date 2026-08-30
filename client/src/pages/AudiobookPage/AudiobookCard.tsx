import React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Clock, Star } from 'lucide-react';
import type { AudiobookRecord } from '@/types/api';
import { cn } from '@/lib/utils';

interface AudiobookCardProps {
  record: AudiobookRecord;
  onEdit: (record: AudiobookRecord) => void;
  onDelete: (id: string) => void;
}

const statusLabelMap: Record<AudiobookRecord['status'], string> = {
  listening: '在听',
  finished: '已听完',
  shelved: '搁置',
};

const statusVariantMap: Record<
  AudiobookRecord['status'],
  'default' | 'secondary' | 'outline'
> = {
  listening: 'default',
  finished: 'secondary',
  shelved: 'outline',
};

const AudiobookCard: React.FC<AudiobookCardProps> = ({
  record,
  onEdit,
  onDelete,
}) => {
  const progress: number =
    record.totalEpisodes > 0
      ? Math.round((record.currentEpisode / record.totalEpisodes) * 100)
      : 0;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 flex-1 font-semibold text-foreground">
            {record.title}
          </h3>
          <Badge variant={statusVariantMap[record.status]}>
            {statusLabelMap[record.status]}
          </Badge>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {record.durationMinutes} 分钟
            </span>
            {record.rating > 0 && (
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="size-3.5 fill-amber-400" />
                {record.rating}
              </span>
            )}
          </div>

          {record.totalEpisodes > 0 && (
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>
                  {record.startEpisode > 0
                    ? `${record.startEpisode}→${record.currentEpisode} 集`
                    : `${record.currentEpisode}/${record.totalEpisodes} 集`}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-100">
                <div
                  className={cn(
                    'h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all',
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">{record.recordDate}</p>
        </div>

        {record.notes && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {record.notes}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-2 border-t bg-muted/20 p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(record)}
          className="size-8 p-0"
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(record.id)}
          className="size-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AudiobookCard;
