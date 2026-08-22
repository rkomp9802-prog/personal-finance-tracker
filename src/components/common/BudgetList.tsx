import { useTranslation } from 'react-i18next'
import { EntityCard } from '@/components/common/EntityCard'
import { isBaseExpenseCategory } from '@/types/expense'
import type { BudgetWithProgress } from '@/types/budget'

type BudgetListProps = {
  budgets: BudgetWithProgress[]
  onSelect?: (budget: BudgetWithProgress) => void
}

export function BudgetList({ budgets, onSelect }: BudgetListProps) {
  const { t } = useTranslation()

  // Базовую категорию переводим, свою показываем как есть.
  function categoryLabel(category: string): string {
    return isBaseExpenseCategory(category)
      ? t(`expense.categories.${category}`)
      : category
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {budgets.map((budget) => (
        <EntityCard
          key={budget.id}
          variant="budget"
          category={categoryLabel(budget.category)}
          limitAmount={budget.limit_amount}
          spentAmount={budget.spent}
          onClick={onSelect ? () => onSelect(budget) : undefined}
        />
      ))}
    </div>
  )
}