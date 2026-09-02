import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { incomeCategories } from '@/types/income'
import type { Income, IncomeCategory, IncomeInput } from '@/types/income'

// Сегодняшняя дата в виде 2026-08-21.
function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${now.getFullYear()}-${month}-${day}`
}

// Пользователь может ввести «1 500 000» или «1500,50» — приводим к числу.
function toNumber(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : 0
}

const incomeFormSchema = z.object({
  amount: z
    .string()
    .min(1, 'validation.amountRequired')
    .refine((value) => toNumber(value) > 0, 'validation.amountPositive'),
  category: z.string().min(1, 'validation.categoryRequired'),
  source: z.string(),
  note: z.string(),
  date: z.string().min(1, 'validation.dateRequired'),
})

type IncomeFormValues = z.infer<typeof incomeFormSchema>

type IncomeFormProps = {
  // Если передан — форма работает в режиме редактирования.
  initialValue?: Income
  // Возвращает true, если сохранение прошло успешно. Тогда форма очищается.
  onSubmit: (input: IncomeInput) => Promise<boolean>
  onCancel?: () => void
}

export function IncomeForm({
  initialValue,
  onSubmit,
  onCancel,
}: IncomeFormProps) {
  const { t } = useTranslation()

  const emptyValues: IncomeFormValues = {
    amount: '',
    category: '',
    source: '',
    note: '',
    date: todayIso(),
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: initialValue
      ? {
          amount: String(initialValue.amount),
          category: initialValue.category,
          source: initialValue.source ?? '',
          note: initialValue.note ?? '',
          date: initialValue.date,
        }
      : emptyValues,
  })

  const categoryOptions = incomeCategories.map((category) => ({
    value: category,
    label: t(`income.categories.${category}`),
  }))

  async function handleFormSubmit(values: IncomeFormValues) {
    const isSaved = await onSubmit({
      amount: toNumber(values.amount),
      category: values.category as IncomeCategory,
      source: values.source.trim() === '' ? null : values.source.trim(),
      note: values.note.trim() === '' ? null : values.note.trim(),
      date: values.date,
    })

    // Очищаем форму только после удачного сохранения нового дохода.
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
          label={t('income.amount')}
          type="text"
          inputMode="decimal"
          placeholder={t('income.amountPlaceholder')}
          hint={t('income.amountHint')}
          error={errors.amount ? t(errors.amount.message ?? '') : undefined}
          {...register('amount')}
        />

        <Select
          label={t('income.category')}
          placeholder={t('income.categoryPlaceholder')}
          options={categoryOptions}
          error={errors.category ? t(errors.category.message ?? '') : undefined}
          {...register('category')}
        />

        <Input
          label={t('income.source')}
          type="text"
          placeholder={t('income.sourcePlaceholder')}
          error={errors.source ? t(errors.source.message ?? '') : undefined}
          {...register('source')}
        />

        <Input
          label={t('income.date')}
          type="date"
          error={errors.date ? t(errors.date.message ?? '') : undefined}
          {...register('date')}
        />
      </div>

      <Input
        label={t('income.note')}
        type="text"
        placeholder={t('income.notePlaceholder')}
        error={errors.note ? t(errors.note.message ?? '') : undefined}
        {...register('note')}
      />

      <div className="flex items-center gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {t('income.save')}
        </Button>

        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('income.cancel')}
          </Button>
        ) : null}
      </div>
    </form>
  )
}