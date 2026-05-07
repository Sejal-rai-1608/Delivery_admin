import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { ReactNode } from 'react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  stickyHeader?: boolean;
  skeletonRows?: number;
  minWidth?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  isLoading,
  emptyTitle = 'No results found.',
  emptyDescription,
  emptyIcon,
  stickyHeader = false,
  skeletonRows = 5,
  minWidth,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-auto rounded-lg border border-gray-100 bg-white">
      <table className="w-full text-sm text-left" style={minWidth ? { minWidth } : undefined}>
        <thead className={`text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 ${stickyHeader ? 'sticky top-0 z-[1]' : ''}`}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-6 py-4 font-medium tracking-wider">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading && !table.getRowModel().rows?.length ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((_, columnIndex) => (
                  <td key={columnIndex} className="px-6 py-4">
                    <div className="h-4 w-full max-w-[160px] animate-pulse rounded bg-gray-100" />
                  </td>
                ))}
              </tr>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={`group transition-colors hover:bg-gray-50 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-gray-700 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="h-40 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center gap-2 px-4">
                  {emptyIcon}
                  <p className="font-medium text-gray-900">{emptyTitle}</p>
                  {emptyDescription && <p className="text-sm text-gray-500">{emptyDescription}</p>}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
