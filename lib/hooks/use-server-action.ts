"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/types/action-result";

interface UseServerActionOptions<T> {
  successMessage?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useServerAction<TArgs extends unknown[], TData>(
  action: (...args: TArgs) => Promise<ActionResult<TData>>,
  options?: UseServerActionOptions<TData>
): { execute: (...args: TArgs) => void; isPending: boolean } {
  const [isPending, startTransition] = useTransition();

  function execute(...args: TArgs) {
    startTransition(async () => {
      const result = await action(...args);
      if (result.success) {
        if (options?.successMessage) toast.success(options.successMessage);
        options?.onSuccess?.(result.data);
      } else {
        toast.error(result.error);
        options?.onError?.(result.error);
      }
    });
  }

  return { execute, isPending };
}
