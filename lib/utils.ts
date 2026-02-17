import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extrae las iniciales de un nombre (máximo 2 caracteres).
 * Ej: "Juan Pérez" → "JP"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Formatea una fecha ISO a un string legible en español (es-AR).
 * Ej: "2025-06-15T..." → "15 de junio de 2025"
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
