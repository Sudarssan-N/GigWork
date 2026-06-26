import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/useAuth'
import { Navbar } from '@/components/layout/Navbar'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { TasksExplorePage } from '@/pages/TasksExplorePage'
import { NewTaskPage } from '@/pages/customer/NewTaskPage'
import { MyTasksPage } from '@/pages/customer/MyTasksPage'
import { TaskPage } from '@/pages/TaskPage'
import { MyApplicationsPage } from '@/pages/worker/MyApplicationsPage'
import { WorkerOnboardPage } from '@/pages/worker/WorkerOnboardPage'
import { WorkerProfilePage } from '@/pages/worker/WorkerProfilePage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { BookingsPage } from '@/pages/BookingsPage'

const queryClient = new QueryClient()

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

              <Route path="/tasks" element={<ProtectedRoute><TasksExplorePage /></ProtectedRoute>} />
              <Route path="/tasks/new" element={<ProtectedRoute><NewTaskPage /></ProtectedRoute>} />
              <Route path="/tasks/mine" element={<ProtectedRoute><MyTasksPage /></ProtectedRoute>} />
              <Route path="/tasks/:id" element={<ProtectedRoute><TaskPage /></ProtectedRoute>} />

              {/* Legacy redirects */}
              <Route path="/customer/tasks" element={<Navigate to="/tasks/mine" replace />} />
              <Route path="/customer/tasks/new" element={<Navigate to="/tasks/new" replace />} />
              <Route path="/customer/tasks/:id" element={<Navigate to="/tasks/:id" replace />} />
              <Route path="/worker/tasks" element={<Navigate to="/tasks" replace />} />
              <Route path="/worker/tasks/:id" element={<Navigate to="/tasks/:id" replace />} />

              <Route path="/worker/applications" element={<ProtectedRoute><MyApplicationsPage /></ProtectedRoute>} />
              <Route path="/worker/onboard" element={<ProtectedRoute><WorkerOnboardPage /></ProtectedRoute>} />
              <Route path="/worker/profile" element={<ProtectedRoute><WorkerProfilePage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>} />
              <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}