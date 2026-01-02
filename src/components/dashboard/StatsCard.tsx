import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient?: 'primary' | 'accent' | 'success';
}

export const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  gradient = 'primary'
}: StatsCardProps) => {
  const gradientClasses = {
    primary: 'gradient-primary',
    accent: 'gradient-accent',
    success: 'gradient-success',
  };

  const changeColors = {
    positive: 'text-success',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className="glass rounded-xl p-6 animate-slide-up hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 text-foreground">{value}</p>
          {change && (
            <p className={cn("text-sm mt-1 font-medium", changeColors[changeType])}>
              {change}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", gradientClasses[gradient])}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};
