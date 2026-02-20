import { useMemo, useRef } from "react";

interface LinkedListNode<T> {
  key: string | number;
  data: T;
  prev: LinkedListNode<T> | null;
  next: LinkedListNode<T> | null;
}

interface LinkedListState<T> {
  head: LinkedListNode<T> | null;
  tail: LinkedListNode<T> | null;
  map: Map<string | number, LinkedListNode<T>>;
  size: number;
}

interface UseLinkedListCacheOptions {
  maxDepth: number;
  enabled?: boolean;
}

export interface LinkedListCache<T> {
  get: (key: string | number) => T | undefined;
  set: (key: string | number, data: T) => void;
  has: (key: string | number) => boolean;
  clear: () => void;
}

export function useLinkedListCache<T>(options: UseLinkedListCacheOptions): LinkedListCache<T> {
  const optionsRef = useRef(options);

  const stateRef = useRef<LinkedListState<T>>({
    head: null,
    tail: null,
    map: new Map(),
    size: 0,
  });

  const methods = useMemo<LinkedListCache<T>>(() => {
    const removeNode = (node: LinkedListNode<T>) => {
      const s = stateRef.current;
      if (node.prev) node.prev.next = node.next;
      else s.head = node.next;
      if (node.next) node.next.prev = node.prev;
      else s.tail = node.prev;
      node.prev = node.next = null;
      s.size--;
    };

    const appendToTail = (node: LinkedListNode<T>) => {
      const s = stateRef.current;
      node.prev = s.tail;
      node.next = null;
      if (s.tail) s.tail.next = node;
      else s.head = node;
      s.tail = node;
      s.size++;
    };

    return {
      get(key) {
        if (optionsRef.current.enabled === false) return undefined;
        return stateRef.current.map.get(key)?.data;
      },

      set(key, data) {
        if (optionsRef.current.enabled === false) return;
        const s = stateRef.current;

        const existing = s.map.get(key);
        if (existing) {
          existing.data = data;
          removeNode(existing);
          appendToTail(existing);
          return;
        }

        while (s.size >= optionsRef.current.maxDepth && s.head) {
          const evicted = s.head;
          removeNode(evicted);
          s.map.delete(evicted.key);
        }

        const node: LinkedListNode<T> = { key, data, prev: null, next: null };
        appendToTail(node);
        s.map.set(key, node);
      },

      has(key) {
        if (optionsRef.current.enabled === false) return false;
        return stateRef.current.map.has(key);
      },

      clear() {
        const s = stateRef.current;
        s.head = s.tail = null;
        s.map.clear();
        s.size = 0;
      },
    };
  }, []);

  return methods;
}
