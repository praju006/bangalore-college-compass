import { useEffect, useState } from "react";

const KEY = "cm_recently_viewed";
const MAX = 6;

export interface RecentItem {
  id: string;
  name: string;
  shortName: string;
  city: string;
  imageUrl: string;
  rating: number;
  type: string;
  visitedAt: number;
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      setItems([]);
    }
  }, []);

  const add = (item: Omit<RecentItem, "visitedAt">) => {
    setItems(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      const next = [{ ...item, visitedAt: Date.now() }, ...filtered].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const clear = () => {
    setItems([]);
    localStorage.removeItem(KEY);
  };

  return { items, add, clear };
}