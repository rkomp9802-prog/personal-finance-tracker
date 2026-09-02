import type { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

// Здесь описаны все варианты внешнего вида кнопки.
// Первая строка — общие классы, дальше — отличия по виду и размеру.
const buttonStyles = cva(
  // active:scale — кнопка слегка проседает под нажатием, как физическая.
  // transition перечисляет свойства явно, чтобы в анимацию попал и transform.
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-spring active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Тень главной кнопки окрашена в её собственный синий, а не в чёрный:
        // так она выглядит свечением предмета, а не грязью под ним.
        primary:
          'bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-blue-600/35 active:bg-blue-800',
        secondary:
          'border border-border bg-card text-label hover:bg-background active:bg-muted',
        ghost: 'text-body hover:bg-muted hover:text-foreground',
        danger:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & {
    isLoading?: boolean
  }

export function Button({
  className,
  variant,
  size,
  fullWidth,
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonStyles({ variant, size, fullWidth }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
      ) : null}
      {children}
    </button>
  )
}