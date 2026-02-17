import { z } from "zod"

export const ProfileFormSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
})

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>
