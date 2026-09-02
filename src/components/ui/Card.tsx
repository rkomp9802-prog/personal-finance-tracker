import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean
}

export function Card({
  className,
  interactive = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card shadow-sm',
        interactive && 'transition-shadow duration-200 hover:shadow-md',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 pb-4 pt-6', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold tracking-tight text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('mt-1 text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 pb-6', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-t border-muted px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}