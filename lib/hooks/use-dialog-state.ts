"use client";

import { useState, useCallback } from "react";

export function useDialogState<T>() {
  const [item, setItem] = useState<T | null>(null);

  const isOpen = item !== null;

  const open = useCallback((value: T) => setItem(value), []);
  const close = useCallback(() => setItem(null), []);
  const onOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen) setItem(null);
  }, []);

  return { item, isOpen, open, close, onOpenChange };
}
