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
import { useChartColors } from '@/hooks/useChartColors'
import { formatMoney } from '@/utils/format'
import type { Expense } from '@/types/expense'

const MONTHS_TO_SHOW = 6

type ExpenseChartProps = {
  expenses: Expense[]
}

type MonthPoint = {
  key: string
  label: string
  total: number
}

function formatCompact(value: number, language: string): string {
  return new Intl.NumberFormat(language, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

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
  const colors = useChartColors()
  const language = i18n.resolvedLanguage ?? 'ru'

  const points = buildMonthlyTotals(expenses, language)
  const hasData = points.some((point) => point.total > 0)

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
            <CartesianGrid vertical={false} stroke={colors.grid} />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: colors.axis, fontSize: 12 }}
              dy={8}
            />

            <YAxis
              width={56}
              tickLine={false}
              axisLine={false}
              tick={{ fill: colors.axis, fontSize: 12 }}
              tickFormatter={(value: number) => formatCompact(value, language)}
            />

            <Tooltip
              cursor={{ fill: colors.cursor }}
              formatter={(value) => formatMoney(Number(value))}
              labelStyle={{ color: colors.label, fontSize: 12 }}
              itemStyle={{ color: colors.tooltipText }}
              contentStyle={{
                borderRadius: 12,
                backgroundColor: colors.tooltipBackground,
                border: `1px solid ${colors.tooltipBorder}`,
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                fontSize: 13,
              }}
            />

            <Bar
              dataKey="total"
              name={t('nav.expenses')}
              fill={colors.bar}
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