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
import { isBaseExpenseCategory } from '@/types/expense'
import { formatMoney } from '@/utils/format'
import type { Expense } from '@/types/expense'

const BAR_COLOR = '#2563eb'
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
  const language = i18n.resolvedLanguage ?? 'ru'

  // Складываем траты по категориям.
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

  // Всё, что не влезло в первую восьмёрку, складываем в одну строку.
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
        <p className="text-sm font-medium text-slate-900">
          {t('statistics.empty')}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {t('statistics.emptyHint')}
        </p>
      </div>
    )
  }

  const top = visible[0]
  const topPercent = grandTotal > 0 ? Math.round((top.total / grandTotal) * 100) : 0

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
              tick={{ fill: '#475569', fontSize: 12 }}
              tickFormatter={(value: string) =>
                value.length > 18 ? `${value.slice(0, 17)}…` : value
              }
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
              name={t('statistics.expense')}
              fill={BAR_COLOR}
              radius={[0, 4, 4, 0]}
              maxBarSize={20}
            >
              {/* Подпись прямо у конца столбика — рейтинг читается без наведения */}
              <LabelList
                dataKey="total"
                position="right"
                offset={8}
                formatter={(value: number) => formatCompact(value, language)}
                style={{ fill: '#64748b', fontSize: 12 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm leading-relaxed text-slate-500">
        {t('statistics.topCategory', {
          category: top.label,
          percent: topPercent,
        })}
      </p>
    </div>
  )
}