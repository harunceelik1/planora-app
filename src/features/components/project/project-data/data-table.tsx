"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react"; // İkon ekledim
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // 👇 ÖNEMLİ KISIM: Veri yoksa tabloyu çizme, özel ekran göster
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-t border-dashed border-slate-200 dark:border-slate-700 mt-4 animate-in fade-in duration-500">
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-3">
          <ClipboardList className="h-8 w-8 text-slate-300 dark:text-slate-400" />
        </div>
        <h3 className="text-slate-900 dark:text-slate-100 font-medium text-sm">No tasks found</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-xs">
          This list is empty. Add a new task above to get started.
        </p>
      </div>
    );
  }

  // Veri varsa normal tabloyu göster
  return (
    <div className="w-full">
      <Table
        className="border-separate border-spacing-y-3"
        style={{ borderSpacing: "0 12px" }}
      >
        {/* HEADER KISMI */}
        <TableHeader className="bg-transparent border-none [&_tr]:border-b-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="hover:bg-transparent border-none"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-xs font-bold text-slate-400 uppercase tracking-wider h-auto pb-2 pl-4"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        {/* BODY KISMI */}
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all border-none group"
            >
              {row.getVisibleCells().map((cell, index) => {
                const isFirst = index === 0;
                const isLast = index === row.getVisibleCells().length - 1;
                return (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "py-4 border-y border-slate-100 dark:border-slate-800",
                      isFirst && "rounded-l-xl border-l pl-4",
                      isLast && "rounded-r-xl border-r pr-4",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* PAGINATION KISMI */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground pl-2">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
