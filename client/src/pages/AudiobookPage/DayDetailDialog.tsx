import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AudiobookCard from './AudiobookCard';
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { BookOpen } from 'lucide-react';
import type { AudiobookRecord } from '@/types/api';

interface DayDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  records: AudiobookRecord[];
  onAdd: () => void;
  onEdit: (record: AudiobookRecord) => void;
  onDelete: (id: string) => void;
}

const DayDetailDialog: React.FC<DayDetailDialogProps> = ({
  open,
  onOpenChange,
  date,
  records,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{date}</DialogTitle>
          <DialogDescription>
            共 {records.length} 条听书记录
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
          {records.length === 0 ? (
            <Empty>
              <EmptyMedia>
                <BookOpen className="size-8" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>暂无记录</EmptyTitle>
                <EmptyDescription>这一天还没有听书记录</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-3">
              {records.map((record: AudiobookRecord) => (
                <AudiobookCard
                  key={record.id}
                  record={record}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={onAdd}>
            <Plus className="size-4" />
            添加记录
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DayDetailDialog;
