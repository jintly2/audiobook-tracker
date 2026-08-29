import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'size-3.5',
  md: 'size-5',
  lg: 'size-6',
};

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readonly = false,
  size = 'md',
}) => {
  const [hoverValue, setHoverValue] = React.useState<number>(0);

  const displayValue: number = hoverValue || value;
  const starSize: string = sizeMap[size];

  const handleClick = (rating: number): void => {
    if (readonly || !onChange) return;
    onChange(rating === value ? 0 : rating);
  };

  const handleMouseEnter = (rating: number): void => {
    if (readonly) return;
    setHoverValue(rating);
  };

  const handleMouseLeave = (): void => {
    if (readonly) return;
    setHoverValue(0);
  };

  return (
    <div
      className={cn('flex items-center gap-0.5', !readonly && 'cursor-pointer')}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((star: number) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          disabled={readonly}
          className={cn(
            'p-0.5 transition-transform',
            !readonly && 'hover:scale-110',
            readonly && 'cursor-default',
          )}
          aria-label={`${star}星`}
        >
          <Star
            className={cn(
              starSize,
              'transition-colors',
              star <= displayValue
                ? 'fill-amber-400 text-amber-400'
                : 'text-amber-200',
            )}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
