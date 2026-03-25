"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskStatusBadge } from "./task-status-badge";
import { TimerDisplay } from "./timer-display";
import { TaskTimerControls } from "./task-timer-controls";
import { TaskActionsMenu } from "./task-actions-menu";
import { TaskForm } from "./task-form";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { BudgetProgress } from "./budget-progress";
import type { TaskWithComputed } from "@/lib/types/task";
import { formatBudgetDuration, formatDate } from "@/lib/formatting/time";
import { useDialogState } from "@/lib/hooks/use-dialog-state";
import { cn } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

interface TaskListProps {
  tasks: TaskWithComputed[];
}

export function TaskList({ tasks }: TaskListProps) {
  const editDialog = useDialogState<TaskWithComputed>();
  const deleteDialog = useDialogState<TaskWithComputed>();

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-3">
        <ClipboardList className="h-12 w-12 opacity-30" />
        <p className="text-lg font-medium">No tasks yet</p>
        <p className="text-sm">Create a task to start tracking your time.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Task Name</TableHead>
              <TableHead className="hidden sm:table-cell">
                Description
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="hidden sm:table-cell">Budget</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="hidden md:table-cell">Updated</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const overBudget =
                task.budgetMs != null && task.accumulatedMs > task.budgetMs;

              return (
                <TableRow key={task.id}>
                  <TableCell>
                    <TaskTimerControls task={task} />
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "font-medium text-sm",
                        task.status === "DONE" &&
                          "line-through text-muted-foreground"
                      )}
                    >
                      {task.name}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground truncate max-w-xs block">
                      {task.description || "\u2014"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <TaskStatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>
                    <div>
                      <TimerDisplay
                        accumulatedMs={task.accumulatedMs}
                        startedAt={task.startedAt}
                        status={task.status}
                        className={cn(
                          "font-mono font-semibold text-sm tabular-nums",
                          overBudget
                            ? "text-red-600"
                            : task.status === "IN_PROGRESS"
                              ? "text-green-600"
                              : "text-foreground"
                        )}
                      />
                      {task.budgetMs != null && (
                        <BudgetProgress
                          accumulatedMs={task.accumulatedMs}
                          budgetMs={task.budgetMs}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {task.budgetMs != null
                        ? formatBudgetDuration(task.budgetMs)
                        : "--"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(task.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(task.updatedAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <TaskActionsMenu
                      task={task}
                      onEdit={() => editDialog.open(task)}
                      onDeleteConfirm={() => deleteDialog.open(task)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <TaskForm
        open={editDialog.isOpen}
        onOpenChange={editDialog.onOpenChange}
        task={editDialog.item ?? undefined}
      />

      <DeleteTaskDialog
        task={deleteDialog.item}
        open={deleteDialog.isOpen}
        onOpenChange={deleteDialog.onOpenChange}
      />
    </>
  );
}
