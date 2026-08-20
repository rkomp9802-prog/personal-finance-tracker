import { useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'

function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { showToast } = useToast()

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Personal Finance Tracker
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            UI-Kit: сообщения и загрузка
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Сообщения на странице</CardTitle>
            <CardDescription>
              Спокойный тон вместо агрессивных баннеров.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Alert title="Подсказка">
              Добавьте первую операцию, чтобы увидеть статистику.
            </Alert>
            <Alert variant="success" title="Цель достигнута">
              Вы накопили нужную сумму на «Отпуск».
            </Alert>
            <Alert variant="warning" title="Бюджет почти исчерпан">
              На категорию «Кафе» осталось 12% лимита до конца месяца.
            </Alert>
            <Alert variant="danger" title="Не удалось сохранить">
              Проверьте соединение с интернетом и попробуйте ещё раз.
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Заглушки при загрузке</CardTitle>
            <CardDescription>
              Так выглядит карточка, пока данные едут из базы.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-2 h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
            <SkeletonText lines={3} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Всплывающее окно и уведомления</CardTitle>
            <CardDescription>Нажми на кнопки и посмотри.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => setIsDialogOpen(true)}>
              Открыть окно
            </Button>
            <Button
              variant="secondary"
              onClick={() => showToast('Операция сохранена', 'success')}
            >
              Уведомление об успехе
            </Button>
            <Button
              variant="secondary"
              onClick={() => showToast('Не удалось сохранить', 'error')}
            >
              Уведомление об ошибке
            </Button>
            <Button
              variant="ghost"
              onClick={() => showToast('Черновик сохранён')}
            >
              Обычное уведомление
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Удалить операцию?"
        description="Это действие нельзя отменить."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setIsDialogOpen(false)
                showToast('Операция удалена', 'success')
              }}
            >
              Удалить
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-slate-600">
          Запись «Обед в кафе — 45 000 сум» будет удалена без возможности
          восстановления.
        </p>
      </Dialog>
    </div>
  )
}

export default App