// Превращает 3000000 в «3 000 000 сум»
export function formatMoney(value: number): string {
  const formatted = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(value)

  return `${formatted} сум`
}

// Превращает '2026-08-17' в «17 авг. 2026 г.»
export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

// Ограничивает число диапазоном от 0 до 100
export function clampPercent(value: number): number {
  if (Number.isNaN(value)) {
    return 0
  }

  return Math.min(Math.max(value, 0), 100)
}