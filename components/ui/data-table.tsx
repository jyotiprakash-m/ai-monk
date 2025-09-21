"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp, ArrowUpCircle } from "lucide-react";

// ✅ Extract ColumnVisibilitySelect as a standalone component
function ColumnVisibilitySelect({ table }: { table: any }) {
  // Import Checkbox from shadcn
  // import { Checkbox } from "@/components/ui/checkbox";
  const Checkbox = require("@/components/ui/checkbox").Checkbox;
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Show/Hide columns" />
      </SelectTrigger>
      <SelectContent>
        <div className="flex flex-col gap-2 px-2 py-2">
          {table.getAllLeafColumns().map((col: any) => (
            <label
              key={col.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={col.getIsVisible()}
                onCheckedChange={() =>
                  col.toggleVisibility(!col.getIsVisible())
                }
                className="h-4 w-4 rounded border border-input"
              />
              <span className="text-sm">{col.id}</span>
            </label>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  title: string;
  loading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalRecords,
  currentPage,
  pageSize,
  onPageChange,
  title,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const filterableColumns = table
    .getAllColumns()
    .filter((col) => col.getCanFilter());
  const [selectedColumnId, setSelectedColumnId] = React.useState<string>(
    filterableColumns[0]?.id ?? ""
  );
  const selectedColumn = table.getColumn(selectedColumnId);
  const totalPages = Math.ceil(totalRecords / pageSize);
  const offset = (currentPage - 1) * pageSize;

  function getPageNumbers(current: number, total: number): (number | "...")[] {
    const pages: (number | "...")[] = [];
    const delta = 2;
    pages.push(1);

    if (current - delta > 2) pages.push("...");
    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(total - 1, current + delta);
      i++
    ) {
      pages.push(i);
    }
    if (current + delta < total - 1) pages.push("...");
    if (total > 1) pages.push(total);

    return pages;
  }

  const exportToCSV = () => {
    const rows = table.getRowModel().rows;
    if (!rows.length) return;
    const columns = table.getAllLeafColumns();
    const header = columns.map((col) => col.id).join(",");
    const csvRows = rows.map((row) =>
      columns
        .map((col) => {
          const value = row.getValue(col.id);
          if (value == null) return "";
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csv = [header, ...csvRows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Filters & Column Visibility */}
      <div className="flex items-center justify-between py-4 gap-4 flex-wrap">
        <div className="flex items-center gap-2 ">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-2 ">
          {filterableColumns.length > 0 && (
            <>
              <Select
                value={selectedColumnId}
                onValueChange={setSelectedColumnId}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {filterableColumns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedColumn && (
                <Input
                  placeholder={`Filter ${selectedColumn.id}...`}
                  value={(selectedColumn.getFilterValue() as string) ?? ""}
                  onChange={(e) =>
                    selectedColumn.setFilterValue(e.target.value)
                  }
                  className="max-w-sm"
                />
              )}
            </>
          )}
          <ColumnVisibilitySelect table={table} />
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="h-9"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`font-semibold text-sm px-4 py-2 ${
                      header.column.getCanSort()
                        ? "cursor-pointer select-none hover:bg-accent"
                        : ""
                    }`}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {header.column.getCanSort() && (
                      <span className="ml-1 text-xs">
                        {{
                          asc: <ArrowUp className="h-4 inline-block" />,
                          desc: <ArrowDown className="h-4 inline-block" />,
                        }[header.column.getIsSorted() as string] ?? ""}
                      </span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, idx) => (
                <TableRow key={idx}>
                  {columns.map((col, colIdx) => (
                    <TableCell key={colIdx}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Server-side Pagination */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Showing {offset + 1}–{Math.min(offset + pageSize, totalRecords)} of{" "}
          {totalRecords} entries
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          {getPageNumbers(currentPage, totalPages).map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-2">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
