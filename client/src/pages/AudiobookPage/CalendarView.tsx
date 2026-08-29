import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AudiobookRecord } from '@/types/api';

interface CalendarViewProps {
  year: number;
  month: number;
  records: AudiobookRecord[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onDayClick: (date: string) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function formatDate(year: number, month: number, day: number): string {
  const m: string = String(month + 1).padStart(2, '0');
  const d: string = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  year,
  month,
  records,
  onPrevMonth,
  onNextMonth,
  onToday,
  onDayClick,
}) => {
  const recordsByDate = React.useMemo(() => {
    const map: Record<string, AudiobookRecord[]> = {};
    for (const r of records) {
      if (!map[r.recordDate]) map[r.recordDate] = [];
      map[r.recordDate].push(r);
    }
    return map;
  }, [records]);

  const firstDay: number = new Date(year, month, 1).getDay();
  const daysInMonth: number = new Date(year, month + 1, 0).getDate();
  const todayStr: string = new Date().toISOString().split('T')[0];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {year} 年 {month + 1} 月
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onToday}>
            <CalendarIcon className="mr-1 size-3.5" />
            今天
          </Button>
          <Button variant="ghost" size="icon" onClick={onPrevMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onNextMonth}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w: string) => (
          <div
            key={w}
            className="py-2 text-xs font-medium text-muted-foreground"
          >
            {w}
          </div>
        ))}

        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="py-2" />;
          }
          const dateStr: string = formatDate(year, month, day);
          const dayRecords: AudiobookRecord[] = recordsByDate[dateStr] || [];
          const hasRecords: boolean = dayRecords.length > 0;
          const isToday: boolean = dateStr === todayStr;

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-lg py-2 transition-all',
                'hover:bg-amber-50',
                isToday && 'bg-amber-100/50 font-semibold text-amber-700',
                hasRecords && !isToday && 'bg-orange-50',
              )}
            >
              <span className="text-sm">{day}</span>
              {hasRecords && (
                <div className="mt-1 flex gap-0.5">
                  {dayRecords.slice(0, 3).map((r, i) => (
                    <span
                      key={i}
                      className={cn(
                        'size-1.5 rounded-full',
                        r.status === 'listening' && 'bg-amber-500',
                        r.status === 'finished' && 'bg-green-500',
                        r.status === 'shelved' && 'bg-gray-400',
                      )}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-amber-500" />
          在听
        </div>
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-green-500" />
          已听完
        </div>
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-gray-400" />
          搁置
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
