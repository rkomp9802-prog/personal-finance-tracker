import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// Экран, который увидит человек вместо белой пустоты.
function ErrorFallback({ error }: { error: Error }) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
        </div>

        <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
          {t('error.title')}
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {t('error.description')}
        </p>

        <Button
          className="mt-6"
          fullWidth
          onClick={() => window.location.reload()}
        >
          {t('error.reload')}
        </Button>

        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-slate-400">
            {t('error.details')}
          </summary>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            {error.message}
          </pre>
        </details>
      </div>
    </div>
  )
}

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  error: Error | null
}

// Перехватчик ошибок обязан быть классом: у React нет крючка для этой задачи.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  // Сработает, когда где-то внутри произойдёт ошибка при отрисовке.
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  // Сюда удобно позже подключить отправку ошибок в сервис наблюдения.
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Ошибка в приложении:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}