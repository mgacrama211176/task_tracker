"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@/lib/generated/prisma";

// ─── Validation schemas ──────────────────────────────────────────────────────

const CreateTaskSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
});

const UpdateTaskSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type TaskWithComputed = {
  id: string;
  name: string;
  description: string | null;
  status: TaskStatus;
  startedAt: Date | null;
  pausedAt: Date | null;
  accumulatedMs: number;
  createdAt: Date;
  updatedAt: Date;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function serializeTask(task: {
  id: string;
  name: string;
  description: string | null;
  status: TaskStatus;
  startedAt: Date | null;
  pausedAt: Date | null;
  accumulatedMs: bigint;
  createdAt: Date;
  updatedAt: Date;
}): TaskWithComputed {
  return {
    ...task,
    accumulatedMs: Number(task.accumulatedMs),
  };
}

// ─── CRUD Actions ────────────────────────────────────────────────────────────

export async function getTasks(
  search?: string
): Promise<ActionResult<TaskWithComputed[]>> {
  try {
    const tasks = await prisma.task.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : undefined,
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, data: tasks.map(serializeTask) };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch tasks";
    return { success: false, error: msg };
  }
}

export async function getTask(id: string): Promise<ActionResult<TaskWithComputed>> {
  try {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) return { success: false, error: "Task not found" };

    return { success: true, data: serializeTask(task) };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch task";
    return { success: false, error: msg };
  }
}

export async function createTask(
  formData: z.infer<typeof CreateTaskSchema>
): Promise<ActionResult<TaskWithComputed>> {
  try {
    const validated = CreateTaskSchema.parse(formData);

    const task = await prisma.task.create({
      data: {
        name: validated.name,
        description: validated.description,
        status: "NOT_STARTED",
        accumulatedMs: 0,
      },
    });

    revalidatePath("/");
    return { success: true, data: serializeTask(task) };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? "Validation error" };
    }
    const msg = err instanceof Error ? err.message : "Failed to create task";
    return { success: false, error: msg };
  }
}

export async function updateTask(
  formData: z.infer<typeof UpdateTaskSchema>
): Promise<ActionResult<TaskWithComputed>> {
  try {
    const validated = UpdateTaskSchema.parse(formData);

    const existing = await prisma.task.findUnique({
      where: { id: validated.id },
    });
    if (!existing) return { success: false, error: "Task not found" };

    const task = await prisma.task.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        description: validated.description,
      },
    });

    revalidatePath("/");
    return { success: true, data: serializeTask(task) };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? "Validation error" };
    }
    const msg = err instanceof Error ? err.message : "Failed to update task";
    return { success: false, error: msg };
  }
}

export async function deleteTask(id: string): Promise<ActionResult> {
  try {
    await prisma.task.delete({ where: { id } });

    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete task";
    return { success: false, error: msg };
  }
}

// ─── Timer Actions ───────────────────────────────────────────────────────────

export async function startTask(id: string): Promise<ActionResult<TaskWithComputed>> {
  try {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Task not found" };
    if (existing.status === "RUNNING") {
      return { success: false, error: "Task is already running" };
    }
    if (existing.status === "COMPLETED") {
      return { success: false, error: "Task is already completed" };
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
        pausedAt: null,
      },
    });

    revalidatePath("/");
    return { success: true, data: serializeTask(task) };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to start task";
    return { success: false, error: msg };
  }
}

export async function pauseTask(id: string): Promise<ActionResult<TaskWithComputed>> {
  try {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Task not found" };
    if (existing.status !== "RUNNING") {
      return { success: false, error: "Task is not running" };
    }

    const now = new Date();
    const elapsed = existing.startedAt
      ? now.getTime() - existing.startedAt.getTime()
      : 0;
    const newAccumulatedMs = Number(existing.accumulatedMs) + elapsed;

    const task = await prisma.task.update({
      where: { id },
      data: {
        status: "PAUSED",
        pausedAt: now,
        startedAt: null,
        accumulatedMs: newAccumulatedMs,
      },
    });

    revalidatePath("/");
    return { success: true, data: serializeTask(task) };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to pause task";
    return { success: false, error: msg };
  }
}

export async function resumeTask(id: string): Promise<ActionResult<TaskWithComputed>> {
  try {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Task not found" };
    if (existing.status !== "PAUSED") {
      return { success: false, error: "Task is not paused" };
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
        pausedAt: null,
      },
    });

    revalidatePath("/");
    return { success: true, data: serializeTask(task) };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to resume task";
    return { success: false, error: msg };
  }
}

export async function completeTask(id: string): Promise<ActionResult<TaskWithComputed>> {
  try {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Task not found" };
    if (existing.status === "COMPLETED") {
      return { success: false, error: "Task is already completed" };
    }

    const now = new Date();
    let finalAccumulatedMs = Number(existing.accumulatedMs);
    if (existing.status === "RUNNING" && existing.startedAt) {
      finalAccumulatedMs += now.getTime() - existing.startedAt.getTime();
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        status: "COMPLETED",
        startedAt: null,
        pausedAt: null,
        accumulatedMs: finalAccumulatedMs,
      },
    });

    revalidatePath("/");
    return { success: true, data: serializeTask(task) };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to complete task";
    return { success: false, error: msg };
  }
}

export async function resetTask(id: string): Promise<ActionResult<TaskWithComputed>> {
  try {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Task not found" };

    const task = await prisma.task.update({
      where: { id },
      data: {
        status: "NOT_STARTED",
        startedAt: null,
        pausedAt: null,
        accumulatedMs: 0,
      },
    });

    revalidatePath("/");
    return { success: true, data: serializeTask(task) };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to reset task";
    return { success: false, error: msg };
  }
}
