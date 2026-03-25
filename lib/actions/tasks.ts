"use server";

import type { ActionResult } from "@/lib/types/action-result";
import { ok, fail } from "@/lib/types/action-result";
import type { TaskWithComputed } from "@/lib/types/task";
import { CreateTaskSchema, UpdateTaskSchema } from "@/lib/schemas/task";
import {
  findTasks,
  insertTask,
  patchTask,
  removeTask,
} from "@/lib/models/task-repository";
import {
  serializeTask,
  transitionToRunning,
  transitionToPaused,
  transitionToCompleted,
  transitionToReset,
} from "@/lib/domain/task-state-machine";
import { withAction, requireTask } from "@/lib/actions/action-helpers";

// Re-export types for backward compatibility
export type { ActionResult } from "@/lib/types/action-result";
export type { TaskWithComputed } from "@/lib/types/task";

// ─── CRUD Actions ────────────────────────────────────────────────────────────

export async function getTasks(
  search?: string
): Promise<ActionResult<TaskWithComputed[]>> {
  return withAction(async () => {
    const tasks = await findTasks(search);
    return ok(tasks.map(serializeTask));
  });
}

export async function getTask(
  id: string
): Promise<ActionResult<TaskWithComputed>> {
  return withAction(async () => {
    const lookup = await requireTask(id);
    if (!lookup.success) return lookup;
    return ok(serializeTask(lookup.data));
  });
}

export async function createTask(
  formData: { name: string; description?: string; budgetMs?: number }
): Promise<ActionResult<TaskWithComputed>> {
  return withAction(async () => {
    const validated = CreateTaskSchema.parse(formData);
    const task = await insertTask({
      name: validated.name,
      description: validated.description,
      accumulatedMs: 0,
      budgetMs: validated.budgetMs ?? null,
    });
    return ok(serializeTask(task));
  }, { revalidate: "/" });
}

export async function updateTask(
  formData: { id: string; name: string; description?: string; budgetMs?: number | null }
): Promise<ActionResult<TaskWithComputed>> {
  return withAction(async () => {
    const validated = UpdateTaskSchema.parse(formData);
    const lookup = await requireTask(validated.id);
    if (!lookup.success) return lookup;
    const task = await patchTask(validated.id, {
      name: validated.name,
      description: validated.description,
      ...(validated.budgetMs !== undefined && { budgetMs: validated.budgetMs }),
    });
    return ok(serializeTask(task));
  }, { revalidate: "/" });
}

export async function deleteTask(
  id: string
): Promise<ActionResult> {
  return withAction(async () => {
    await removeTask(id);
    return ok(undefined);
  }, { revalidate: "/" });
}

// ─── Timer Actions ───────────────────────────────────────────────────────────

export async function startTask(
  id: string
): Promise<ActionResult<TaskWithComputed>> {
  return withAction(async () => {
    const lookup = await requireTask(id);
    if (!lookup.success) return lookup;
    const transition = transitionToRunning(lookup.data);
    if (!transition.valid) return fail(transition.error);
    const updated = await patchTask(id, transition.data);
    return ok(serializeTask(updated));
  }, { revalidate: "/" });
}

export async function pauseTask(
  id: string
): Promise<ActionResult<TaskWithComputed>> {
  return withAction(async () => {
    const lookup = await requireTask(id);
    if (!lookup.success) return lookup;
    const transition = transitionToPaused(lookup.data);
    if (!transition.valid) return fail(transition.error);
    const updated = await patchTask(id, transition.data);
    return ok(serializeTask(updated));
  }, { revalidate: "/" });
}

export async function resumeTask(
  id: string
): Promise<ActionResult<TaskWithComputed>> {
  return withAction(async () => {
    const lookup = await requireTask(id);
    if (!lookup.success) return lookup;
    const transition = transitionToRunning(lookup.data);
    if (!transition.valid) return fail(transition.error);
    const updated = await patchTask(id, transition.data);
    return ok(serializeTask(updated));
  }, { revalidate: "/" });
}

export async function completeTask(
  id: string
): Promise<ActionResult<TaskWithComputed>> {
  return withAction(async () => {
    const lookup = await requireTask(id);
    if (!lookup.success) return lookup;
    const transition = transitionToCompleted(lookup.data);
    if (!transition.valid) return fail(transition.error);
    const updated = await patchTask(id, transition.data);
    return ok(serializeTask(updated));
  }, { revalidate: "/" });
}

export async function resetTask(
  id: string
): Promise<ActionResult<TaskWithComputed>> {
  return withAction(async () => {
    const lookup = await requireTask(id);
    if (!lookup.success) return lookup;
    const transition = transitionToReset();
    if (!transition.valid) return fail(transition.error);
    const updated = await patchTask(id, transition.data);
    return ok(serializeTask(updated));
  }, { revalidate: "/" });
}
