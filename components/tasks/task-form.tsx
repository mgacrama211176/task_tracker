"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createTask, updateTask } from "@/lib/actions/tasks";
import type { TaskWithComputed } from "@/lib/types/task";
import { useServerAction } from "@/lib/hooks/use-server-action";
import { msToHoursMinutes } from "@/lib/formatting/time";
import {
  BUDGET_PRESETS,
  TOAST_MESSAGES,
  TASK_NAME_MAX_LENGTH,
  TASK_DESCRIPTION_MAX_LENGTH,
  BUDGET_MAX_HOURS,
  BUDGET_MAX_MINUTES,
  MS_PER_MINUTE,
} from "@/lib/constants/task";
import { X } from "lucide-react";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskWithComputed;
}

export function TaskForm({ open, onOpenChange, task }: TaskFormProps) {
  const [name, setName] = useState(task?.name ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [budgetMs, setBudgetMs] = useState<number | null>(
    task?.budgetMs ?? null
  );
  const [customHours, setCustomHours] = useState(() => {
    if (task?.budgetMs != null) return msToHoursMinutes(task.budgetMs).hours;
    return "";
  });
  const [customMinutes, setCustomMinutes] = useState(() => {
    if (task?.budgetMs != null) return msToHoursMinutes(task.budgetMs).minutes;
    return "";
  });

  const isEditing = !!task;

  function resetForm() {
    if (!isEditing) {
      setName("");
      setDescription("");
      setBudgetMs(null);
      setCustomHours("");
      setCustomMinutes("");
    }
  }

  function handleSuccess() {
    resetForm();
    onOpenChange(false);
  }

  const create = useServerAction(createTask, {
    successMessage: TOAST_MESSAGES.taskCreated,
    onSuccess: handleSuccess,
  });
  const update = useServerAction(updateTask, {
    successMessage: TOAST_MESSAGES.taskUpdated,
    onSuccess: handleSuccess,
  });

  const isPending = create.isPending || update.isPending;

  function handleOpenChange(nextOpen: boolean) {
    if (!isPending) {
      onOpenChange(nextOpen);
    }
  }

  function selectPreset(ms: number) {
    setBudgetMs(ms);
    const { hours, minutes } = msToHoursMinutes(ms);
    setCustomHours(hours);
    setCustomMinutes(minutes);
  }

  function handleCustomChange(hours: string, minutes: string) {
    setCustomHours(hours);
    setCustomMinutes(minutes);

    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;

    if (h === 0 && m === 0) {
      setBudgetMs(null);
    } else {
      setBudgetMs((h * 60 + m) * MS_PER_MINUTE);
    }
  }

  function clearBudget() {
    setBudgetMs(null);
    setCustomHours("");
    setCustomMinutes("");
  }

  function isPresetSelected(ms: number): boolean {
    return budgetMs === ms;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing) {
      update.execute({
        id: task.id,
        name: name.trim(),
        description: description.trim() || undefined,
        budgetMs: budgetMs,
      });
    } else {
      create.execute({
        name: name.trim(),
        description: description.trim() || undefined,
        budgetMs: budgetMs ?? undefined,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-name">Task name *</Label>
            <Input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Write quarterly report"
              maxLength={TASK_NAME_MAX_LENGTH}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              maxLength={TASK_DESCRIPTION_MAX_LENGTH}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Time budget</Label>
              {budgetMs != null && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground"
                  onClick={clearBudget}
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BUDGET_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant={isPresetSelected(preset.ms) ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => selectPreset(preset.ms)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={BUDGET_MAX_HOURS}
                  value={customHours}
                  onChange={(e) =>
                    handleCustomChange(e.target.value, customMinutes)
                  }
                  placeholder="0"
                  className="h-8 w-16 text-center text-sm"
                />
                <span className="text-xs text-muted-foreground">h</span>
              </div>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={BUDGET_MAX_MINUTES}
                  value={customMinutes}
                  onChange={(e) =>
                    handleCustomChange(customHours, e.target.value)
                  }
                  placeholder="0"
                  className="h-8 w-16 text-center text-sm"
                />
                <span className="text-xs text-muted-foreground">m</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
