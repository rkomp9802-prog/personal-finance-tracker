import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

// Серый пульсирующий прямоугольник — заглушка на месте будущих данных.
export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-border', className)}
      {...props}
    />
  )
}

type SkeletonTextProps = {
  lines?: number
  className?: string
}

// Несколько полосок подряд — имитация абзаца текста.
export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={index === lines - 1 ? 'h-4 w-2/3' : 'h-4 w-full'}
        />
      ))}
    </div>
  )
}