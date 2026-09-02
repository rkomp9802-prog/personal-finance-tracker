import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useChartColors } from '@/hooks/useChartColors'
import { isBaseExpenseCategory } from '@/types/expense'
import { formatMoney } from '@/utils/format'
import type { Expense } from '@/types/expense'

const MAX_CATEGORIES = 8
const ROW_HEIGHT = 40

type CategoryBreakdownChartProps = {
  expenses: Expense[]
}

type CategoryPoint = {
  label: string
  total: number
}

function formatCompact(value: number, language: string): string {
  return new Intl.NumberFormat(language, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function CategoryBreakdownChart({
  expenses,
}: CategoryBreakdownChartProps) {
  const { t, i18n } = useTranslation()
  const colors = useChartColors()
  const language = i18n.resolvedLanguage ?? 'ru'

  const totals: Record<string, number> = {}

  for (const expense of expenses) {
    const label = isBaseExpenseCategory(expense.category)
      ? t(`expense.categories.${expense.category}`)
      : expense.category

    totals[label] = (totals[label] ?? 0) + expense.amount
  }

  const sorted: CategoryPoint[] = Object.entries(totals)
    .map(([label, total]) => ({ label, total }))
    .sort((first, second) => second.total - first.total)

  const visible = sorted.slice(0, MAX_CATEGORIES)
  const rest = sorted.slice(MAX_CATEGORIES)

  if (rest.length > 0) {
    visible.push({
      label: t('statistics.otherCategories'),
      total: rest.reduce((sum, item) => sum + item.total, 0),
    })
  }

  const grandTotal = sorted.reduce((sum, item) => sum + item.total, 0)

  if (visible.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm font-medium text-foreground">
          {t('statistics.empty')}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('statistics.emptyHint')}
        </p>
      </div>
    )
  }

  const top = visible[0]
  const topPercent =
    grandTotal > 0 ? Math.round((top.total / grandTotal) * 100) : 0

  return (
    <div className="flex flex-col gap-4">
      <div
        className="w-full"
        style={{ height: visible.length * ROW_HEIGHT + 16 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={visible}
            layout="vertical"
            margin={{ top: 0, right: 64, bottom: 0, left: 0 }}
            barCategoryGap="25%"
          >
            <XAxis type="number" hide />

            <YAxis
              type="category"
              dataKey="label"
              width={132}
              tickLine={false}
              axisLine={false}
              tick={{ fill: colors.categoryTick, fontSize: 12 }}
              tickFormatter={(value: string) =>
                value.length > 18 ? `${value.slice(0, 17)}…` : value
              }
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
              name={t('statistics.expense')}
              fill={colors.bar}
              radius={[0, 4, 4, 0]}
              maxBarSize={20}
            >
              <LabelList
                dataKey="total"
                position="right"
                offset={8}
                formatter={(value: unknown) =>
                  formatCompact(Number(value), language)
                }
                style={{ fill: colors.label, fontSize: 12 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {t('statistics.topCategory', {
          category: top.label,
          percent: topPercent,
        })}
      </p>
    </div>
  )
}