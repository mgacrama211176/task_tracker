"use client";

import { useState } from "react";
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
import type { TaskWithComputed } from "@/lib/actions/tasks";
import { ClipboardList } from "lucide-react";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface TaskListProps {
  tasks: TaskWithComputed[];
}

export function TaskList({ tasks }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<TaskWithComputed | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskWithComputed | null>(null);

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
              <TableHead className="hidden sm:table-cell">Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="hidden md:table-cell">Updated</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <TaskTimerControls task={task} />
                </TableCell>
                <TableCell>
                  <span
                    className={`font-medium text-sm ${
                      task.status === "COMPLETED"
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {task.name}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-xs text-muted-foreground truncate max-w-xs block">
                    {task.description || "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <TaskStatusBadge status={task.status} />
                </TableCell>
                <TableCell>
                  <TimerDisplay
                    accumulatedMs={task.accumulatedMs}
                    startedAt={task.startedAt}
                    status={task.status}
                    className={`font-mono font-semibold text-sm tabular-nums ${
                      task.status === "RUNNING"
                        ? "text-green-600"
                        : "text-foreground"
                    }`}
                  />
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
                    onEdit={() => setEditingTask(task)}
                    onDeleteConfirm={() => setDeletingTask(task)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TaskForm
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        task={editingTask ?? undefined}
      />

      <DeleteTaskDialog
        task={deletingTask}
        open={!!deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
      />
    </>
  );
}
