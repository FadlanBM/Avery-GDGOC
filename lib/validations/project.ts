import { z } from "zod";

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Nama project wajib diisi")
    .min(3, "Nama project minimal 3 karakter")
    .max(100, "Nama project maksimal 100 karakter"),
  description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
  url: z
    .string()
    .refine(
      (val) => !val || z.string().url().safeParse(val).success,
      "URL tidak valid"
    )
    .optional()
    .or(z.literal("")),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

