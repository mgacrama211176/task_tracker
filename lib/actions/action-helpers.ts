import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/lib/types/action-result";
import { ok, fail } from "@/lib/types/action-result";
import type { Task } from "@/lib/generated/prisma";
import { findTaskById } from "@/lib/models/task-repository";

interface WithActionOptions {
  revalidate?: string;
}

export async function withAction<T>(
  operation: () => Promise<ActionResult<T>>,
  options?: WithActionOptions
): Promise<ActionResult<T>> {
  try {
    const result = await operation();
    if (result.success && options?.revalidate) {
      revalidatePath(options.revalidate);
    }
    return result;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return fail(err.issues[0]?.message ?? "Validation error");
    }
    const msg =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return fail(msg);
  }
}

export async function requireTask(id: string): Promise<ActionResult<Task>> {
  const task = await findTaskById(id);
  if (!task) return fail("Task not found");
  return ok(task);
}

export { ok, fail };
