import { z } from "zod";

export const jobFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "Job title is required")
      .max(255, "Job title must be 255 characters or less"),
    description: z.string().min(1, "Job description is required"),
    employment_status_id: z.string().uuid().optional().nullable(),
    work_schedule_id: z.string().uuid("Work schedule is required"),
    remote_status_id: z.string().uuid("Remote status is required"),
    required_education_id: z.string().uuid().optional().nullable(),
    min_experience_year: z
      .number()
      .int()
      .nonnegative("Minimum experience cannot be negative")
      .default(0),
    max_experience_year: z
      .number()
      .int()
      .nonnegative("Maximum experience cannot be negative")
      .default(0),
    no_experience_allowed: z.boolean().default(false),
    status: z
      .enum(["draft", "published", "closed", "filled"])
      .default("published"),
  })
  .refine(
    (data) => {
      // If no_experience_allowed is true, nullify experience fields
      if (data.no_experience_allowed) {
        data.min_experience_year = 0;
        data.max_experience_year = 0;
        return true;
      }

      // If both experience fields are set, validate max >= min
      if (
        data.min_experience_year !== null &&
        data.min_experience_year !== undefined &&
        data.max_experience_year !== null &&
        data.max_experience_year !== undefined
      ) {
        return data.max_experience_year >= data.min_experience_year;
      }

      return true;
    },
    {
      message:
        "Maximum experience must be greater than or equal to minimum experience",
      path: ["max_experience_years"],
    },
  );

export type JobFormData = z.infer<typeof jobFormSchema>;
