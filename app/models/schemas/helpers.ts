import { z } from "zod";
import { ObjectId } from "mongodb";

/**
 * Valida que un string sea un ObjectId válido de MongoDB
 */
export const objectIdSchema = z.string().refine(
  (val) => ObjectId.isValid(val),
  { message: "Invalid ObjectId format" }
);

/**
 * Valida que un valor sea una instancia de ObjectId
 */
export const objectIdInstanceSchema = z.instanceof(ObjectId);

/**
 * Convierte un string a ObjectId si es válido
 */
export const objectIdStringToInstance = z
  .string()
  .refine((val) => ObjectId.isValid(val), { message: "Invalid ObjectId format" })
  .transform((val) => new ObjectId(val));

/**
 * Validación de email con formato correcto
 */
export const emailSchema = z
  .string()
  .email({ message: "Invalid email format" })
  .toLowerCase()
  .trim();

/**
 * Validación de URL con protocolo http/https
 */
export const urlSchema = z
  .string()
  .url({ message: "Invalid URL format" })
  .refine((url) => url.startsWith("http://") || url.startsWith("https://"), {
    message: "URL must start with http:// or https://",
  });

/**
 * Validación de slug para URLs amigables
 * Solo permite: letras minúsculas, números, guiones
 */
export const slugSchema = z
  .string()
  .min(1, { message: "Slug cannot be empty" })
  .max(200, { message: "Slug is too long" })
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must contain only lowercase letters, numbers, and hyphens",
  });

/**
 * Validación de password con requisitos de seguridad
 */
export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(100, { message: "Password is too long" });

/**
 * Schema para fecha ISO string
 */
export const dateSchema = z.coerce.date();
