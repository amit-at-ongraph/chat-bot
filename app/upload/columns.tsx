import { Button } from "@/app/components/ui/Button";
import { EnumSelect } from "@/components/ui/enum-select";
import { LifecycleState } from "@/lib/constants";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { createOptionsFromEnum } from "../utils/string.utils";
import { Chunk } from "./service";

interface CreateChunkColumnsOptions {
  t: (key: string) => string;
  onToggleStatus: (row: Row<Chunk>) => (value: string) => void;
  onDelete: (chunkId: string) => void;
  onToggleSort: () => void;
}

export function createChunkColumns({
  t,
  onToggleStatus,
  onDelete,
  onToggleSort,
}: CreateChunkColumnsOptions): ColumnDef<Chunk>[] {
  return [
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
          onValueChange={onToggleStatus(row)}
          options={createOptionsFromEnum(LifecycleState)}
          triggerClassName="w-fit"
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <div onClick={onToggleSort} className="flex cursor-pointer items-center gap-1">
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
          <Link href={`/upload/edit/${row.original.chunkId}`}>
            <Button variant="none" size="none" className="text-primary hover:text-primary/80 p-2">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="none"
            size="none"
            className="p-2 text-red-400 hover:text-red-500"
            onClick={() => onDelete(row.original.chunkId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
