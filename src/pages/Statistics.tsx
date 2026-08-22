import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/ui/Alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { CategoryBreakdownChart } from '@/components/common/CategoryBreakdownChart'
import { EntityCard } from '@/components/common/EntityCard'
import { IncomeExpenseChart } from '@/components/common/IncomeExpenseChart'
import { useFinanceSummary } from '@/hooks/useFinanceSummary'
import { cn } from '@/utils/cn'

const periodOptions = [
  { months: 3, labelKey: 'statsPage.months3' },
  { months: 6, labelKey: 'statsPage.months6' },
  { months: 12, labelKey: 'statsPage.months12' },
]

// Первое число месяца, с которого начинается период.
function periodStartDate(months: number): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const month = String(start.getMonth() + 1).padStart(2, '0')

  return `${start.getFullYear()}-${month}-01`
}

function sumAmounts(items: { amount: number }[]): number {
  return items.reduce((total, item) => total + item.amount, 0)
}

export function Statistics() {
  const { t } = useTranslation()
  const { incomes, expenses, isPending, isError } = useFinanceSummary()
  const [months, setMonths] = useState(6)

  const startDate = periodStartDate(months)

  const periodIncomes = incomes.filter((income) => income.date >= startDate)
  const periodExpenses = expenses.filter((expense) => expense.date >= startDate)

  const totalIncome = sumAmounts(periodIncomes)
  const totalExpense = sumAmounts(periodExpenses)

  const averageIncome = Math.round(totalIncome / months)
  const averageExpense = Math.round(totalExpense / months)
  const averageSaved = averageIncome - averageExpense

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {t('nav.statistics')}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{t('pages.statistics')}</p>
      </div>

      {/* Один переключатель на всю страницу — над графиками, в одну строку */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-700">
          {t('statsPage.period')}
        </span>

        <div
          role="group"
          aria-label={t('statsPage.period')}
          className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5"
        >
          {periodOptions.map((option) => (
            <button
              key={option.months}
              type="button"
              onClick={() => setMonths(option.months)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                months === option.months
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>

        <span className="text-sm text-slate-400">
          {t('statsPage.periodHint')}
        </span>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      ) : isError ? (
        <Alert variant="danger" title={t('statistics.loadError')} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <EntityCard
              variant="stat"
              label={t('statsPage.avgIncome')}
              value={averageIncome}
            />
            <EntityCard
              variant="stat"
              label={t('statsPage.avgExpense')}
              value={averageExpense}
            />
            <EntityCard
              variant="stat"
              label={t('statsPage.avgSaved')}
              value={averageSaved}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('statistics.byCategoryTitle')}</CardTitle>
              <CardDescription>
                {t('statistics.byCategoryDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryBreakdownChart expenses={periodExpenses} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('statistics.dynamicsTitle')}</CardTitle>
              <CardDescription>
                {t(
                  months === 3
                    ? 'statsPage.months3'
                    : months === 12
                      ? 'statsPage.months12'
                      : 'statsPage.months6',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart
                incomes={periodIncomes}
                expenses={periodExpenses}
                monthsToShow={months}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}