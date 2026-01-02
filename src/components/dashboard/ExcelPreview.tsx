import { ChevronLeft, ChevronRight, Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExcelData } from '@/types';
import { cn } from '@/lib/utils';

interface ExcelPreviewProps {
  data: ExcelData | null;
  currentRow: number;
  onPrevRow: () => void;
  onNextRow: () => void;
  onImport: () => void;
}

export const ExcelPreview = ({ data, currentRow, onPrevRow, onNextRow, onImport }: ExcelPreviewProps) => {
  if (!data) {
    return (
      <div className="glass rounded-xl p-6 animate-slide-up">
        <h3 className="font-semibold text-foreground mb-4">Excel Data</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">No data imported yet</p>
          <Button onClick={onImport} className="gap-2">
            <Upload className="w-4 h-4" />
            Import Excel/CSV
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Excel Data</h3>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onPrevRow} disabled={currentRow === 0}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Row {currentRow + 1} of {data.rows.length}
          </span>
          <Button size="sm" variant="outline" onClick={onNextRow} disabled={currentRow >= data.rows.length - 1}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {data.headers.map((header, i) => (
                <th key={i} className="text-left py-2 px-3 font-medium text-muted-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.slice(Math.max(0, currentRow - 1), currentRow + 3).map((row, rowIdx) => {
              const actualIdx = Math.max(0, currentRow - 1) + rowIdx;
              return (
                <tr 
                  key={actualIdx} 
                  className={cn(
                    "border-b border-border/50 transition-colors",
                    actualIdx === currentRow && "bg-primary/10"
                  )}
                >
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="py-2 px-3 text-foreground">
                      {cell || '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
