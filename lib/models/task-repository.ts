import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";

const taskInclude = { owner: true } as const;

export function findTasks(filters?: {
  search?: string;
  type?: string;
  ownerId?: string;
  hideDone?: boolean;
}) {
  const conditions: Prisma.TaskWhereInput[] = [];

  if (filters?.search) {
    conditions.push({
      name: { contains: filters.search, mode: "insensitive" as Prisma.QueryMode },
    });
  }

  if (filters?.type) {
    conditions.push({ type: filters.type as Prisma.EnumTaskTypeFilter });
  }

  if (filters?.ownerId) {
    conditions.push({ ownerId: filters.ownerId });
  }

  if (filters?.hideDone) {
    conditions.push({ status: { not: "DONE" } });
  }

  return prisma.task.findMany({
    where: conditions.length > 0 ? { AND: conditions } : undefined,
    include: taskInclude,
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}

export function taskNameExists(name: string) {
  return prisma.task.findUnique({ where: { name }, select: { id: true } });
}

export function findTaskById(id: string) {
  return prisma.task.findUnique({ where: { id }, include: taskInclude });
}

export function insertTask(data: {
  name: string;
  description?: string;
  type?: string;
  ownerId?: string | null;
  accumulatedMs: number;
  budgetMs?: number | null;
}) {
  return prisma.task.create({
    data: {
      name: data.name,
      description: data.description,
      type: (data.type as "TASK" | "BUG" | "ENHANCEMENT" | "FEATURE" | "BLOCKER") ?? "TASK",
      status: "NOT_STARTED",
      ownerId: data.ownerId ?? null,
      accumulatedMs: data.accumulatedMs,
      budgetMs: data.budgetMs ?? null,
    },
    include: taskInclude,
  });
}

export function patchTask(
  id: string,
  data: Record<string, unknown>
) {
  return prisma.task.update({ where: { id }, data, include: taskInclude });
}

export function removeTask(id: string) {
  return prisma.task.delete({ where: { id } });
}

// ─── Owner Repository ────────────────────────────────────────────────────────

export function findOwners() {
  return prisma.owner.findMany({ orderBy: { name: "asc" } });
}

export function findOrCreateOwner(name: string) {
  return prisma.owner.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}
