import { useEffect, useRef, useState } from 'react'

type AnimatedNumberProps = {
  value: number
  durationMs?: number
  format?: (value: number) => string
}

// Проверяем, не просил ли человек в настройках системы убрать анимации.
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function AnimatedNumber({
  value,
  durationMs = 800,
  format,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  // Откуда начинать в следующий раз — с того числа, где остановились.
  const startValueRef = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplayValue(value)
      startValueRef.current = value
      return
    }

    const startValue = startValueRef.current
    const startTime = performance.now()
    let frameId = 0

    function tick(now: number) {
      const progress = Math.min((now - startTime) / durationMs, 1)
      // Замедление к концу: в начале быстро, в конце плавно.
      const eased = 1 - Math.pow(1 - progress, 3)

      setDisplayValue(startValue + (value - startValue) * eased)

      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      } else {
        startValueRef.current = value
      }
    }

    frameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [value, durationMs])

  return <>{format ? format(displayValue) : Math.round(displayValue)}</>
}