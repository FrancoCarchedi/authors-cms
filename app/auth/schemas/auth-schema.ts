import z from "zod";

const BaseAuthSchema = z.object({
  email: z.email({ message: "El formato de email es inválido." }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .max(32, { message: "La contraseña no debe tener más de 32 caracteres" })
    .refine((password) => /[A-Z]/.test(password), {
      message: "La contraseña debe contener al menos una letra mayúscula",
    })
    .refine((password) => /[a-z]/.test(password), {
      message: "La contraseña debe contener al menos una letra minúscula",
    })
    .refine((password) => /[0-9]/.test(password), {
      message: "La contraseña debe contener al menos un número",
    })
    .refine((password) => /[!@#$%^&*()_+={}[\]:;"'<,>.?/-]/.test(password), {
      message: "La contraseña debe contener al menos un carácter especial",
    }),
});

export const LoginSchema = BaseAuthSchema;

export const RegisterSchema = BaseAuthSchema.extend({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(100, { message: "El nombre es demasiado largo" })
    .trim(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;