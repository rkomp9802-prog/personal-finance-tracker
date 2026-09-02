import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EntityCard } from '@/components/common/EntityCard'
import { MonthCalendar } from '@/components/common/MonthCalendar'
import { useFinanceSummary } from '@/hooks/useFinanceSummary'
import { isBaseExpenseCategory } from '@/types/expense'
import { formatDate, formatMoney } from '@/utils/format'

export function Calendar() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? 'ru'
  const { incomes, expenses, isPending, isError } = useFinanceSummary()

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  function shiftMonth(step: number) {
    const shifted = new Date(year, month + step, 1)

    setYear(shifted.getFullYear())
    setMonth(shifted.getMonth())
  }

  function goToToday() {
    const today = new Date()

    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setSelectedDate(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
        today.getDate(),
      ).padStart(2, '0')}`,
    )
  }

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`

  const monthTitle = new Intl.DateTimeFormat(language, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1))

  const monthIncome = incomes
    .filter((income) => income.date.startsWith(monthKey))
    .reduce((sum, income) => sum + income.amount, 0)

  const monthExpense = expenses
    .filter((expense) => expense.date.startsWith(monthKey))
    .reduce((sum, expense) => sum + expense.amount, 0)

  const dayIncomes = selectedDate
    ? incomes.filter((income) => income.date === selectedDate)
    : []

  const dayExpenses = selectedDate
    ? expenses.filter((expense) => expense.date === selectedDate)
    : []

  const hasDayOperations = dayIncomes.length > 0 || dayExpenses.length > 0

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t('nav.calendar')}
        </h1>
        <p className="mt-1 text-sm text-body">{t('pages.calendar')}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="capitalize">{monthTitle}</CardTitle>
              <CardDescription>
                {t('calendar.monthIncome')}: {formatMoney(monthIncome)} ·{' '}
                {t('calendar.monthExpense')}: {formatMoney(monthExpense)}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={goToToday}>
                {t('calendar.today')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => shiftMonth(-1)}
                title={t('calendar.previousMonth')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => shiftMonth(1)}
                title={t('calendar.nextMonth')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isPending ? (
            <Skeleton className="h-96 w-full rounded-2xl" />
          ) : isError ? (
            <Alert variant="danger" title={t('calendar.loadError')} />
          ) : (
            <MonthCalendar
              year={year}
              month={month}
              incomes={incomes}
              expenses={expenses}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate
              ? t('calendar.daySummary', { date: formatDate(selectedDate) })
              : t('calendar.selectDay')}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {!selectedDate ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t('calendar.selectDay')}
            </p>
          ) : !hasDayOperations ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t('calendar.dayEmpty')}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {dayIncomes.map((income) => (
                <EntityCard
                  key={income.id}
                  variant="income"
                  category={t(`income.categories.${income.category}`)}
                  source={income.source ?? undefined}
                  note={income.note ?? undefined}
                  date={income.date}
                  amount={income.amount}
                />
              ))}

              {dayExpenses.map((expense) => (
                <EntityCard
                  key={expense.id}
                  variant="expense"
                  category={
                    isBaseExpenseCategory(expense.category)
                      ? t(`expense.categories.${expense.category}`)
                      : expense.category
                  }
                  note={expense.note ?? undefined}
                  date={expense.date}
                  amount={expense.amount}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}