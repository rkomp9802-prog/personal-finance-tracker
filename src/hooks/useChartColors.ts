import { useTheme } from '@/context/ThemeContext'

// Один набор цветов для всех графиков.
// Цвета данных одинаковы в обеих темах — они проверены на читаемость
// и на светлом, и на тёмном фоне. Меняется только оформление вокруг.
export function useChartColors() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return {
    income: '#2563eb',
    expense: '#d97706',
    bar: '#2563eb',
    grid: isDark ? '#1e293b' : '#f1f5f9',
    axis: isDark ? '#64748b' : '#94a3b8',
    label: isDark ? '#94a3b8' : '#64748b',
    categoryTick: isDark ? '#cbd5e1' : '#475569',
    cursor: isDark ? '#1e293b' : '#f8fafc',
    tooltipBackground: isDark ? '#0f172a' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#e2e8f0',
    tooltipText: isDark ? '#f8fafc' : '#0f172a',
  }
}