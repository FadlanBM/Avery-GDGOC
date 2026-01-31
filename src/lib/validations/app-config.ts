import { z } from "zod";

export const appConfigSchema = z.object({
  app_name: z
    .string()
    .min(1, "Nama aplikasi wajib diisi")
    .min(3, "Nama aplikasi minimal 3 karakter")
    .max(100, "Nama aplikasi maksimal 100 karakter"),
  app_sub_name: z
    .string()
    .max(100, "Sub nama aplikasi maksimal 100 karakter")
    .optional()
    .or(z.literal("")),
  app_version: z
    .string()
    .regex(/^\d+\.\d+$/, "Versi aplikasi harus berformat 0.0")
    .optional()
    .or(z.literal("")),
  app_description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
  app_url: z
    .string()
    .refine(
      (val) => !val || z.string().url().safeParse(val).success,
      "URL tidak valid"
    )
    .optional()
    .or(z.literal("")),
  app_url_api: z
    .string()
    .refine(
      (val) => !val || z.string().url().safeParse(val).success,
      "URL tidak valid"
    )
    .optional()
    .or(z.literal("")),
  year: z
    .number()
    .int("Tahun harus bilangan bulat")
    .min(1900, "Tahun minimal 1900")
    .max(2100, "Tahun maksimal 2100")
    .optional(),
  updatemandatory: z.boolean().optional(),
});

export type AppConfigFormData = z.infer<typeof appConfigSchema>;

