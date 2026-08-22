import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/Card'
import { AnimatedNumber } from '@/components/common/AnimatedNumber'
import { EntityCard } from '@/components/common/EntityCard'
import { formatMoney } from '@/utils/format'
import type { FinanceSummary } from '@/hooks/useFinanceSummary'

type SummaryCardsProps = {
  summary: FinanceSummary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const { t } = useTranslation()
  const isPositive = summary.balance >= 0

  return (
    <div className="flex flex-col gap-4">
      {/* Главный показатель экрана — самый крупный текст на странице */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-slate-500">
            {t('dashboard.balance')}
          </p>

          <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums text-slate-900 sm:text-5xl">
            <AnimatedNumber value={summary.balance} format={formatMoney} />
          </p>

          <p className="mt-3 text-sm text-slate-500">
            {t('dashboard.balanceHint')} ·{' '}
            <span className={isPositive ? 'text-slate-500' : 'text-amber-700'}>
              {isPositive
                ? t('dashboard.positiveBalance')
                : t('dashboard.negativeBalance')}
            </span>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <EntityCard
          variant="stat"
          label={t('dashboard.incomeMonth')}
          value={summary.incomeThisMonth}
        />
        <EntityCard
          variant="stat"
          label={t('dashboard.expenseMonth')}
          value={summary.expenseThisMonth}
        />
        <EntityCard
          variant="stat"
          label={t('dashboard.savings')}
          value={summary.savings}
        />
      </div>
    </div>
  )
}