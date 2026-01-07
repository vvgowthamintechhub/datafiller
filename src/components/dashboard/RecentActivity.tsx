import { LogEntry } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, AlertCircle, MousePointer, FileText, Send, Zap } from 'lucide-react';

interface RecentActivityProps {
  logs: LogEntry[];
}

const actionIcons: Record<string, typeof FileText> = {
  fill: FileText,
  click: MousePointer,
  scrape: Zap,
  submit: Send,
  error: AlertCircle,
  success: CheckCircle,
  info: CheckCircle,
};

const actionColors: Record<string, string> = {
  fill: 'text-primary bg-primary/10',
  click: 'text-accent bg-accent/10',
  scrape: 'text-warning bg-warning/10',
  submit: 'text-success bg-success/10',
  error: 'text-destructive bg-destructive/10',
  success: 'text-success bg-success/10',
  info: 'text-blue-500 bg-blue-500/10',
};

export const RecentActivity = ({ logs }: RecentActivityProps) => {
  return (
    <div className="glass rounded-xl p-6 animate-slide-up">
      <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {logs.slice(0, 6).map((log) => {
          const Icon = actionIcons[log.action] || CheckCircle;
          const colorClass = actionColors[log.action] || 'text-muted-foreground bg-muted';
          return (
            <div 
              key={log.id} 
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={cn("p-2 rounded-lg", colorClass)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium truncate">{log.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{log.siteName}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(log.timestamp, { addSuffix: true })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
