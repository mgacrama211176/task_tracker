"use client";

import { cn } from "@/lib/utils";

interface BudgetProgressProps {
  accumulatedMs: number;
  budgetMs: number;
}

export function BudgetProgress({ accumulatedMs, budgetMs }: BudgetProgressProps) {
  const ratio = accumulatedMs / budgetMs;
  const percent = Math.min(ratio * 100, 100);

  const barColor =
    ratio > 1
      ? "bg-red-500"
      : ratio >= 0.75
        ? "bg-amber-400"
        : "bg-green-500";

  return (
    <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all", barColor)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
