import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import { cn } from '@/utils/cn'

type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

const alertStyles: Record<AlertVariant, { box: string; icon: string }> = {
  info: {
    box: 'border-slate-200 bg-slate-50 text-slate-700',
    icon: 'text-slate-500',
  },
  success: {
    box: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    icon: 'text-emerald-600',
  },
  warning: {
    box: 'border-amber-200 bg-amber-50 text-amber-800',
    icon: 'text-amber-600',
  },
  danger: {
    box: 'border-red-200 bg-red-50 text-red-800',
    icon: 'text-red-600',
  },
}

const alertIcons: Record<AlertVariant, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
}

type AlertProps = {
  variant?: AlertVariant
  title?: string
  children?: ReactNode
  className?: string
}

export function Alert({
  variant = 'info',
  title,
  children,
  className,
}: AlertProps) {
  const Icon = alertIcons[variant]
  const style = alertStyles[variant]

  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border px-4 py-3',
        style.box,
        className,
      )}
    >
      <Icon
        className={cn('mt-0.5 h-5 w-5 shrink-0', style.icon)}
        aria-hidden="true"
      />
      <div className="text-sm">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? (
          <div className={cn('leading-relaxed', title && 'mt-1')}>
            {children}
          </div>
        ) : null}
      </div>
    </div>
  )
}