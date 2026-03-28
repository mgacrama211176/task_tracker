import { z } from "zod";

const taskNameField = z.string().min(1, "Name is required").max(200);
const taskDescriptionField = z.string().max(1000).optional();
const taskTypeField = z.enum(["TASK", "BUG", "ENHANCEMENT", "FEATURE", "BLOCKER"]);

export const CreateTaskSchema = z.object({
  name: taskNameField,
  description: taskDescriptionField,
  type: taskTypeField.optional(),
  ownerName: z.string().max(100).optional(),
  budgetMs: z.number().int().positive().optional(),
});

export const UpdateTaskSchema = z.object({
  id: z.string().uuid(),
  name: taskNameField,
  description: taskDescriptionField,
  type: taskTypeField.optional(),
  ownerName: z.string().max(100).nullable().optional(),
  budgetMs: z.number().int().positive().nullable().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
