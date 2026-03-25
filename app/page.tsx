import { Suspense } from "react";
import { getTasks } from "@/lib/actions/tasks";
import { TaskList } from "@/components/tasks/task-list";
import { TaskSearch } from "@/components/tasks/task-search";
import { NewTaskButton } from "@/components/tasks/new-task-button";
import { Separator } from "@/components/ui/separator";

interface HomeProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { search } = await searchParams;

  const result = await getTasks(search);
  const tasks = result.success ? result.data : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base tracking-tight">Task Tracker</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex-1">
            <h1 className="text-xl font-semibold">My Tasks</h1>
            <p className="text-sm text-muted-foreground">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
              {search ? ` matching "${search}"` : ""}
            </p>
          </div>
          <Suspense>
            <TaskSearch />
          </Suspense>
          <NewTaskButton />
        </div>

        <Separator className="mb-5" />

        {/* Task list */}
        <Suspense fallback={<TaskListSkeleton />}>
          <TaskList tasks={tasks} />
        </Suspense>
      </main>
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <div className="h-10 bg-muted/30" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-12 border-t border-border/60 bg-muted animate-pulse"
        />
      ))}
    </div>
  );
}
