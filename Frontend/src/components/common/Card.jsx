import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <div className={`rounded-2xl border border-border-base bg-bg-card shadow-sm overflow-hidden ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-base p-6 gap-3">
          <div>
            {title && <h3 className="text-base font-bold text-text-main leading-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-text-muted mt-1 leading-normal">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export const StatCard = ({
  title,
  value,
  description,
  icon,
  trend, // { type: 'up' | 'down', value: '12%' }
  className = '',
}) => {
  return (
    <div className={`rounded-2xl border border-border-base bg-bg-card p-6 shadow-sm flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300 ${className}`}>
      {/* Dynamic Background Glow on Hover */}
      <div className="absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-primary/5 blur-2xl group-hover:scale-150 transition-all duration-500 pointer-events-none" />

      <div className="space-y-2">
        <span className="text-xs font-semibold text-text-muted tracking-wider uppercase block">{title}</span>
        <h4 className="text-3xl font-black text-text-main tracking-tight leading-none">
          {value}
        </h4>
        
        {trend && (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`font-bold ${
                trend.type === 'up' ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {trend.type === 'up' ? '+' : '-'}{trend.value}
            </span>
            <span className="text-text-muted">{trend.label || 'since last week'}</span>
          </div>
        )}
        
        {!trend && description && (
          <p className="text-xs text-text-muted leading-none">{description}</p>
        )}
      </div>

      {icon && (
        <div className="rounded-xl p-3 bg-primary/10 text-primary dark:bg-primary/20 shrink-0">
          {icon}
        </div>
      )}
    </div>
  );
};

export default Card;
