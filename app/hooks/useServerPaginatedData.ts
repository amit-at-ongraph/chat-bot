import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLinkedListCache } from "./useLinkedListCache";

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface UseServerPaginatedDataOptions<TItem, TResult> {
  queryKey: unknown[];
  fetchFn: (serverPage: number, limit: number) => Promise<TResult>;
  extractItems: (result: TResult) => TItem[];
  extractTotal: (result: TResult) => number;
  apiLimit: number;
  rowsPerPage: number;
  cacheDepth: number;
  prefetchEnabled: boolean;
  onError: (error: unknown) => void;
}

interface UseServerPaginatedDataReturn<TItem> {
  data: TItem[];
  totalItems: number;
  loading: boolean;
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  pageCount: number;
  refresh: () => void;
  setItems: Dispatch<SetStateAction<TItem[]>>;
}

export function useServerPaginatedData<TItem, TResult>(
  options: UseServerPaginatedDataOptions<TItem, TResult>,
): UseServerPaginatedDataReturn<TItem> {
  const { apiLimit, rowsPerPage, cacheDepth, prefetchEnabled } = options;

  const fetchFnRef = useRef(options.fetchFn);
  const extractItemsRef = useRef(options.extractItems);
  const extractTotalRef = useRef(options.extractTotal);
  const onErrorRef = useRef(options.onError);

  const [items, setItems] = useState<TItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: rowsPerPage,
  });
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const pagesPerBlock = apiLimit / rowsPerPage;
  const serverPageIndex = Math.floor(pagination.pageIndex / pagesPerBlock);

  const cache = useLinkedListCache<TResult>({ maxDepth: cacheDepth, enabled: true });
  const generationRef = useRef(0);

  const serializedKey = JSON.stringify(options.queryKey);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    cache.clear();
    generationRef.current += 1;
    setFetchTrigger((v) => v + 1);
  }, [serializedKey, cache]);

  const refresh = useCallback(() => {
    cache.clear();
    setFetchTrigger((v) => v + 1);
  }, [cache]);

  const fetchData = useCallback(async () => {
    const cached = cache.get(serverPageIndex);
    if (cached) {
      setItems(extractItemsRef.current(cached));
      setTotalItems(extractTotalRef.current(cached));
      return;
    }

    setLoading(true);
    try {
      const response = await fetchFnRef.current(serverPageIndex + 1, apiLimit);
      setItems(extractItemsRef.current(response));
      setTotalItems(extractTotalRef.current(response));
      cache.set(serverPageIndex, response);
    } catch (error) {
      onErrorRef.current(error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverPageIndex, apiLimit, cache, fetchTrigger]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!prefetchEnabled) return;

    const isLastPageOfBlock = pagination.pageIndex % pagesPerBlock === pagesPerBlock - 1;
    const nextServerPageIndex = serverPageIndex + 1;
    const totalServerPages = Math.ceil(totalItems / apiLimit);
    const hasNextBlock = nextServerPageIndex < totalServerPages;

    if (isLastPageOfBlock && hasNextBlock && !loading) {
      if (cache.has(nextServerPageIndex)) return;

      const gen = generationRef.current;
      fetchFnRef
        .current(nextServerPageIndex + 1, apiLimit)
        .then((response) => {
          if (generationRef.current === gen) {
            cache.set(nextServerPageIndex, response);
          }
        })
        .catch(() => {});
    }
  }, [
    pagination.pageIndex,
    serverPageIndex,
    pagesPerBlock,
    totalItems,
    apiLimit,
    loading,
    prefetchEnabled,
    cache,
  ]);

  const data = useMemo(() => {
    const localPageIndex = pagination.pageIndex % pagesPerBlock;
    const start = localPageIndex * rowsPerPage;
    const end = start + rowsPerPage;
    return items.slice(start, end);
  }, [items, pagination.pageIndex, pagesPerBlock, rowsPerPage]);

  const pageCount = Math.ceil(totalItems / rowsPerPage);

  return { data, totalItems, loading, pagination, setPagination, pageCount, refresh, setItems };
}
