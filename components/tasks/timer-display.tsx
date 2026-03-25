"use client";

import { useEffect, useState } from "react";
import { TaskStatus } from "@/lib/generated/prisma";

interface TimerDisplayProps {
  accumulatedMs: number;
  startedAt: Date | null;
  status: TaskStatus;
  className?: string;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function TimerDisplay({
  accumulatedMs,
  startedAt,
  status,
  className,
}: TimerDisplayProps) {
  const [elapsed, setElapsed] = useState(() => {
    if (status === "RUNNING" && startedAt) {
      return accumulatedMs + (Date.now() - new Date(startedAt).getTime());
    }
    return accumulatedMs;
  });

  useEffect(() => {
    if (status !== "RUNNING" || !startedAt) {
      setElapsed(accumulatedMs);
      return;
    }

    const startTime = new Date(startedAt).getTime();

    const tick = () => {
      setElapsed(accumulatedMs + (Date.now() - startTime));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [status, startedAt, accumulatedMs]);

  return (
    <span className={className}>
      {formatDuration(elapsed)}
    </span>
  );
}
