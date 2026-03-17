import { useState, useEffect } from "react";

const KEY = "cm_compare";
const MAX = 3;

export function useCompare() {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setCompareIds(JSON.parse(raw));
    } catch {}
  }, []);

  const save = (ids: string[]) => {
    setCompareIds(ids);
    try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {}
  };

  const toggle = (id: string): boolean => {
    if (compareIds.includes(id)) {
      save(compareIds.filter(i => i !== id));
      return false;
    }
    if (compareIds.length >= MAX) return false; // at max
    save([...compareIds, id]);
    return true;
  };

  const remove = (id: string) => save(compareIds.filter(i => i !== id));
  const clear  = () => save([]);
  const isIn   = (id: string) => compareIds.includes(id);
  const isFull = compareIds.length >= MAX;

  return { compareIds, toggle, remove, clear, isIn, isFull };
}