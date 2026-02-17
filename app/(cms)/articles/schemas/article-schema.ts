import { z } from "zod"

export const ArticleFormSchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título es demasiado largo (máx. 200)"),
  text: z
    .string()
    .min(10, "El contenido debe tener al menos 10 caracteres")
    .max(50000, "El contenido es demasiado largo"),
  coverUrl: z.string().optional(),
  isPublished: z.boolean(),
})

export type ArticleFormValues = z.infer<typeof ArticleFormSchema>
