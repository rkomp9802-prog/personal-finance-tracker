import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'

// Временная сборка каркаса. На шаге 4.2 переедет в MainLayout.
function TemporaryShell() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white/70 backdrop-blur-md lg:block">
          <Sidebar />
        </aside>

        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto w-full max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle>Каркас приложения</CardTitle>
                <CardDescription>
                  Шапка сверху, меню слева, подвал снизу.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-slate-600">
                <p>
                  Пункт «Главная» в меню подсвечен синим — это текущий раздел.
                </p>
                <p>
                  Остальные пункты пока возвращают сюда же: их страницы появятся
                  на своих этапах.
                </p>
                <p>
                  На узком экране меню слева прячется, а в шапке появляется
                  кнопка с тремя полосками. Работать она начнёт на шаге 4.2.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<TemporaryShell />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App