import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type AvatarUploaderProps = {
  avatarUrl: string | null
  fallbackText: string
  isPending?: boolean
  onSelectFile: (file: File) => void
  onRemove: () => void
}

export function AvatarUploader({
  avatarUrl,
  fallbackText,
  isPending = false,
  onSelectFile,
  onRemove,
}: AvatarUploaderProps) {
  const { t } = useTranslation()
  // Ссылка на скрытое поле выбора файла — по ней мы его «нажимаем».
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initial = fallbackText.charAt(0).toUpperCase()

  return (
    <div className="flex flex-wrap items-center gap-5">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={t('profile.avatar')}
          className="h-20 w-20 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-semibold text-white">
          {initial}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {avatarUrl ? t('profile.change') : t('profile.upload')}
          </Button>

          {avatarUrl ? (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
              {t('profile.remove')}
            </Button>
          ) : null}
        </div>

        <p className="text-sm text-slate-500">{t('profile.avatarHint')}</p>
      </div>

      {/* Системное поле выбора файла спрятано — вид задаём своими кнопками */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]

          if (file) {
            onSelectFile(file)
          }

          // Сбрасываем значение, иначе повторный выбор того же файла не сработает.
          event.target.value = ''
        }}
      />
    </div>
  )
}