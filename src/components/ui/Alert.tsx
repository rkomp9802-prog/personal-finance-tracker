import type { ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import { cn } from '@/utils/cn'

// В интерфейсе алерт всегда сообщает об ошибке загрузки или отправки.
// Варианты info / success / warning были объявлены, но не использовались
// ни разу: для успеха у нас тост, для подсказок — обычный текст.
type AlertVariant = 'danger'

const alertStyles: Record<AlertVariant, { box: string; icon: string }> = {
  danger: {
    box: 'border-red-200 bg-red-50 text-red-800',
    icon: 'text-red-600',
  },
}

const alertIcons: Record<AlertVariant, typeof CircleAlert> = {
  danger: CircleAlert,
}

type AlertProps = {
  variant?: AlertVariant
  title?: string
  children?: ReactNode
  className?: string
}

export function Alert({
  variant = 'danger',
  title,
  children,
  className,
}: AlertProps) {
  const Icon = alertIcons[variant]
  const style = alertStyles[variant]

  return (
    <div
      className={cn(
        'flex gap-3 rounded-2xl border px-4 py-3',
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
