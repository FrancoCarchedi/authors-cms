/**
 * Genera un slug URL-friendly desde un string
 * Convierte a minúsculas, reemplaza espacios y caracteres especiales
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Reemplaza caracteres acentuados
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Reemplaza espacios y caracteres no alfanuméricos con guiones
    .replace(/[^a-z0-9]+/g, "-")
    // Elimina guiones múltiples
    .replace(/-+/g, "-")
    // Elimina guiones al inicio y final
    .replace(/^-|-$/g, "");
}

/**
 * Genera un slug único agregando un sufijo numérico si es necesario
 * @param baseSlug - El slug base
 * @param existingCheck - Función async que verifica si el slug ya existe
 * @returns Un slug único
 */
export async function generateUniqueSlug(
  baseSlug: string,
  existingCheck: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await existingCheck(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Genera un slug desde un título y verifica que sea único
 * @param title - El título del artículo
 * @param existingCheck - Función que verifica si el slug existe
 * @returns Un slug único generado desde el título
 */
export async function generateSlugFromTitle(
  title: string,
  existingCheck: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = generateSlug(title);
  return generateUniqueSlug(baseSlug, existingCheck);
}

/**
 * Valida si un slug tiene el formato correcto
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
