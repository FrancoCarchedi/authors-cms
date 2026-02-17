/** Tamaño máximo de archivo de imagen: 5 MB */
export const MAX_FILE_SIZE = 5 * 1024 * 1024

/** Tipos MIME aceptados para imágenes */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
]

/**
 * Sube un archivo de imagen al servidor y retorna la URL pública.
 * Utiliza la ruta `/api/upload` que guarda en Vercel Blob.
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch("/api/upload", { method: "POST", body: formData })

  if (!res.ok) {
    const body: { error?: string } | null = await res
      .json()
      .catch((): null => null)
    throw new Error(body?.error ?? "Error al subir la imagen")
  }

  const data: { url: string } = await res.json()
  return data.url
}

/**
 * Valida un archivo de imagen antes de subirlo.
 * Retorna un string de error si no es válido, o null si pasa las validaciones.
 */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Formato no soportado. Usa JPG, PNG o WebP."
  }
  if (file.size > MAX_FILE_SIZE) {
    return "La imagen no puede superar los 5 MB."
  }
  return null
}
