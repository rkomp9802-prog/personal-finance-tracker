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
import type { Budget, BudgetInput } from '@/types/budget'

function toNumber(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : 0
}

const budgetFormSchema = z.object({
  category: z.string().min(1, 'validation.categoryRequired'),
  limitAmount: z
    .string()
    .min(1, 'validation.amountRequired')
    .refine((value) => toNumber(value) > 0, 'validation.amountPositive'),
})

type BudgetFormValues = z.infer<typeof budgetFormSchema>

type BudgetFormProps = {
  initialValue?: Budget
  // Категории, для которых лимит уже задан — их не предлагаем повторно.
  usedCategories?: string[]
  onSubmit: (input: BudgetInput) => Promise<boolean>
  onCancel?: () => void
}

export function BudgetForm({
  initialValue,
  usedCategories = [],
  onSubmit,
  onCancel,
}: BudgetFormProps) {
  const { t } = useTranslation()

  const categoriesQuery = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: getExpenseCategories,
  })

  const emptyValues: BudgetFormValues = {
    category: '',
    limitAmount: '',
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: initialValue
      ? {
          category: initialValue.category,
          limitAmount: String(initialValue.limit_amount),
        }
      : emptyValues,
  })

  // Категорию скрываем, если лимит на неё уже есть.
  // Исключение — та, которую сейчас редактируем.
  function isAvailable(category: string): boolean {
    if (initialValue && initialValue.category === category) {
      return true
    }

    return !usedCategories.includes(category)
  }

  const baseGroup = {
    label: t('budget.categoryGroupBase'),
    options: baseExpenseCategories.filter(isAvailable).map((category) => ({
      value: category,
      label: t(`expense.categories.${category}`),
    })),
  }

  const customGroup = {
    label: t('budget.categoryGroupCustom'),
    options: (categoriesQuery.data ?? [])
      .filter((category) => isAvailable(category.name))
      .map((category) => ({
        value: category.name,
        label: category.name,
      })),
  }

  async function handleFormSubmit(values: BudgetFormValues) {
    const isSaved = await onSubmit({
      category: values.category,
      limit_amount: toNumber(values.limitAmount),
    })

    if (isSaved && !initialValue) {
      reset(emptyValues)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={t('budget.category')}
          placeholder={t('budget.categoryPlaceholder')}
          groups={[baseGroup, customGroup]}
          error={errors.category ? t(errors.category.message ?? '') : undefined}
          {...register('category')}
        />

        <Input
          label={t('budget.limit')}
          type="text"
          inputMode="decimal"
          placeholder={t('budget.limitPlaceholder')}
          hint={t('budget.limitHint')}
          error={
            errors.limitAmount ? t(errors.limitAmount.message ?? '') : undefined
          }
          {...register('limitAmount')}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {t('budget.save')}
        </Button>

        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('budget.cancel')}
          </Button>
        ) : null}
      </div>
    </form>
  )
}