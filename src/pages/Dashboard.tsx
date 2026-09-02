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
import { ExpenseChart } from '@/components/common/ExpenseChart'
import { RecentOperations } from '@/components/common/RecentOperations'
import { SummaryCards } from '@/components/common/SummaryCards'
import { UpcomingPayments } from '@/components/common/UpcomingPayments'
import { useFinanceSummary } from '@/hooks/useFinanceSummary'

export function Dashboard() {
  const { t } = useTranslation()
  const { summary, incomes, expenses, goals, isPending, isError } =
    useFinanceSummary()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t('nav.dashboard')}
        </h1>
        <p className="mt-2 text-pretty text-base text-body">{t('pages.dashboard')}</p>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      ) : isError ? (
        <Alert variant="danger" title={t('dashboard.loadError')} />
      ) : (
        <>
          <SummaryCards summary={summary} />

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('widgets.recentTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentOperations incomes={incomes} expenses={expenses} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('widgets.upcomingTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <UpcomingPayments
                  incomes={incomes}
                  expenses={expenses}
                  goals={goals}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('chart.expensesTitle')}</CardTitle>
              <CardDescription>{t('chart.expensesDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseChart expenses={expenses} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}