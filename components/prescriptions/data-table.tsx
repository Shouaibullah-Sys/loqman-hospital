// components/prescriptions/data-table.tsx
"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, ChevronLeft, Smartphone } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجو بر اساس نام بیمار یا تشخیص..."
            value={
              (table.getColumn("patientName")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("patientName")?.setFilterValue(event.target.value)
            }
            className="pr-10 text-sm sm:text-base bg-background/50 border-border/50 focus:bg-background transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            نمایش {table.getFilteredRowModel().rows.length} از {data.length}{" "}
            مورد
          </span>
        </div>
      </div>

      {/* Enhanced Mobile Cards View */}
      <div className="block lg:hidden space-y-4">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            // Find cells by their header text
            const cells = row.getVisibleCells();
            const patientCell = cells.find((cell) =>
              (cell.column.columnDef.header as string)?.includes("بیمار")
            );
            const statusCell = cells.find((cell) =>
              (cell.column.columnDef.header as string)?.includes("وضعیت")
            );
            const actionsCell = cells.find((cell) =>
              (cell.column.columnDef.header as string)?.includes("عملیات")
            );

            return (
              <div
                key={row.id}
                className="bg-card border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
              >
                {/* Patient Info Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {patientCell && (
                      <div className="flex-1">
                        {flexRender(
                          patientCell.column.columnDef.cell,
                          patientCell.getContext()
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {statusCell && (
                      <div>
                        {flexRender(
                          statusCell.column.columnDef.cell,
                          statusCell.getContext()
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {cells.map((cell) => {
                    const header = cell.column.columnDef.header as string;
                    if (header?.includes("بیمار") || header?.includes("وضعیت"))
                      return null;

                    return (
                      <div
                        key={cell.id}
                        className="flex flex-col items-center text-center"
                      >
                        <span className="text-xs font-medium text-muted-foreground mb-1">
                          {header}
                        </span>
                        <div className="text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  {actionsCell && (
                    <div className="w-full">
                      {flexRender(
                        actionsCell.column.columnDef.cell,
                        actionsCell.getContext()
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="border border-dashed border-border/50 rounded-xl p-12 text-center">
            <div className="text-muted-foreground mb-2">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
            </div>
            <p className="text-muted-foreground font-medium">موردی یافت نشد.</p>
            <p className="text-sm text-muted-foreground mt-1">
              لطفاً عبارت جستجو را تغییر دهید
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Desktop Table View */}
      <div className="hidden lg:block">
        <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className="whitespace-nowrap font-semibold text-foreground px-4 py-3 text-sm"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={`hover:bg-accent/50 transition-colors ${
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="whitespace-nowrap px-4 py-3"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Search className="h-8 w-8 text-muted-foreground/30" />
                        <p className="text-muted-foreground font-medium">
                          موردی یافت نشد.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          لطفاً عبارت جستجو را تغییر دهید
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Enhanced Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            نمایش {table.getFilteredRowModel().rows.length} از {data.length}{" "}
            مورد
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="flex items-center gap-1 h-8 px-3 text-xs hover:bg-primary/10 hover:border-primary/20 transition-colors"
          >
            <ChevronRight className="h-3 w-3" />
            قبلی
          </Button>
          <div className="flex items-center gap-1 px-2">
            <span className="text-sm text-muted-foreground">
              صفحه {table.getState().pagination.pageIndex + 1} از{" "}
              {table.getPageCount()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex items-center gap-1 h-8 px-3 text-xs hover:bg-primary/10 hover:border-primary/20 transition-colors"
          >
            بعدی
            <ChevronLeft className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
