import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import type { Expense } from '@/types/expense'
import type { Income } from '@/types/income'

// Те же цвета, что в статистике: синий — приход, янтарный — расход.
const INCOME_TEXT = 'text-blue-600'
const EXPENSE_TEXT = 'text-amber-700'

type MonthCalendarProps = {
  year: number
  // Номер месяца как в JavaScript: 0 — январь, 11 — декабрь.
  month: number
  incomes: Income[]
  expenses: Expense[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

type DayTotals = {
  income: number
  expense: number
}

function toIsoDate(year: number, month: number, day: number): string {
  const monthPart = String(month + 1).padStart(2, '0')
  const dayPart = String(day).padStart(2, '0')

  return `${year}-${monthPart}-${dayPart}`
}

function todayIso(): string {
  const now = new Date()

  return toIsoDate(now.getFullYear(), now.getMonth(), now.getDate())
}

function formatCompact(value: number, language: string): string {
  return new Intl.NumberFormat(language, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

// Названия дней недели на текущем языке, начиная с понедельника.
// 5 января 2026 года — понедельник, от него и отсчитываем.
function weekdayNames(language: string): string[] {
  const formatter = new Intl.DateTimeFormat(language, { weekday: 'short' })
  const names: string[] = []

  for (let index = 0; index < 7; index += 1) {
    names.push(formatter.format(new Date(2026, 0, 5 + index)))
  }

  return names
}

export function MonthCalendar({
  year,
  month,
  incomes,
  expenses,
  selectedDate,
  onSelectDate,
}: MonthCalendarProps) {
  const { i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? 'ru'
  const today = todayIso()

  // Суммы по каждому дню месяца.
  const totalsByDate: Record<string, DayTotals> = {}

  function addTo(dateIso: string, kind: 'income' | 'expense', amount: number) {
    const current = totalsByDate[dateIso] ?? { income: 0, expense: 0 }

    totalsByDate[dateIso] = {
      income: current.income + (kind === 'income' ? amount : 0),
      expense: current.expense + (kind === 'expense' ? amount : 0),
    }
  }

  for (const income of incomes) {
    addTo(income.date, 'income', income.amount)
  }

  for (const expense of expenses) {
    addTo(expense.date, 'expense', expense.amount)
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // getDay(): 0 — воскресенье. Переводим в «понедельник первый».
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7

  const cells: (number | null)[] = []

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day)
  }

  // Добиваем последнюю неделю до семи клеток, чтобы сетка не рвалась.
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 pb-2">
        {weekdayNames(language).map((name) => (
          <div
            key={name}
            className="px-1 text-center text-xs font-medium uppercase text-subtle-foreground"
          >
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="min-h-[72px]" />
          }

          const dateIso = toIsoDate(year, month, day)
          const totals = totalsByDate[dateIso]
          const isToday = dateIso === today
          const isSelected = dateIso === selectedDate

          return (
            <button
              key={dateIso}
              type="button"
              onClick={() => onSelectDate(dateIso)}
              className={cn(
                'flex min-h-[72px] flex-col items-start gap-0.5 rounded-lg border p-1.5 text-left transition-colors',
                isSelected
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-muted hover:border-border hover:bg-background',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  isToday
                    ? 'bg-blue-600 text-white'
                    : 'text-body',
                )}
              >
                {day}
              </span>

              {totals?.income ? (
                <span
                  className={cn(
                    'w-full truncate text-[11px] font-medium tabular-nums',
                    INCOME_TEXT,
                  )}
                >
                  +{formatCompact(totals.income, language)}
                </span>
              ) : null}

              {totals?.expense ? (
                <span
                  className={cn(
                    'w-full truncate text-[11px] font-medium tabular-nums',
                    EXPENSE_TEXT,
                  )}
                >
                  −{formatCompact(totals.expense, language)}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}