import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ColumnDef<T> {
 key: string;
 header: string;
 width?: string;
 render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
 columns: ColumnDef<T>[];
 data: T[];
 keyExtractor: (row: T) => string | number;
}

export function DataTable<T>({ columns, data, keyExtractor }: DataTableProps<T>) {
 return (
 <div className="overflow-hidden rounded-xl border border-border bg-white">
 <table className="w-full text-sm">
 {/* Head */}
 <thead>
 <tr className="border-b border-border">
 {columns.map((col) => (
 <th
 key={col.key}
 className={cn(
 'px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground',
 col.width
 )}
 >
 {col.header}
 </th>
 ))}
 </tr>
 </thead>
 {/* Body */}
 <tbody>
 {data.map((row) => (
 <tr
 key={keyExtractor(row)}
 className="group border-b border-border transition-colors last:border-0 hover:bg-muted/50"
 >
 {columns.map((col) => (
 <td key={col.key} className="px-5 py-3.5 text-foreground">
 {col.render(row)}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
}
