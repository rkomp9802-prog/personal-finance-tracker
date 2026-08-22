import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoney } from '@/utils/format'
import type { Expense } from '@/types/expense'

// Тот же синий, что у кнопок. Проверен на контраст с белым фоном.
const BAR_COLOR = '#2563eb'
const MONTHS_TO_SHOW = 6

type ExpenseChartProps = {
  expenses: Expense[]
}

type MonthPoint = {
  key: string
  label: string
  total: number
}

// Короткие числа для боковой шкалы: 1 200 000 → 1,2 млн
function formatCompact(value: number, language: string): string {
  return new Intl.NumberFormat(language, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

// Собираем последние шесть месяцев, включая текущий.
function buildMonthlyTotals(
  expenses: Expense[],
  language: string,
): MonthPoint[] {
  const points: MonthPoint[] = []
  const now = new Date()

  for (let offset = MONTHS_TO_SHOW - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const key = `${date.getFullYear()}-${month}`

    const total = expenses
      .filter((expense) => expense.date.startsWith(key))
      .reduce((sum, expense) => sum + expense.amount, 0)

    points.push({
      key,
      label: new Intl.DateTimeFormat(language, { month: 'short' }).format(date),
      total,
    })
  }

  return points
}

export function ExpenseChart({ expenses }: ExpenseChartProps) {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? 'ru'

  const points = buildMonthlyTotals(expenses, language)
  const hasData = points.some((point) => point.total > 0)

  // Подпись обычным языком: сравниваем текущий месяц с предыдущим.
  function buildCaption(): string {
    const current = points[points.length - 1]?.total ?? 0
    const previous = points[points.length - 2]?.total ?? 0

    if (previous === 0) {
      return t('chart.trendNoData')
    }

    const change = ((current - previous) / previous) * 100
    const percent = Math.abs(Math.round(change))

    if (percent < 3) {
      return t('chart.trendFlat')
    }

    return change > 0
      ? t('chart.trendUp', { percent })
      : t('chart.trendDown', { percent })
  }

  if (!hasData) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm font-medium text-slate-900">{t('chart.empty')}</p>
        <p className="mt-1 text-sm text-slate-500">{t('chart.emptyHint')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={points}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            barCategoryGap="30%"
          >
            {/* Сетка только горизонтальная и очень бледная — она подсказка, а не узор */}
            <CartesianGrid
              vertical={false}
              stroke="#f1f5f9"
              strokeDasharray="0"
            />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={8}
            />

            <YAxis
              width={56}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(value: number) => formatCompact(value, language)}
            />

            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              formatter={(value) => formatMoney(Number(value))}
              labelStyle={{ color: '#64748b', fontSize: 12 }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                fontSize: 13,
              }}
            />

            <Bar
              dataKey="total"
              name={t('nav.expenses')}
              fill={BAR_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm leading-relaxed text-slate-500">{buildCaption()}</p>
    </div>
  )
}