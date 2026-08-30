import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import StarRating from './StarRating';
import type {
  CreateAudiobookDto,
  AudiobookRecord,
  AudiobookStatus,
} from '@/types/api';

interface AudiobookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRecord: AudiobookRecord | null;
  onSave: (data: CreateAudiobookDto) => Promise<void> | void;
  defaultDate: string;
}

const AudiobookFormDialog: React.FC<AudiobookFormDialogProps> = ({
  open,
  onOpenChange,
  editingRecord,
  onSave,
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [startEpisode, setStartEpisode] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [recordDate, setRecordDate] = useState(defaultDate);
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<AudiobookStatus>('listening');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingRecord) {
        setTitle(editingRecord.title);
        setStartEpisode(editingRecord.startEpisode);
        setCurrentEpisode(editingRecord.currentEpisode);
        setTotalEpisodes(editingRecord.totalEpisodes);
        setDurationMinutes(editingRecord.durationMinutes);
        setRecordDate(editingRecord.recordDate);
        setRating(editingRecord.rating);
        setStatus(editingRecord.status);
        setNotes(editingRecord.notes);
      } else {
        setTitle('');
        setStartEpisode(0);
        setCurrentEpisode(0);
        setTotalEpisodes(0);
        setDurationMinutes(0);
        setRecordDate(defaultDate);
        setRating(0);
        setStatus('listening');
        setNotes('');
      }
    }
  }, [open, editingRecord, defaultDate]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!title.trim()) return;
    const start = Number(startEpisode);
    const end = Number(currentEpisode);
    if (end > 0 && start > 0 && end < start) {
      alert('听到的集数不能小于开始的集数');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        startEpisode: start,
        currentEpisode: end,
        totalEpisodes: Number(totalEpisodes),
        durationMinutes: Number(durationMinutes),
        recordDate,
        rating,
        status,
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingRecord ? '编辑记录' : '添加记录'}
          </DialogTitle>
          <DialogDescription>
            {editingRecord ? '修改听书记录信息' : '记录你正在听的有声书'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入有声书标题"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start">从第几集</Label>
              <Input
                id="start"
                type="number"
                min={0}
                value={startEpisode}
                onChange={(e) => setStartEpisode(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current">听到第几集</Label>
              <Input
                id="current"
                type="number"
                min={0}
                value={currentEpisode}
                onChange={(e) => setCurrentEpisode(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total">总集数</Label>
              <Input
                id="total"
                type="number"
                min={0}
                value={totalEpisodes}
                onChange={(e) => setTotalEpisodes(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">时长(分)</Label>
              <Input
                id="duration"
                type="number"
                min={0}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">记录日期</Label>
              <Input
                id="date"
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as AudiobookStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="listening">在听</SelectItem>
                  <SelectItem value="finished">已听完</SelectItem>
                  <SelectItem value="shelved">搁置</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>评分</Label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="听书心得、感想等..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AudiobookFormDialog;
