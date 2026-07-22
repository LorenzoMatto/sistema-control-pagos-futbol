/**
 * Formatea un número como moneda Guaraní paraguayo (PYG).
 * Ejemplo: 150000 → "₲ 150.000"
 */
export function formatGuarani(amount: number): string {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea una fecha usando zona horaria de Argentina (UTC-3).
 */
export function formatFecha(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: "America/Argentina/Buenos_Aires",
    dateStyle: "medium",
    ...options,
  };
  return new Intl.DateTimeFormat("es-AR", defaultOptions).format(date);
}
