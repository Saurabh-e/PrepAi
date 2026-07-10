import React from 'react';
import { Spinner } from './Loader';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon,
  iconRight,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-[0.98] disabled:active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/25',
    secondary: 'bg-border-base/50 text-text-main border border-border-base hover:bg-border-base dark:hover:bg-border-base/80',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary/10',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20',
    dangerOutline: 'bg-transparent border border-rose-600 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20',
    ghost: 'bg-transparent text-text-main hover:bg-border-base/40',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
    >
      {loading && <Spinner size="xs" color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} />}
      {!loading && icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
};

export default Button;
