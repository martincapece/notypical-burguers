/**
 * Validación y formateo del formulario de pedido (100% en el navegador,
 * no hay backend). Pensado para Argentina: el teléfono se guarda como
 * +54 seguido de 10 dígitos (código de área + número), por ejemplo
 * +541122222222, mostrado al usuario como +54 11 2222-2222.
 */

export const NAME_MAX_LENGTH = 25;
export const PHONE_LOCAL_DIGITS = 10;
export const PHONE_COUNTRY_CODE = "54";

const LETTERS_PATTERN = "a-zA-ZÀ-ÖØ-öø-ÿñÑ";

const NAME_ALLOWED_REGEX = new RegExp(`[^${LETTERS_PATTERN}\\s]`, "g");
const NAME_VALID_REGEX = new RegExp(`^[${LETTERS_PATTERN}\\s]+$`);

const ADDRESS_ALLOWED_REGEX = new RegExp(`[^${LETTERS_PATTERN}0-9\\s.,°#-]`, "g");
const ADDRESS_VALID_REGEX = new RegExp(`^[${LETTERS_PATTERN}0-9\\s.,°#-]*$`);

const NOTES_ALLOWED_REGEX = new RegExp(`[^${LETTERS_PATTERN}\\s.,!?-]`, "g");
const NOTES_VALID_REGEX = new RegExp(`^[${LETTERS_PATTERN}\\s.,!?-]*$`);

/** Filtra en vivo lo que el usuario escribe en "Nombre": solo letras y espacios. */
export function sanitizeName(value: string): string {
  return value.replace(NAME_ALLOWED_REGEX, "").slice(0, NAME_MAX_LENGTH);
}

export function isValidName(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= NAME_MAX_LENGTH && NAME_VALID_REGEX.test(trimmed);
}

/** Filtra en vivo "Dirección": letras y números (para el número de casa/piso). */
export function sanitizeAddress(value: string): string {
  return value.replace(ADDRESS_ALLOWED_REGEX, "");
}

export function isValidAddress(value: string): boolean {
  return ADDRESS_VALID_REGEX.test(value.trim());
}

/** Filtra en vivo "Notas": solo letras (sin números). */
export function sanitizeNotes(value: string): string {
  return value.replace(NOTES_ALLOWED_REGEX, "");
}

export function isValidNotes(value: string): boolean {
  return NOTES_VALID_REGEX.test(value.trim());
}

/**
 * Se queda solo con los dígitos que el usuario tipeó en el campo del
 * número local (sin +54, eso va en un segmento fijo aparte), hasta 10.
 */
export function sanitizePhoneDigits(rawValue: string): string {
  return rawValue.replace(/\D/g, "").slice(0, PHONE_LOCAL_DIGITS);
}

/** Arma el texto que ve el usuario mientras escribe en el campo local: 11 2222-2222 */
export function formatPhoneDisplay(digits: string): string {
  const area = digits.slice(0, 2);
  const rest = digits.slice(2);
  const part1 = rest.slice(0, 4);
  const part2 = rest.slice(4, 8);

  let display = area;
  if (part1) display += ` ${part1}`;
  if (part2) display += `-${part2}`;

  return display;
}

/** Arma el valor final que se envía: +541122222222 */
export function formatPhoneSubmission(digits: string): string {
  return `+${PHONE_COUNTRY_CODE}${digits}`;
}

export function isValidPhoneDigits(digits: string): boolean {
  return digits.length === PHONE_LOCAL_DIGITS;
}
