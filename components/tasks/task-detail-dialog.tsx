"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskTypeBadge } from "./task-type-badge";
import { TimerDisplay } from "./timer-display";
import { BudgetProgress } from "./budget-progress";
import type { TaskWithComputed } from "@/lib/types/task";
import { formatBudgetDuration, formatDate } from "@/lib/formatting/time";
import { Label } from "@/components/ui/label";

interface TaskDetailDialogProps {
  task: TaskWithComputed | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
}: TaskDetailDialogProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {task.description && (
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Description</Label>
              <p className="text-sm whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Type</Label>
              <div>
                <TaskTypeBadge type={task.type} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Status</Label>
              <div>
                <TaskStatusBadge status={task.status} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground">Owner</Label>
            <p className="text-sm">{task.owner?.name || "Unassigned"}</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground">Elapsed time</Label>
            <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2">
              <TimerDisplay
                accumulatedMs={task.accumulatedMs}
                startedAt={task.startedAt}
                status={task.status}
                className="font-mono font-semibold text-sm tabular-nums text-foreground"
              />
            </div>
          </div>

          {task.budgetMs != null && (
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Budget</Label>
              <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 space-y-2">
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {formatBudgetDuration(task.budgetMs)}
                </span>
                <BudgetProgress
                  accumulatedMs={task.accumulatedMs}
                  budgetMs={task.budgetMs}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Created</Label>
              <p className="text-sm">{formatDate(task.createdAt)}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Updated</Label>
              <p className="text-sm">{formatDate(task.updatedAt)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
