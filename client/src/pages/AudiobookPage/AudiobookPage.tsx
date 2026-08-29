import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, LogOut, Search, Calendar, List, Sparkles, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { localAudiobookApi } from '@/hooks/useLocalAudiobook';
import * as audiobookApi from '@/api/audiobook';
import CalendarView from './CalendarView';
import AudiobookCard from './AudiobookCard';
import AudiobookFormDialog from './AudiobookFormDialog';
import DayDetailDialog from './DayDetailDialog';
import RecommendationPanel from './RecommendationPanel';
import StatsPanel from './StatsPanel';
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { BookOpen } from 'lucide-react';
import type {
  AudiobookRecord,
  AudiobookStatsResponse,
  CreateAudiobookDto,
  AudiobookListParams,
  AudiobookStatus,
} from '@/types/api';

type TabKey = 'calendar' | 'list' | 'recommendation' | 'stats';

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

const AudiobookPage: React.FC = () => {
  const navigate = useNavigate();
  const { isGuest, logout, user, loading: authLoading } = useAuth();

  const api = isGuest ? localAudiobookApi : audiobookApi;

  const [activeTab, setActiveTab] = useState<TabKey>('calendar');
  const [records, setRecords] = useState<AudiobookRecord[]>([]);
  const [stats, setStats] = useState<AudiobookStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<AudiobookStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recordDate' | 'rating' | 'createdAt'>('createdAt');

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AudiobookRecord | null>(null);

  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    if (authLoading) return;
    setLoading(true);
    try {
      const [listResult, statsResult] = await Promise.all([
        api.getList({ pageSize: 100, sortBy, sortOrder: 'desc' } as AudiobookListParams),
        api.getStats(),
      ]);
      setRecords(listResult.items);
      setStats(statsResult);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载失败';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [api, authLoading, sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRecords = useMemo(() => {
    let result: AudiobookRecord[] = [...records];
    if (filterStatus !== 'all') {
      result = result.filter((r) => r.status === filterStatus);
    }
    if (search.trim()) {
      const keyword: string = search.trim().toLowerCase();
      result = result.filter((r) => r.title.toLowerCase().includes(keyword));
    }
    result.sort((a, b) => {
      const aVal: string | number = a[sortBy];
      const bVal: string | number = b[sortBy];
      if (aVal < bVal) return 1;
      if (aVal > bVal) return -1;
      return 0;
    });
    return result;
  }, [records, filterStatus, search, sortBy]);

  const dayRecords = useMemo(() => {
    return records.filter((r) => r.recordDate === selectedDate);
  }, [records, selectedDate]);

  const handlePrevMonth = (): void => {
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const handleNextMonth = (): void => {
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const handleToday = (): void => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  };

  const handleDayClick = (date: string): void => {
    setSelectedDate(date);
    setDayDialogOpen(true);
  };

  const handleAddFromDay = (): void => {
    setEditingRecord(null);
    setDayDialogOpen(false);
    setFormOpen(true);
  };

  const handleAddNew = (): void => {
    setEditingRecord(null);
    setFormOpen(true);
  };

  const handleEdit = (record: AudiobookRecord): void => {
    setEditingRecord(record);
    setDayDialogOpen(false);
    setFormOpen(true);
  };

  const handleSave = async (data: CreateAudiobookDto): Promise<void> => {
    try {
      if (editingRecord) {
        await api.update(editingRecord.id, data);
        toast.success('记录已更新');
      } else {
        await api.create(data);
        toast.success('记录已添加');
      }
      await fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '保存失败';
      toast.error(msg);
      throw err;
    }
  };

  const handleDeleteClick = (id: string): void => {
    setDeleteId(id);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deleteId) return;
    try {
      await api.remove(deleteId);
      toast.success('记录已删除');
      setDeleteId(null);
      await fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '删除失败';
      toast.error(msg);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      toast.success('已退出');
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '退出失败';
      toast.error(msg);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/60 via-orange-50/30 to-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white">
              <BookOpen className="size-4" />
            </div>
            <h1 className="text-lg font-bold">有声书追踪</h1>
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
              {isGuest ? '游客模式' : user?.email || '已登录'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleAddNew}>
              <Plus className="size-4" />
              <span className="hidden sm:inline">添加记录</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
          <TabsList className="mb-4 w-full bg-muted/50">
            <TabsTrigger value="calendar" className="flex-1">
              <Calendar className="mr-1.5 size-4" />
              日历
            </TabsTrigger>
            <TabsTrigger value="list" className="flex-1">
              <List className="mr-1.5 size-4" />
              列表
            </TabsTrigger>
            <TabsTrigger value="recommendation" className="flex-1">
              <Sparkles className="mr-1.5 size-4" />
              推荐
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex-1">
              <BarChart3 className="mr-1.5 size-4" />
              统计
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <CalendarView
              year={year}
              month={month}
              records={records}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToday={handleToday}
              onDayClick={handleDayClick}
            />
          </TabsContent>

          <TabsContent value="list">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索标题..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={filterStatus}
                  onValueChange={(v) => setFilterStatus(v as AudiobookStatus | 'all')}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="listening">在听</SelectItem>
                    <SelectItem value="finished">已听完</SelectItem>
                    <SelectItem value="shelved">搁置</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as 'recordDate' | 'rating' | 'createdAt')}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">按创建</SelectItem>
                    <SelectItem value="recordDate">按日期</SelectItem>
                    <SelectItem value="rating">按评分</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-40 animate-pulse rounded-xl border border-border bg-card"
                  />
                ))}
              </div>
            ) : filteredRecords.length === 0 ? (
              <Empty>
                <EmptyMedia>
                  <BookOpen className="size-8" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>暂无记录</EmptyTitle>
                  <EmptyDescription>
                    点击右上角按钮添加你的第一条听书记录
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRecords.map((record: AudiobookRecord) => (
                  <AudiobookCard
                    key={record.id}
                    record={record}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendation">
            <RecommendationPanel />
          </TabsContent>

          <TabsContent value="stats">
            <StatsPanel stats={stats} />
          </TabsContent>
        </Tabs>
      </main>

      <AudiobookFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingRecord={editingRecord}
        onSave={handleSave}
        defaultDate={selectedDate || getTodayStr()}
      />

      <DayDetailDialog
        open={dayDialogOpen}
        onOpenChange={setDayDialogOpen}
        date={selectedDate}
        records={dayRecords}
        onAdd={handleAddFromDay}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除后无法恢复，确定要删除这条听书记录吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AudiobookPage;
