import type { TaskStatus } from "@/lib/types/task";

export const DEBOUNCE_MS = 300;
export const TICK_INTERVAL_MS = 1000;
export const TASK_NAME_MAX_LENGTH = 200;
export const TASK_DESCRIPTION_MAX_LENGTH = 1000;
export const BUDGET_MAX_HOURS = 99;
export const BUDGET_MAX_MINUTES = 59;
export const MS_PER_MINUTE = 60_000;
export const MS_PER_HOUR = 3_600_000;

export const BUDGET_PRESETS = [
  { label: "30m", ms: 30 * MS_PER_MINUTE },
  { label: "1h", ms: MS_PER_HOUR },
  { label: "2h", ms: 2 * MS_PER_HOUR },
  { label: "4h", ms: 4 * MS_PER_HOUR },
  { label: "8h", ms: 8 * MS_PER_HOUR },
] as const;

export const STATUS_BADGE_CONFIG: Record<
  TaskStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
    className: string;
    showPulse: boolean;
  }
> = {
  NOT_STARTED: {
    label: "Not started",
    variant: "outline",
    className: "",
    showPulse: false,
  },
  IN_PROGRESS: {
    label: "In Progress",
    variant: "default",
    className: "bg-green-500 hover:bg-green-600 text-white border-transparent",
    showPulse: true,
  },
  PAUSED: {
    label: "Paused",
    variant: "secondary",
    className: "bg-amber-100 text-amber-800 border-amber-200",
    showPulse: false,
  },
  DONE: {
    label: "Done",
    variant: "secondary",
    className: "bg-muted text-muted-foreground",
    showPulse: false,
  },
};

export const TIMER_BUTTON_STYLES = {
  play: "h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50",
  pause: "h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50",
  stop: "h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50",
} as const;

export const TOAST_MESSAGES = {
  taskCreated: "Task created",
  taskUpdated: "Task updated",
  taskDeleted: "Task deleted",
  taskDone: "Task done",
  taskMarkedDone: "Task marked as done",
  taskTimerReset: "Task timer reset",
} as const;
