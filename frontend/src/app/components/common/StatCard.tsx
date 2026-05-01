import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  gradient: string;
  delay?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  change,
  trend = 'neutral',
  icon: Icon,
  gradient,
  delay = '0s',
}: StatCardProps) {
  return (
    <Card 
      className="
        border-none shadow-[var(--shadow-card)] 
        rounded-[var(--radius)] overflow-hidden
        hover-lift transition-smooth
        bg-white animate-slide-up
      "
      style={{ animationDelay: delay }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-[14px] flex items-center justify-center shadow-md`}>
            <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          {change && (
            <div className={`
              flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
              ${trend === 'up' ? 'bg-[var(--success-light)] text-[var(--success)]' : ''}
              ${trend === 'down' ? 'bg-[var(--danger-light)] text-[var(--danger)]' : ''}
              ${trend === 'neutral' ? 'bg-[var(--card-bg)] text-[var(--text-muted)]' : ''}
            `}>
              {trend === 'up' && <TrendingUp className="w-3 h-3" strokeWidth={3} />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" strokeWidth={3} />}
              {change}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-1 font-medium uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-black text-[var(--text-dark)]">
            {value}
            {subtitle && (
              <span className="text-sm text-[var(--text-muted)] ml-1 font-normal">
                {subtitle}
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
