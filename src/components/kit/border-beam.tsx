import type { CSSProperties } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { Transition } from 'motion/react'
import { cn } from '@/utils/cn'

type BorderBeamProps = {
  className?: string
  // Длина светящегося отрезка в точках
  size?: number
  // Сколько секунд занимает полный круг
  duration?: number
  delay?: number
  colorFrom?: string
  colorTo?: string
  transition?: Transition
  style?: CSSProperties
  // Пустить луч в обратную сторону
  reverse?: boolean
  // С какого места круга начинать, в процентах
  initialOffset?: number
  borderWidth?: number
}

export function BorderBeam({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = '#ffaa40',
  colorTo = '#9c40ff',
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}: BorderBeamProps) {
  // Бегущий по кругу луч — бесконечная анимация, а такие требование
  // «убрать движение» обязано схлопывать полностью. Не в статичную
  // полоску, а совсем: неподвижный кусок свечения на одной стороне
  // рамки выглядел бы дефектом отрисовки.
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return null
  }

  return (
    // Прозрачная рамка поверх карточки. Маска вырезает середину,
    // поэтому видна только полоска по контуру.
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-(length:--border-beam-width) border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]"
      style={
        {
          '--border-beam-width': `${borderWidth}px`,
        } as CSSProperties
      }
    >
      {/* Сам светящийся отрезок. Едет по прямоугольному пути вдоль рамки. */}
      <motion.div
        className={cn(
          'absolute aspect-square bg-gradient-to-l from-(--color-from) via-(--color-to) to-transparent',
          className,
        )}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            '--color-from': colorFrom,
            '--color-to': colorTo,
            ...style,
          } as CSSProperties
        }
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration,
          delay: -delay,
          ...transition,
        }}
      />
    </div>
  )
}