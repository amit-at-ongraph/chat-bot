import { TableCell, TableRow } from "@/components/ui/table";

export function TableSkeleton({ rows, columns }: { rows: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <TableRow key={i} className="border-border-base animate-pulse">
          {Array.from({ length: columns }, (_, j) => (
            <TableCell key={j} className="px-6 py-4">
              <div className="bg-border-light h-4 w-full rounded" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
