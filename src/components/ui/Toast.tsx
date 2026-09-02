import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { cn } from '@/utils/cn'

type ToastVariant = 'info' | 'success' | 'error'

type ToastItemData = {
  id: number
  message: string
  variant: ToastVariant
}

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// Этим крючком любая страница сможет вызвать уведомление.
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast нужно использовать внутри <ToastProvider>')
  }

  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItemData[]>([])
  const nextId = useRef(1)

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = nextId.current
      nextId.current += 1

      setToasts((current) => [...current, { id, message, variant }])
      window.setTimeout(() => removeToast(id), 4000)
    },
    [removeToast],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}

      {createPortal(
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
          <AnimatePresence initial={false}>
            {toasts.map((toast) => (
              <ToastCard
                key={toast.id}
                toast={toast}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

const toastStyles: Record<ToastVariant, string> = {
  info: 'border-slate-200 text-slate-700',
  success: 'border-emerald-200 text-emerald-800',
  error: 'border-red-200 text-red-800',
}

const toastIcons: Record<ToastVariant, typeof Info> = {
  info: Info,
  success: CircleCheck,
  error: CircleAlert,
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItemData
  onClose: () => void
}) {
  const Icon = toastIcons[toast.variant]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-md',
        toastStyles[toast.variant],
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm leading-relaxed">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрыть"
        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}