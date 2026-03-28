"use server";

import type { ActionResult } from "@/lib/types/action-result";
import { ok, fail } from "@/lib/types/action-result";
import type { TaskWithComputed } from "@/lib/types/task";
import { CreateTaskSchema, UpdateTaskSchema } from "@/lib/schemas/task";
import type { Owner } from "@/lib/types/task";
import {
  findTasks,
  insertTask,
  patchTask,
  removeTask,
  findOwners,
  findOrCreateOwner,
  taskNameExists,
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
  filters?: { search?: string; type?: string; ownerId?: string; hideDone?: boolean }
): Promise<ActionResult<TaskWithComputed[]>> {
  return withAction(async () => {
    const tasks = await findTasks(filters);
    return ok(tasks.map(serializeTask));
  });
}

export async function getOwners(): Promise<ActionResult<Owner[]>> {
  return withAction(async () => {
    const owners = await findOwners();
    return ok(owners.map((o) => ({ id: o.id, name: o.name })));
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
  formData: { name: string; description?: string; type?: string; ownerName?: string; budgetMs?: number }
): Promise<ActionResult<TaskWithComputed>> {
  return withAction(async () => {
    const validated = CreateTaskSchema.parse(formData);
    const existing = await taskNameExists(validated.name);
    if (existing) return fail("Task name already exists");
    let ownerId: string | null = null;
    if (validated.ownerName) {
      const owner = await findOrCreateOwner(validated.ownerName.trim());
      ownerId = owner.id;
    }
    const task = await insertTask({
      name: validated.name,
      description: validated.description,
      type: validated.type,
      ownerId,
      accumulatedMs: 0,
      budgetMs: validated.budgetMs ?? null,
    });
    return ok(serializeTask(task));
  }, { revalidate: "/" });
}

export async function updateTask(
  formData: { id: string; name: string; description?: string; type?: string; ownerName?: string | null; budgetMs?: number | null }
): Promise<ActionResult<TaskWithComputed>> {
  return withAction(async () => {
    const validated = UpdateTaskSchema.parse(formData);
    const lookup = await requireTask(validated.id);
    if (!lookup.success) return lookup;

    if (validated.name !== lookup.data.name) {
      const existing = await taskNameExists(validated.name);
      if (existing) return fail("Task name already exists");
    }

    let ownerId: string | null | undefined = undefined;
    if (validated.ownerName === null) {
      ownerId = null;
    } else if (validated.ownerName) {
      const owner = await findOrCreateOwner(validated.ownerName.trim());
      ownerId = owner.id;
    }

    const task = await patchTask(validated.id, {
      name: validated.name,
      description: validated.description,
      ...(validated.type !== undefined && { type: validated.type }),
      ...(ownerId !== undefined && { ownerId }),
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
