import { ObjectId } from "mongodb";

/**
 * Valida si un string puede ser convertido a ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

/**
 * Convierte un string a ObjectId si es válido
 * @throws Error si el string no es un ObjectId válido
 */
export function toObjectId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    throw new Error(`Invalid ObjectId: ${id}`);
  }
  return new ObjectId(id);
}

/**
 * Convierte un string a ObjectId de manera segura
 * @returns ObjectId si es válido, null si no lo es
 */
export function toObjectIdSafe(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  return new ObjectId(id);
}

/**
 * Verifica si dos ObjectIds son iguales
 */
export function objectIdEquals(id1: ObjectId | string, id2: ObjectId | string): boolean {
  const oid1 = typeof id1 === "string" ? new ObjectId(id1) : id1;
  const oid2 = typeof id2 === "string" ? new ObjectId(id2) : id2;
  return oid1.equals(oid2);
}
