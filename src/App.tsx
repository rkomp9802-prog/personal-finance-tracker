import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'

function App() {
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function runLoadingDemo() {
    setIsLoading(true)
    window.setTimeout(() => setIsLoading(false), 1200)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Personal Finance Tracker
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            UI-Kit
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Базовые детали интерфейса. Дальше из них собираются все экраны
            приложения.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Кнопки</CardTitle>
            <CardDescription>Четыре вида и три размера.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button>Основная</Button>
            <Button variant="secondary">Вторичная</Button>
            <Button variant="ghost">Без фона</Button>
            <Button variant="danger">Удалить</Button>
            <Button size="sm">Маленькая</Button>
            <Button size="lg">Большая</Button>
            <Button disabled>Отключена</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Поля ввода</CardTitle>
            <CardDescription>
              С подписью, подсказкой и состоянием ошибки.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Сумма"
              placeholder="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              hint="Введите сумму в сумах"
            />
            <Input label="Комментарий" placeholder="Например: обед" />
            <Input
              label="Email"
              placeholder="you@example.com"
              error="Введите корректный адрес"
            />
            <Input label="Недоступное поле" placeholder="Заблокировано" disabled />
          </CardContent>
          <CardFooter>
            <Button fullWidth isLoading={isLoading} onClick={runLoadingDemo}>
              Проверить состояние загрузки
            </Button>
          </CardFooter>
        </Card>

        <Card interactive>
          <CardHeader>
            <CardTitle>Карточка с наведением</CardTitle>
            <CardDescription>Наведи мышкой — тень станет глубже.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Такие карточки будут использоваться для списков операций, бюджетов
              и целей.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App