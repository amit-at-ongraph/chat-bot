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
import { ApplicableRole, Jurisdiction, LifecycleState, Scenario } from "@/lib/constants";
import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Chunk, chunkService } from "./data";

export default function ChunksPage() {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filters, setFilters] = useState({
    scenario: "",
    jurisdiction: "",
    lifecycleState: "",
    applicableRoles: "",
  });

  const fetchChunks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await chunkService.fetchAll(filters);
      setChunks(data);
    } catch (error) {
      console.error("Failed to fetch chunks:", error);
      toast.error("Failed to load chunks");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const toggleChunkStatus = (row: Row<Chunk>) => async (value: string) => {
    try {
      const chunkId = row.original.chunkId;
      await chunkService.toggleStatus(chunkId, value);
      toast.success("Status updated");
      // Update local state to reflect change
      setChunks((prev) =>
        prev.map((c) => (c.chunkId === chunkId ? { ...c, lifecycleState: value } : c)),
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchChunks();
  }, [filters, fetchChunks]);

  const deleteChunk = useCallback(async (chunkId: string) => {
    if (!confirm("Are you sure you want to delete this chunk?")) return;

    try {
      await chunkService.delete(chunkId);
      toast.success("Chunk deleted successfully");
      setChunks((prev) => prev.filter((c) => c.chunkId !== chunkId));
    } catch (error) {
      console.error("Failed to delete chunk:", error);
      toast.error("Failed to delete chunk");
    }
  }, []);

  const columns = useMemo<ColumnDef<Chunk>[]>(
    () => [
      {
        accessorKey: "content",
        header: "Content",
        cell: ({ row }) => (
          <div className="max-w-sm text-[13px] leading-relaxed">
            <div className="line-clamp-2 w-full">{row.getValue("content")}</div>
          </div>
        ),
      },
      {
        accessorKey: "topic",
        header: "Topic",
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
        header: "Scenario",
        cell: ({ row }) => (
          <div className="text-text-secondary text-[13px] capitalize">
            {row.getValue("scenario")}
          </div>
        ),
      },
      {
        accessorKey: "jurisdiction",
        header: "Jurisdiction",
        cell: ({ row }) => (
          <div className="text-text-secondary text-[13px] capitalize">
            {row.getValue("jurisdiction")}
          </div>
        ),
      },
      {
        accessorKey: "applicableRoles",
        header: "Role",
        cell: ({ row }) => (
          <div className="text-text-secondary text-[13px] capitalize">
            {(row.getValue("applicableRoles") as Array<string>)?.join(", ")}
          </div>
        ),
      },
      {
        accessorKey: "lifecycleState",
        header: "Status",
        cell: ({ row }) => (
          <EnumSelect
            value={row.getValue("lifecycleState")}
            onValueChange={toggleChunkStatus(row)}
            options={Object.values(LifecycleState)}
            triggerClassName="w-fit"
          />
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <div className="text-text-secondary text-[12px] whitespace-nowrap">
            {new Date(row.getValue("createdAt")).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
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
    [deleteChunk],
  );

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const table = useReactTable({
    data: chunks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
      pagination: pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const content = row.getValue("content") as string;
      const topic = row.getValue("topic") as string;
      const query = filterValue.toLowerCase();
      return (
        content.toLowerCase().includes(query) || (topic && topic.toLowerCase().includes(query))
      );
    },
    onPaginationChange: setPagination,
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 max-2xl:px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-xl font-medium tracking-tight">RAG Chunks</h1>
          <p className="text-text-muted hidden text-xs font-light sm:block">
            Manage and monitor document segments used for retrieval.
          </p>
        </div>
        <Link href="/upload/new">
          <Button
            variant="primary-action"
            className="gap-2 rounded-xl px-4 py-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Chunk
          </Button>
        </Link>
      </div>

      <div className="border-border-base flex flex-wrap items-center justify-between gap-4 pb-4">
        <div className="relative w-full max-w-sm">
          <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search segments..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <EnumSelect
            value={filters.scenario}
            onValueChange={(value) =>
              setFilters((f) => ({ ...f, scenario: value === "ALL" ? "" : value }))
            }
            options={Object.values(Scenario)}
            placeholder="Scenarios"
            triggerClassName="w-fit"
            allOptionLabel="All Scenarios"
          />

          <EnumSelect
            value={filters.jurisdiction}
            onValueChange={(value) =>
              setFilters((f) => ({ ...f, jurisdiction: value === "ALL" ? "" : value }))
            }
            options={Object.values(Jurisdiction)}
            placeholder="Jurisdictions"
            triggerClassName="w-fit"
            allOptionLabel="All Jurisdictions"
          />

          <EnumSelect
            value={filters.lifecycleState}
            onValueChange={(value) =>
              setFilters((f) => ({ ...f, lifecycleState: value === "ALL" ? "" : value }))
            }
            options={Object.values(LifecycleState)}
            placeholder="Status"
            triggerClassName="w-fit"
            allOptionLabel="All Status"
          />

          <EnumSelect
            value={filters.applicableRoles}
            onValueChange={(value) =>
              setFilters((f) => ({ ...f, applicableRoles: value === "ALL" ? "" : value }))
            }
            options={Object.values(ApplicableRole)}
            placeholder="Roles"
            triggerClassName="w-fit"
            allOptionLabel="All Roles"
          />
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
                  No chunks found matching your searching criteria.
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
            Showing {table.getRowModel().rows.length} segments
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
