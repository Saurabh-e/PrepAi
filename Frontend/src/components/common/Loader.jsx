import React from 'react';

export const Spinner = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizeClasses = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    secondary: 'border-text-muted border-t-transparent',
  };

  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size] || sizeClasses.md} ${
        colorClasses[color] || colorClasses.primary
      } ${className}`}
    />
  );
};

export const FullscreenLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-bg-base text-text-main">
      <Spinner size="lg" />
      {message && <p className="mt-4 text-sm font-medium tracking-wider text-text-muted">{message}</p>}
    </div>
  );
};

export const Skeleton = ({ className = '', variant = 'text', width, height }) => {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      style={style}
      className={`animate-pulse bg-border-base/70 dark:bg-border-base/20 ${variantClasses[variant]} ${className}`}
    />
  );
};

export const CardSkeleton = () => (
  <div className="rounded-xl border border-border-base bg-bg-card p-6 shadow-sm">
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" className="h-12 w-12" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" height="16px" />
        <Skeleton variant="text" width="40%" height="12px" />
      </div>
    </div>
    <div className="mt-6 space-y-3">
      <Skeleton variant="text" height="14px" />
      <Skeleton variant="text" height="14px" />
      <Skeleton variant="text" width="80%" height="14px" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="border-b border-border-base">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton variant="text" height="14px" width={i === 0 ? '70%' : '50%'} />
      </td>
    ))}
  </tr>
);
