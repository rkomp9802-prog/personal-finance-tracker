export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 px-4 py-4 sm:px-6">
      <p className="text-xs text-slate-400">
        © {year} Personal Finance Tracker · Учебный проект
      </p>
    </footer>
  )
}