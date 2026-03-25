export { TaskStatus } from "@/lib/generated/prisma";
import type { TaskStatus } from "@/lib/generated/prisma";

export type TaskWithComputed = {
  id: string;
  name: string;
  description: string | null;
  status: TaskStatus;
  startedAt: Date | null;
  pausedAt: Date | null;
  accumulatedMs: number;
  budgetMs: number | null;
  createdAt: Date;
  updatedAt: Date;
};
