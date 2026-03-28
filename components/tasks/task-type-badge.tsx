import { Badge } from "@/components/ui/badge";
import type { TaskType } from "@/lib/types/task";
import { TASK_TYPE_CONFIG } from "@/lib/constants/task";

interface TaskTypeBadgeProps {
  type: TaskType;
}

export function TaskTypeBadge({ type }: TaskTypeBadgeProps) {
  const config = TASK_TYPE_CONFIG[type];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
