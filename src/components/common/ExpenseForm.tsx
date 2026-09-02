import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { getExpenseCategories } from '@/services/categoryService'
import { baseExpenseCategories } from '@/types/expense'
import type { Expense, ExpenseInput } from '@/types/expense'

function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${now.getFullYear()}-${month}-${day}`
}

function toNumber(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : 0
}

const expenseFormSchema = z.object({
  amount: z
    .string()
    .min(1, 'validation.amountRequired')
    .refine((value) => toNumber(value) > 0, 'validation.amountPositive'),
  category: z.string().min(1, 'validation.categoryRequired'),
  note: z.string(),
  date: z.string().min(1, 'validation.dateRequired'),
})

type ExpenseFormValues = z.infer<typeof expenseFormSchema>

type ExpenseFormProps = {
  initialValue?: Expense
  onSubmit: (input: ExpenseInput) => Promise<boolean>
  onCancel?: () => void
}

export function ExpenseForm({
  initialValue,
  onSubmit,
  onCancel,
}: ExpenseFormProps) {
  const { t } = useTranslation()

  // Свои категории пользователя подгружаются из базы.
  const categoriesQuery = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: getExpenseCategories,
  })

  const emptyValues: ExpenseFormValues = {
    amount: '',
    category: '',
    note: '',
    date: todayIso(),
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: initialValue
      ? {
          amount: String(initialValue.amount),
          category: initialValue.category,
          note: initialValue.note ?? '',
          date: initialValue.date,
        }
      : emptyValues,
  })

  // Базовые категории: код хранится в базе, на экран идёт перевод.
  const baseGroup = {
    label: t('expense.categoryGroupBase'),
    options: baseExpenseCategories.map((category) => ({
      value: category,
      label: t(`expense.categories.${category}`),
    })),
  }

  // Свои категории: в базе хранится само название, переводить нечего.
  const customGroup = {
    label: t('expense.categoryGroupCustom'),
    options: (categoriesQuery.data ?? []).map((category) => ({
      value: category.name,
      label: category.name,
    })),
  }

  async function handleFormSubmit(values: ExpenseFormValues) {
    const isSaved = await onSubmit({
      amount: toNumber(values.amount),
      category: values.category,
      note: values.note.trim() === '' ? null : values.note.trim(),
      date: values.date,
    })

    if (isSaved && !initialValue) {
      reset(emptyValues)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('expense.amount')}
          type="text"
          inputMode="decimal"
          placeholder={t('expense.amountPlaceholder')}
          hint={t('expense.amountHint')}
          error={errors.amount ? t(errors.amount.message ?? '') : undefined}
          {...register('amount')}
        />

        <Select
          label={t('expense.category')}
          placeholder={t('expense.categoryPlaceholder')}
          groups={[baseGroup, customGroup]}
          error={errors.category ? t(errors.category.message ?? '') : undefined}
          {...register('category')}
        />

        <Input
          label={t('expense.date')}
          type="date"
          error={errors.date ? t(errors.date.message ?? '') : undefined}
          {...register('date')}
        />
      </div>

      <Input
        label={t('expense.note')}
        type="text"
        placeholder={t('expense.notePlaceholder')}
        error={errors.note ? t(errors.note.message ?? '') : undefined}
        {...register('note')}
      />

      <div className="flex items-center gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {t('expense.save')}
        </Button>

        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('expense.cancel')}
          </Button>
        ) : null}
      </div>
    </form>
  )
}