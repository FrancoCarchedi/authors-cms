/**
 * Obtiene la fecha actual como objeto Date
 */
export function getCurrentDate(): Date {
  return new Date();
}

/**
 * Crea timestamps para inserción (createdAt y updatedAt iguales)
 */
export function createTimestamps() {
  const now = getCurrentDate();
  return {
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Crea timestamp para actualización (solo updatedAt)
 */
export function updateTimestamp() {
  return {
    updatedAt: getCurrentDate(),
  };
}

/**
 * Formatea una fecha a ISO string
 */
export function formatDateToISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Compara dos fechas y retorna si la primera es más reciente
 */
export function isNewerThan(date1: Date, date2: Date): boolean {
  return date1.getTime() > date2.getTime();
}
