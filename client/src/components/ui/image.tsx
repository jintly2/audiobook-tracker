import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
}

function Image({
  className,
  src,
  alt,
  onLoad,
  onError,
  loading = 'lazy',
  fallback,
  ...props
}: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    setLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    setError(true);
    onError?.(e);
  };

  if (error) {
    return (
      <div
        className={cn(
          'flex w-full items-center justify-center bg-amber-50 text-amber-400',
          className,
        )}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-amber-50" />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'h-full w-full transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
        {...props}
      />
    </div>
  );
}

export { Image };
