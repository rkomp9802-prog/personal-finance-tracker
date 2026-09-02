import { useId } from 'react'
import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/utils/cn'

type InputProps = ComponentPropsWithRef<'input'> & {
  label?: string
  hint?: string
  error?: string
}

export function Input({
  className,
  label,
  hint,
  error,
  id,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-label"
        >
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(
          'h-10 w-full rounded-lg border bg-card px-3 text-sm text-foreground transition-[color,background-color,border-color,box-shadow] duration-200 ease-spring placeholder:text-subtle-foreground focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-background disabled:text-subtle-foreground',
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-border focus:border-blue-500 focus:ring-blue-100',
          className,
        )}
        {...props}
      />

      {error ? (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}