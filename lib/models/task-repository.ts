import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";

export function findTasks(search?: string) {
  return prisma.task.findMany({
    where: search
      ? { name: { contains: search, mode: "insensitive" as Prisma.QueryMode } }
      : undefined,
    orderBy: { updatedAt: "desc" },
  });
}

export function findTaskById(id: string) {
  return prisma.task.findUnique({ where: { id } });
}

export function insertTask(data: {
  name: string;
  description?: string;
  accumulatedMs: number;
  budgetMs?: number | null;
}) {
  return prisma.task.create({
    data: {
      name: data.name,
      description: data.description,
      status: "NOT_STARTED",
      accumulatedMs: data.accumulatedMs,
      budgetMs: data.budgetMs ?? null,
    },
  });
}

export function patchTask(
  id: string,
  data: Record<string, unknown>
) {
  return prisma.task.update({ where: { id }, data });
}

export function removeTask(id: string) {
  return prisma.task.delete({ where: { id } });
}
