import { useState } from 'react';
import { Search, Trash2, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogEntry } from '@/types';
import { format } from 'date-fns';
import { CheckCircle, AlertCircle, MousePointer, FileText, Send, Zap, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LogsProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

const actionIcons = {
  fill: FileText,
  click: MousePointer,
  scrape: Zap,
  submit: Send,
  error: AlertCircle,
  success: CheckCircle,
};

const actionVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  fill: 'secondary',
  click: 'outline',
  scrape: 'outline',
  submit: 'default',
  error: 'destructive',
  success: 'default',
};

const LogsTable = ({ logs }: { logs: LogEntry[] }) => {
  return (
    <div className="glass rounded-xl overflow-hidden animate-slide-up">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-[120px]">Timestamp</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Message</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const Icon = actionIcons[log.action];
            return (
              <TableRow key={log.id} className="border-border group">
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {format(log.timestamp, 'HH:mm:ss')}
                </TableCell>
                <TableCell>
                  <Badge variant={actionVariants[log.action]} className="gap-1">
                    <Icon className="w-3 h-3" />
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{log.siteName}</TableCell>
                <TableCell className="text-muted-foreground">{log.message}</TableCell>
                <TableCell>
                  {log.details && (
                    <button className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {logs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">No logs yet</p>
        </div>
      )}
    </div>
  );
};

export const Logs = ({ logs, onClearLogs }: LogsProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(
    log => 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="pl-10 bg-background"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-destructive hover:text-destructive"
            onClick={onClearLogs}
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <LogsTable logs={filteredLogs} />
    </div>
  );
};