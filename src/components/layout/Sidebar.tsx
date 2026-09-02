import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  LayoutDashboard,
  PieChart,
  Target,
  User,
  Wallet,
} from 'lucide-react'
import { cn } from '@/utils/cn'

type SidebarProps = {
  onNavigate?: () => void
}

// Один список — один источник правды о разделах приложения.
// labelKey — ключ в словарях переводов, а не сама надпись.
export const navigationItems = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { to: '/incomes', labelKey: 'nav.incomes', icon: ArrowDownLeft, end: false },
  { to: '/expenses', labelKey: 'nav.expenses', icon: ArrowUpRight, end: false },
  { to: '/budgets', labelKey: 'nav.budgets', icon: Wallet, end: false },
  { to: '/goals', labelKey: 'nav.goals', icon: Target, end: false },
  { to: '/calendar', labelKey: 'nav.calendar', icon: Calendar, end: false },
  { to: '/statistics', labelKey: 'nav.statistics', icon: PieChart, end: false },
  { to: '/profile', labelKey: 'nav.profile', icon: User, end: false },
]

export function Sidebar({ onNavigate }: SidebarProps) {
  const { t } = useTranslation()

  return (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto p-4">
      {navigationItems.map((item) => {
        const Icon = item.icon

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}