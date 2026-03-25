"use client";

import { useState, useTransition } from "react";
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
import type { TaskWithComputed } from "@/lib/actions/tasks";
import { toast } from "sonner";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskWithComputed;
}

export function TaskForm({ open, onOpenChange, task }: TaskFormProps) {
  const [name, setName] = useState(task?.name ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [isPending, startTransition] = useTransition();

  const isEditing = !!task;

  function handleOpenChange(nextOpen: boolean) {
    if (!isPending) {
      onOpenChange(nextOpen);
    }
  }

  function reset() {
    if (!isEditing) {
      setName("");
      setDescription("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return;

    startTransition(async () => {
      const result = isEditing
        ? await updateTask({ id: task.id, name: name.trim(), description: description.trim() || undefined })
        : await createTask({ name: name.trim(), description: description.trim() || undefined });

      if (result.success) {
        toast.success(isEditing ? "Task updated" : "Task created");
        reset();
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
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
              maxLength={200}
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
              maxLength={1000}
              rows={3}
            />
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
              {isPending ? "Saving..." : isEditing ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
