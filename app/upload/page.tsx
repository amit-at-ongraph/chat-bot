"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Button } from "@/app/components/ui/Button";
import { Plus, Search, Trash2, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Scenario, Jurisdiction, LifecycleState } from "@/lib/constants";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  getPaginationRowModel,
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

interface Chunk {
  chunkId: string;
  content: string;
  topic?: string;
  scenario?: string;
  jurisdiction?: string;
  lifecycleState?: string;
  createdAt: string;
}

export default function ChunksPage() {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filters, setFilters] = useState({
    scenario: "",
    jurisdiction: "",
    lifecycleState: "",
  });

  const fetchChunks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.scenario) params.append("scenario", filters.scenario);
      if (filters.jurisdiction) params.append("jurisdiction", filters.jurisdiction);
      if (filters.lifecycleState) params.append("lifecycleState", filters.lifecycleState);

      const { data } = await axios.get(`/api/chunks?${params.toString()}`);
      setChunks(data.chunks || []);
    } catch (error) {
      console.error("Failed to fetch chunks:", error);
      toast.error("Failed to load chunks");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchChunks();
  }, [filters, fetchChunks]);

  const columns = useMemo<ColumnDef<Chunk>[]>(
    () => [
      {
        accessorKey: "content",
        header: "Content",
        cell: ({ row }) => (
          <div className="max-w-md font-light text-[13px] leading-relaxed">
            <div className="line-clamp-2">{row.getValue("content")}</div>
          </div>
        ),
      },
      {
        accessorKey: "topic",
        header: "Topic",
        cell: ({ row }) => {
          const topic = row.getValue("topic") as string;
          return (
            <span className="inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
              {topic || "General"}
            </span>
          );
        },
      },
      {
        accessorKey: "scenario",
        header: "Scenario",
        cell: ({ row }) => (
          <div className="text-[13px] font-light text-text-secondary capitalize">
            {row.getValue("scenario")}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <div className="text-[12px] font-light text-text-muted whitespace-nowrap">
            {new Date(row.getValue("createdAt")).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: () => (
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="none"
              size="none"
              className="p-2 text-text-muted hover:text-text-main"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="none"
              size="none"
              className="p-2 text-red-400 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: chunks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const content = row.getValue("content") as string;
      const topic = row.getValue("topic") as string;
      const query = filterValue.toLowerCase();
      return (
        content.toLowerCase().includes(query) ||
        (topic && topic.toLowerCase().includes(query))
      );
    },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 max-xl:px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight mb-2">RAG Chunks</h1>
          <p className="text-text-muted text-sm font-light">
            Manage and monitor document segments used for retrieval.
          </p>
        </div>
        <Link href="/upload/new">
          <Button
            variant="primary"
            className="gap-2 rounded-xl px-4 py-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Chunk
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-border-base pb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search segments..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-9 w-full pl-9 text-xs font-light"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border-base bg-header-bg p-1">
            <select
              value={filters.scenario}
              onChange={(e) =>
                setFilters((f) => ({ ...f, scenario: e.target.value }))
              }
              className="bg-transparent px-2 text-[11px] font-medium uppercase tracking-tight focus:outline-none"
            >
              <option value="">Scenarios</option>
              {Object.values(Scenario).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="h-4 w-px bg-border-base" />
            <select
              value={filters.jurisdiction}
              onChange={(e) =>
                setFilters((f) => ({ ...f, jurisdiction: e.target.value }))
              }
              className="bg-transparent px-2 text-[11px] font-medium uppercase tracking-tight focus:outline-none"
            >
              <option value="">Jurisdictions</option>
              {Object.values(Jurisdiction).map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
            <div className="h-4 w-px bg-border-base" />
            <select
              value={filters.lifecycleState}
              onChange={(e) =>
                setFilters((f) => ({ ...f, lifecycleState: e.target.value }))
              }
              className="bg-transparent px-2 text-[11px] font-medium uppercase tracking-tight focus:outline-none"
            >
              <option value="">Status</option>
              {Object.values(LifecycleState).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border-base bg-white shadow-sm dark:bg-[#111111]/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-border-light/30 border-b border-border-base text-[12px] font-medium uppercase tracking-wider text-text-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-border-base">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-6 py-4 font-medium h-auto">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-border-base divide-y">
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i} className="animate-pulse border-border-base">
                    <TableCell className="px-6 py-4">
                      <div className="bg-border-light h-4 w-full rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="bg-border-light h-4 w-24 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="bg-border-light h-4 w-20 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="bg-border-light h-4 w-16 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="bg-border-light ml-auto h-4 w-12 rounded" />
                    </TableCell>
                  </TableRow>
                ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-text-muted italic"
                >
                  No chunks found matching your searching criteria.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-border-light/20 transition-colors group border-border-base"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-4 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between  border-border-base px-6 py-4">
          <p className="text-[12px] font-light text-text-muted">
            Showing {table.getRowModel().rows.length} segments
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="none"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border border-border-base p-1.5 hover:bg-border-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="none"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border border-border-base p-1.5 hover:bg-border-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
