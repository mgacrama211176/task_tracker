-- Enable Row Level Security on the Task table
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;

-- Allow employees to read only their own tasks
CREATE POLICY "employees_select_own_tasks"
  ON "Task"
  FOR SELECT
  USING (auth.uid()::text = "employeeId");

-- Allow employees to insert tasks owned by themselves
CREATE POLICY "employees_insert_own_tasks"
  ON "Task"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "employeeId");

-- Allow employees to update only their own tasks
CREATE POLICY "employees_update_own_tasks"
  ON "Task"
  FOR UPDATE
  USING (auth.uid()::text = "employeeId")
  WITH CHECK (auth.uid()::text = "employeeId");

-- Allow employees to delete only their own tasks
CREATE POLICY "employees_delete_own_tasks"
  ON "Task"
  FOR DELETE
  USING (auth.uid()::text = "employeeId");
