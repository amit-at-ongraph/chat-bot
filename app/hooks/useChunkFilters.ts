import { useCallback, useState } from "react";
import { useDebounce } from "./useDebounce";

export function useChunkFilters() {
  const [filters, setFilters] = useState<Record<string, string>>({
    scenario: "",
    jurisdiction: "",
    lifecycleState: "",
    applicableRoles: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 600);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const toggleSort = useCallback(() => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  }, []);

  const setFilter = useCallback((key: string, value: string) => {
    const newValue = value === "ALL" ? "" : value;
    setFilters((f) => (f[key] === newValue ? f : { ...f, [key]: newValue }));
  }, []);

  return {
    filters,
    setFilter,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    sortOrder,
    toggleSort,
  };
}
