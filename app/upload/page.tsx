"use client";

import { useDebounce } from "../hooks/useDebounce";

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
import { LifecycleState } from "@/lib/constants";
import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "../i18n/useTranslation";
import { createOptionsFromEnum } from "../utils/string.utils";
import { filterConfigs } from "./filter-config";
import { Chunk, chunkService } from "./service";

export default function ChunksPage() {
  const PAGINATION_CONFIG = {
    apiLimit: 20, // Data return from API
    rowsPerPage: 5 // Data per page in UI
  };

  const { t } = useTranslation();
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const debouncedSearch = useDebounce(globalFilter, 600);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGINATION_CONFIG.rowsPerPage,
  });
  const [totalItems, setTotalItems] = useState(0);

  const [filters, setFilters] = useState<Record<string, string>>({
    scenario: "",
    jurisdiction: "",
    lifecycleState: "",
    applicableRoles: "",
  });

  // Calculate how many UI pages fit into one API fetch block
  const pagesPerBlock = PAGINATION_CONFIG.apiLimit / PAGINATION_CONFIG.rowsPerPage;

  // Calculate which server-side page we need
  const serverPageIndex = Math.floor(pagination.pageIndex / pagesPerBlock);

  const fetchChunks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await chunkService.fetchAll(
        filters,
        serverPageIndex + 1,
        PAGINATION_CONFIG.apiLimit,
        debouncedSearch,
        sortOrder
      );
      setChunks(response.chunks);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error("Failed to fetch chunks:", error);
      toast.error(t("upload.load_failed"));
    } finally {
      setLoading(false);
    }
  }, [filters, serverPageIndex, t, PAGINATION_CONFIG.apiLimit, debouncedSearch, sortOrder]);

  // Sliced data for the current client-side page
  const currentTableData = useMemo(() => {
    const localPageIndex = pagination.pageIndex % pagesPerBlock;
    const start = localPageIndex * PAGINATION_CONFIG.rowsPerPage;
    const end = start + PAGINATION_CONFIG.rowsPerPage;
    return chunks.slice(start, end);
  }, [chunks, pagination.pageIndex, pagesPerBlock, PAGINATION_CONFIG.rowsPerPage]);

  const toggleChunkStatus = useCallback(
    (row: Row<Chunk>) => async (value: string) => {
      try {
        const chunkId = row.original.chunkId;
        await chunkService.toggleStatus(chunkId, value);
        toast.success(t("upload.status_updated"));
        // Update local state to reflect change
        setChunks((prev) =>
          prev.map((c) => (c.chunkId === chunkId ? { ...c, lifecycleState: value } : c)),
        );
      } catch (error) {
        console.error("Failed to update status:", error);
        toast.error(t("upload.update_failed"));
      }
    },
    [t],
  );

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  useEffect(() => {
    // Reset to first page when filters or search changes
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [filters, debouncedSearch, sortOrder]);

  useEffect(() => {
    fetchChunks();
  }, [fetchChunks]);

  const deleteChunk = useCallback(
    async (chunkId: string) => {
      if (!confirm(t("upload.delete_chunk_confirm"))) return;

      try {
        await chunkService.delete(chunkId);
        toast.success(t("upload.chunk_deleted"));
        fetchChunks();
      } catch (error) {
        console.error("Failed to delete chunk:", error);
        toast.error(t("upload.chunk_delete_failed"));
      }
    },
    [t, fetchChunks],
  );

  const columns = useMemo<ColumnDef<Chunk>[]>(
    () => [
      {
        accessorKey: "content",
        header: t("upload.content"),
        cell: ({ row }) => (
          <div className="max-w-sm text-[13px] leading-relaxed">
            <div className="line-clamp-2 w-full">{row.getValue("content")}</div>
          </div>
        ),
      },
      {
        accessorKey: "topic",
        header: t("upload.topic"),
        cell: ({ row }) => {
          const topic = row.getValue("topic") as string;
          return (
            <span className="border-primary/10 bg-primary/5 text-primary inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-semibold">
              {topic ?? "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "scenario",
        header: t("upload.scenario"),
        cell: ({ row }) => {
          const value = row.getValue("scenario") as string;
          return <div className="text-text-secondary text-[13px]">{t(`upload.${value}`)}</div>;
        },
      },
      {
        accessorKey: "jurisdiction",
        header: t("upload.jurisdiction"),
        cell: ({ row }) => {
          const value = row.getValue("jurisdiction") as string;
          return (
            <div className="text-text-secondary text-[13px] whitespace-nowrap">
              {t(`upload.${value}`)}
            </div>
          );
        },
      },
      {
        accessorKey: "applicableRoles",
        header: t("upload.applicable_roles"),
        cell: ({ row }) => {
          const roles = row.getValue("applicableRoles") as Array<string>;
          return (
            <div className="text-text-secondary text-[13px] whitespace-nowrap">
              {roles?.map((role) => t(`upload.${role}`)).join(", ")}
            </div>
          );
        },
      },
      {
        accessorKey: "lifecycleState",
        header: t("upload.status"),
        cell: ({ row }) => (
          <EnumSelect
            value={row.getValue("lifecycleState")}
            onValueChange={toggleChunkStatus(row)}
            options={createOptionsFromEnum(LifecycleState)}
            triggerClassName="w-fit"
          />
        ),
      },
      {
        accessorKey: "createdAt",
        header: () => (
          <div onClick={toggleSort} className="flex items-center gap-1 cursor-pointer">
            {t("upload.created")}
            <ArrowUpDown className="h-3 w-3" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-text-secondary text-[12px] whitespace-nowrap">
            {new Date(row.getValue("createdAt")).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-center">{t("upload.actions")}</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1 transition-opacity">
            <Button
              variant="none"
              size="none"
              className="p-2 text-red-400 hover:text-red-500"
              onClick={() => deleteChunk(row.original.chunkId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [deleteChunk, t, toggleChunkStatus],
  );

  const table = useReactTable({
    data: currentTableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalItems / PAGINATION_CONFIG.rowsPerPage),
    state: {
      pagination: pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
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
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {filterConfigs.map(({ key, options, label, placeholder }) => (
            <EnumSelect
              key={key}
              value={filters[key]}
              onValueChange={(value) => {
                const newValue = value === "ALL" ? "" : value;
                setFilters((f) => (f[key] === newValue ? f : { ...f, [key]: newValue }));
              }}
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
              Array(2)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i} className="border-border-base animate-pulse">
                    {Array(7)
                      .fill(0)
                      .map((_, j) => (
                        <TableCell key={j} className="px-6 py-4">
                          <div className="bg-border-light h-4 w-full rounded" />
                        </TableCell>
                      ))}
                  </TableRow>
                ))
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
