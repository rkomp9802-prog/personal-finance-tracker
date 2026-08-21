import { useId } from 'react'
import type { ComponentPropsWithRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export type SelectOption = {
  value: string
  label: string
}

export type SelectOptionGroup = {
  label: string
  options: SelectOption[]
}

type SelectProps = ComponentPropsWithRef<'select'> & {
  label?: string
  hint?: string
  error?: string
  placeholder?: string
  // Плоский список вариантов…
  options?: SelectOption[]
  // …или варианты, разбитые на группы с подписями.
  groups?: SelectOptionGroup[]
}

export function Select({
  className,
  label,
  hint,
  error,
  placeholder,
  options,
  groups,
  id,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          className={cn(
            'h-10 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100',
            className,
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}

          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}

          {groups?.map((group) =>
            group.options.length > 0 ? (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ) : null,
          )}
        </select>

        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
      </div>

      {error ? (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}