import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { AnimatedNumber } from '@/components/common/AnimatedNumber'
import { cn } from '@/utils/cn'
import { clampPercent, formatDate, formatMoney } from '@/utils/format'

type CommonProps = {
  className?: string
  onClick?: () => void
}

type IncomeVariant = CommonProps & {
  variant: 'income'
  category: string
  source?: string
  note?: string
  date: string
  amount: number
}

type ExpenseVariant = CommonProps & {
  variant: 'expense'
  category: string
  note?: string
  date: string
  amount: number
}

type BudgetVariant = CommonProps & {
  variant: 'budget'
  category: string
  limitAmount: number
  spentAmount: number
}

type GoalVariant = CommonProps & {
  variant: 'goal'
  title: string
  targetAmount: number
  currentAmount: number
  deadline?: string
}

type StatVariant = CommonProps & {
  variant: 'stat'
  label: string
  value: number
  caption?: string
  trend?: 'up' | 'down'
  trendLabel?: string
}

export type EntityCardProps =
  | IncomeVariant
  | ExpenseVariant
  | BudgetVariant
  | GoalVariant
  | StatVariant

// Общее «шасси» для всех вариантов: отступы, рамка, тень, реакция на наведение.
function Shell({
  className,
  onClick,
  children,
}: CommonProps & { children: ReactNode }) {
  return (
    <Card
      interactive={Boolean(onClick)}
      onClick={onClick}
      className={cn('p-5', onClick && 'cursor-pointer', className)}
    >
      {children}
    </Card>
  )
}

function ProgressBar({
  percent,
  tone = 'neutral',
}: {
  percent: number
  tone?: 'neutral' | 'warning' | 'success'
}) {
  const barColor =
    tone === 'warning'
      ? 'bg-amber-500'
      : tone === 'success'
        ? 'bg-emerald-500'
        : 'bg-blue-600'

  return (
    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-500',
          barColor,
        )}
        style={{ width: `${clampPercent(percent)}%` }}
      />
    </div>
  )
}

export function EntityCard(props: EntityCardProps) {
  const { t } = useTranslation()

  if (props.variant === 'income' || props.variant === 'expense') {
    const sign = props.variant === 'income' ? '+' : '−'
    const source = props.variant === 'income' ? props.source : undefined

    return (
      <Shell className={props.className} onClick={props.onClick}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {props.category}
            </p>
            {source ? (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{source}</p>
            ) : null}
            {props.note ? (
              <p className="mt-1 truncate text-sm text-subtle-foreground">
                {props.note}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 text-right">
            <p className="text-base font-semibold tabular-nums text-foreground">
              {sign} {formatMoney(props.amount)}
            </p>
            <p className="mt-0.5 text-xs text-subtle-foreground">
              {formatDate(props.date)}
            </p>
          </div>
        </div>
      </Shell>
    )
  }

  if (props.variant === 'budget') {
    const percent =
      props.limitAmount > 0 ? (props.spentAmount / props.limitAmount) * 100 : 0
    const isOverLimit = props.spentAmount > props.limitAmount
    const difference = Math.abs(props.limitAmount - props.spentAmount)

    return (
      <Shell className={props.className} onClick={props.onClick}>
        <div className="flex items-baseline justify-between gap-4">
          <p className="truncate text-sm font-medium text-foreground">
            {props.category}
          </p>
          <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
            {Math.round(percent)}%
          </p>
        </div>

        <ProgressBar
          percent={percent}
          tone={isOverLimit ? 'warning' : 'neutral'}
        />

        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
          <p className="tabular-nums text-muted-foreground">
            {formatMoney(props.spentAmount)} / {formatMoney(props.limitAmount)}
          </p>
          <p
            className={cn(
              'shrink-0 tabular-nums',
              isOverLimit ? 'text-amber-700' : 'text-muted-foreground',
            )}
          >
            {isOverLimit
              ? `${t('entityCard.overLimit')} ${formatMoney(difference)}`
              : `${formatMoney(difference)} ${t('entityCard.remaining')}`}
          </p>
        </div>
      </Shell>
    )
  }

  if (props.variant === 'goal') {
    const percent =
      props.targetAmount > 0
        ? (props.currentAmount / props.targetAmount) * 100
        : 0
    const isReached = props.currentAmount >= props.targetAmount

    return (
      <Shell className={props.className} onClick={props.onClick}>
        <div className="flex items-baseline justify-between gap-4">
          <p className="truncate text-sm font-medium text-foreground">
            {props.title}
          </p>
          <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
            {Math.round(percent)}%
          </p>
        </div>

        <ProgressBar
          percent={percent}
          tone={isReached ? 'success' : 'neutral'}
        />

        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
          <p className="tabular-nums text-muted-foreground">
            {formatMoney(props.currentAmount)} /{' '}
            {formatMoney(props.targetAmount)}
          </p>
          {isReached ? (
            <p className="shrink-0 text-emerald-700">
              {t('entityCard.goalReached')}
            </p>
          ) : props.deadline ? (
            <p className="shrink-0 text-subtle-foreground">
              {t('entityCard.until')} {formatDate(props.deadline)}
            </p>
          ) : null}
        </div>
      </Shell>
    )
  }

  const TrendIcon = props.trend === 'down' ? TrendingDown : TrendingUp

  return (
    <Shell className={props.className} onClick={props.onClick}>
      <p className="text-sm font-medium text-muted-foreground">{props.label}</p>

      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
        <AnimatedNumber value={props.value} format={formatMoney} />
      </p>

      {props.trend && props.trendLabel ? (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <TrendIcon className="h-4 w-4" aria-hidden="true" />
          <span>{props.trendLabel}</span>
        </div>
      ) : null}

      {props.caption ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {props.caption}
        </p>
      ) : null}
    </Shell>
  )
}