"use client";

import { Button } from "@/app/components/ui/Button";
import { EnumSelect } from "@/components/ui/enum-select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Row, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useChunkFilters } from "../hooks/useChunkFilters";
import { useServerPaginatedData } from "../hooks/useServerPaginatedData";
import { useTranslation } from "../i18n/useTranslation";
import { TableSkeleton } from "./TableSkeleton";
import { filterConfigs } from "./config/filter-config";
import { createChunkColumns } from "./config/table-columns";
import { PAGINATION_CONFIG } from "./constants";
import { Chunk, PaginatedResult, chunkService } from "./service";

export default function ChunksPage() {
  const { t } = useTranslation();
  const {
    filters,
    setFilter,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    sortOrder,
    toggleSort,
  } = useChunkFilters();

  const { data, totalItems, loading, pagination, setPagination, pageCount, refresh, setItems } =
    useServerPaginatedData<Chunk, PaginatedResult<Chunk>>({
      queryKey: [filters, debouncedSearch, sortOrder],
      fetchFn: (page, limit) =>
        chunkService.fetchAll(filters, page, limit, debouncedSearch, sortOrder),
      extractItems: (r) => r.chunks,
      extractTotal: (r) => r.pagination.total,
      apiLimit: PAGINATION_CONFIG.apiLimit,
      rowsPerPage: PAGINATION_CONFIG.rowsPerPage,
      cacheDepth: PAGINATION_CONFIG.cacheDepth,
      prefetchEnabled: true,
      onError: (error) => {
        console.error("Failed to fetch chunks:", error);
        toast.error(t("upload.load_failed"));
      },
    });

  const toggleChunkStatus = useCallback(
    (row: Row<Chunk>) => async (value: string) => {
      try {
        const chunkId = row.original.chunkId;
        await chunkService.toggleStatus(chunkId, value);
        toast.success(t("upload.status_updated"));
        setItems((prev) =>
          prev.map((c) => (c.chunkId === chunkId ? { ...c, lifecycleState: value } : c)),
        );
      } catch (error) {
        console.error("Failed to update status:", error);
        toast.error(t("upload.update_failed"));
      }
    },
    [t, setItems],
  );

  const deleteChunk = useCallback(
    async (chunkId: string) => {
      if (!confirm(t("upload.delete_chunk_confirm"))) return;
      try {
        await chunkService.delete(chunkId);
        toast.success(t("upload.chunk_deleted"));
        refresh();
      } catch (error) {
        console.error("Failed to delete chunk:", error);
        toast.error(t("upload.chunk_delete_failed"));
      }
    },
    [t, refresh],
  );

  const columns = useMemo(
    () =>
      createChunkColumns({
        t,
        onToggleStatus: toggleChunkStatus,
        onDelete: deleteChunk,
        onToggleSort: toggleSort,
      }),
    [t, toggleChunkStatus, deleteChunk, toggleSort],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination },
    onPaginationChange: setPagination,
  });

  return (
    <div className="mx-auto space-y-6 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-xl font-medium tracking-tight">{t("upload.documents")}</h1>
          <p className="text-text-muted hidden text-xs font-light sm:block">
            {t("upload.documents_description")}
          </p>
        </div>
        <Link href="/upload/new">
          <Button
            variant="primary-action"
            className="gap-2 rounded-xl px-4 py-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            {t("upload.add_new_document")}
          </Button>
        </Link>
      </div>

      <div className="border-border-base flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={t("upload.search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {filterConfigs.map(({ key, options, label, placeholder }) => (
            <EnumSelect
              key={key}
              value={filters[key]}
              onValueChange={(value) => setFilter(key, value)}
              options={options}
              placeholder={t(placeholder)}
              triggerClassName="w-fit"
              allOptionLabel={t(label)}
            />
          ))}
        </div>
      </div>

      <div className="border-border-base overflow-hidden rounded-lg border bg-white dark:border-neutral-700 dark:bg-[#111111]/50">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-border-base hover:bg-transparent dark:border-neutral-700"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-auto px-6 py-4 font-medium">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-border-base divide-y dark:divide-neutral-700">
            {loading ? (
              <TableSkeleton rows={2} columns={columns.length} />
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-text-muted h-32 text-center italic"
                >
                  {t("upload.no_chunks_found")}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-border-light/20 group border-border-base transition-colors dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="border-border-base flex items-center justify-between border-t px-6 py-4 dark:border-neutral-700">
          <p className="text-text-muted text-[12px] font-light">
            {t("upload.showing_segments", { count: totalItems })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="none"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-border-base hover:bg-border-light border p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="none"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-border-base hover:bg-border-light border p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
