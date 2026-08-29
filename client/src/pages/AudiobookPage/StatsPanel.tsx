import React from 'react';
import StatCard from './StatCard';
import {
  Clock,
  Headphones,
  BookOpen,
  Star,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import type { AudiobookStatsResponse } from '@/types/api';

interface StatsPanelProps {
  stats: AudiobookStatsResponse | null;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} 分钟`;
    const hours: number = Math.floor(minutes / 60);
    const mins: number = minutes % 60;
    return mins > 0 ? `${hours} 小时 ${mins} 分` : `${hours} 小时`;
  };

  if (!stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="总记录数"
          value={stats.totalRecords}
          icon={<BookOpen className="size-5" />}
        />
        <StatCard
          label="总听书时长"
          value={formatDuration(stats.totalDurationMinutes)}
          icon={<Clock className="size-5" />}
        />
        <StatCard
          label="总集数"
          value={stats.totalEpisodes}
          icon={<Headphones className="size-5" />}
        />
        <StatCard
          label="平均评分"
          value={stats.averageRating > 0 ? `${stats.averageRating} 星` : '暂无'}
          icon={<Star className="size-5" />}
        />
        <StatCard
          label="整体进度"
          value={`${stats.overallProgress}%`}
          icon={<TrendingUp className="size-5" />}
        />
        <StatCard
          label="在听/已完/搁置"
          value={`${stats.statusCounts.listening}/${stats.statusCounts.finished}/${stats.statusCounts.shelved}`}
          icon={<BarChart3 className="size-5" />}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 font-semibold">状态分布</h3>
        <div className="space-y-3">
          {[
            { key: 'listening', label: '在听', count: stats.statusCounts.listening, color: 'bg-amber-400' },
            { key: 'finished', label: '已听完', count: stats.statusCounts.finished, color: 'bg-green-400' },
            { key: 'shelved', label: '搁置', count: stats.statusCounts.shelved, color: 'bg-gray-400' },
          ].map((item) => {
            const total: number = stats.totalRecords || 1;
            const pct: number = Math.round((item.count / total) * 100);
            return (
              <div key={item.key}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.count} ({pct}%)</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
