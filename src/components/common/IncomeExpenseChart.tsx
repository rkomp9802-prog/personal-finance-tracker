import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoney } from '@/utils/format'
import type { Expense } from '@/types/expense'
import type { Income } from '@/types/income'

// Пара цветов проверена валидатором: различимы и при дальтонизме.
const INCOME_COLOR = '#2563eb'
const EXPENSE_COLOR = '#d97706'

type IncomeExpenseChartProps = {
  incomes: Income[]
  expenses: Expense[]
  monthsToShow?: number
}

type MonthPoint = {
  key: string
  label: string
  income: number
  expense: number
}

function formatCompact(value: number, language: string): string {
  return new Intl.NumberFormat(language, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function sumForMonth(
  items: { date: string; amount: number }[],
  monthKey: string,
): number {
  return items
    .filter((item) => item.date.startsWith(monthKey))
    .reduce((sum, item) => sum + item.amount, 0)
}

export function IncomeExpenseChart({
  incomes,
  expenses,
  monthsToShow = 6,
}: IncomeExpenseChartProps) {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? 'ru'

  const points: MonthPoint[] = []
  const now = new Date()

  for (let offset = monthsToShow - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const key = `${date.getFullYear()}-${month}`

    points.push({
      key,
      label: new Intl.DateTimeFormat(language, { month: 'short' }).format(date),
      income: sumForMonth(incomes, key),
      expense: sumForMonth(expenses, key),
    })
  }

  const hasData = points.some((point) => point.income > 0 || point.expense > 0)

  if (!hasData) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm font-medium text-slate-900">
          {t('statistics.empty')}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {t('statistics.emptyHint')}
        </p>
      </div>
    )
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={points}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          barCategoryGap="25%"
          barGap={2}
        >
          <CartesianGrid vertical={false} stroke="#f1f5f9" />

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

          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: '#64748b', paddingTop: 8 }}
          />

          <Bar
            dataKey="income"
            name={t('statistics.income')}
            fill={INCOME_COLOR}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />

          <Bar
            dataKey="expense"
            name={t('statistics.expense')}
            fill={EXPENSE_COLOR}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}