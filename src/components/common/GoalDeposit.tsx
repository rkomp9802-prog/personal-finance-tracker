import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PiggyBank } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function toNumber(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : 0
}

type GoalDepositProps = {
  // Возвращает true при успешном пополнении — тогда поле очищается.
  onDeposit: (amount: number) => Promise<boolean>
  isPending?: boolean
}

export function GoalDeposit({ onDeposit, isPending = false }: GoalDepositProps) {
  const { t } = useTranslation()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleDeposit() {
    const value = toNumber(amount)

    if (amount.trim() === '') {
      setError(t('validation.amountRequired'))
      return
    }

    if (value <= 0) {
      setError(t('validation.amountPositive'))
      return
    }

    setError(null)

    const isSaved = await onDeposit(value)

    if (isSaved) {
      setAmount('')
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <Input
        label={t('goal.depositAmount')}
        type="text"
        inputMode="decimal"
        placeholder={t('goal.amountPlaceholder')}
        value={amount}
        onChange={(event) => {
          setAmount(event.target.value)
          setError(null)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            void handleDeposit()
          }
        }}
        error={error ?? undefined}
      />

      <Button
        type="button"
        onClick={() => void handleDeposit()}
        isLoading={isPending}
        className="shrink-0 sm:mt-7"
      >
        <PiggyBank className="h-4 w-4" />
        {t('goal.deposit')}
      </Button>
    </div>
  )
}