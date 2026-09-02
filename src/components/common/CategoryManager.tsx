import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import {
  createExpenseCategory,
  deleteExpenseCategory,
  getExpenseCategories,
  updateExpenseCategory,
} from '@/services/categoryService'
import { baseExpenseCategories } from '@/types/expense'

const MAX_NAME_LENGTH = 40

export function CategoryManager() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const [newName, setNewName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const categoriesQuery = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: getExpenseCategories,
  })

  function refreshCategories() {
    void queryClient.invalidateQueries({ queryKey: ['expenseCategories'] })
  }

  const createMutation = useMutation({
    mutationFn: createExpenseCategory,
    onSuccess: refreshCategories,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateExpenseCategory(id, { name }),
    onSuccess: refreshCategories,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteExpenseCategory,
    onSuccess: refreshCategories,
  })

  // Названия, которые уже заняты базовыми категориями —
  // и коды, и переводы на текущем языке.
  function isReserved(name: string): boolean {
    const normalized = name.trim().toLowerCase()

    return baseExpenseCategories.some(
      (code) =>
        code.toLowerCase() === normalized ||
        t(`expense.categories.${code}`).toLowerCase() === normalized,
    )
  }

  // Общая проверка названия. Возвращает ключ ошибки или null.
  function validateName(name: string): string | null {
    const trimmed = name.trim()

    if (trimmed.length === 0) {
      return 'categoryManager.nameRequired'
    }

    if (trimmed.length > MAX_NAME_LENGTH) {
      return 'categoryManager.nameTooLong'
    }

    if (isReserved(trimmed)) {
      return 'categoryManager.reservedName'
    }

    return null
  }

  // Сервис может вернуть ключ перевода вместо обычного текста.
  function toMessage(error: unknown, fallbackKey: string): string {
    if (!(error instanceof Error)) {
      return t(fallbackKey)
    }

    return error.message.startsWith('expense.')
      ? t(error.message)
      : error.message
  }

  async function handleCreate() {
    const errorKey = validateName(newName)

    if (errorKey) {
      setFormError(t(errorKey))
      return
    }

    setFormError(null)

    try {
      await createMutation.mutateAsync({ name: newName })
      showToast(t('categoryManager.created'), 'success')
      setNewName('')
    } catch (error) {
      setFormError(toMessage(error, 'categoryManager.createError'))
    }
  }

  async function handleRename(id: string) {
    const errorKey = validateName(editingName)

    if (errorKey) {
      showToast(t(errorKey), 'error')
      return
    }

    try {
      await updateMutation.mutateAsync({ id, name: editingName })
      showToast(t('categoryManager.updated'), 'success')
      setEditingId(null)
      setEditingName('')
    } catch (error) {
      showToast(toMessage(error, 'categoryManager.updateError'), 'error')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id)
      showToast(t('categoryManager.deleted'), 'success')
    } catch (error) {
      showToast(toMessage(error, 'categoryManager.deleteError'), 'error')
    }
  }

  const categories = categoriesQuery.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <Input
          value={newName}
          onChange={(event) => {
            setNewName(event.target.value)
            setFormError(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void handleCreate()
            }
          }}
          placeholder={t('categoryManager.namePlaceholder')}
          error={formError ?? undefined}
        />

        <Button
          type="button"
          onClick={() => void handleCreate()}
          isLoading={createMutation.isPending}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
          {t('categoryManager.add')}
        </Button>
      </div>

      {categoriesQuery.isPending ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : categoriesQuery.isError ? (
        <Alert variant="danger" title={t('categoryManager.loadError')}>
          {categoriesQuery.error instanceof Error
            ? categoriesQuery.error.message
            : ''}
        </Alert>
      ) : categories.length === 0 ? (
        <div className="rounded-lg bg-background px-4 py-6 text-center">
          <p className="text-sm font-medium text-foreground">
            {t('categoryManager.empty')}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('categoryManager.emptyHint')}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-border px-3 py-2"
            >
              {editingId === category.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    className="h-9"
                  />
                  <Button
                    size="sm"
                    onClick={() => void handleRename(category.id)}
                    isLoading={updateMutation.isPending}
                  >
                    <Check className="h-4 w-4" />
                    {t('categoryManager.save')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null)
                      setEditingName('')
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : confirmingId === category.id ? (
                <>
                  <span className="mr-auto text-sm text-body">
                    {t('categoryManager.confirmDelete')}{' '}
                    <span className="text-subtle-foreground">
                      {t('categoryManager.deleteWarning')}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    variant="danger"
                    isLoading={deleteMutation.isPending}
                    onClick={() => {
                      void handleDelete(category.id)
                      setConfirmingId(null)
                    }}
                  >
                    {t('categoryManager.confirmYes')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmingId(null)}
                  >
                    {t('categoryManager.confirmNo')}
                  </Button>
                </>
              ) : (
                <>
                  <span className="mr-auto text-sm font-medium text-foreground">
                    {category.name}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    title={t('categoryManager.edit')}
                    onClick={() => {
                      setConfirmingId(null)
                      setEditingId(category.id)
                      setEditingName(category.name)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    title={t('categoryManager.delete')}
                    onClick={() => {
                      setEditingId(null)
                      setConfirmingId(category.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}