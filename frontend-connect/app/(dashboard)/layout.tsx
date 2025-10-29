import Sidebar from '@/components/layout/Sidebar'
import { AuthBypass } from '@/components/AuthBypass'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthBypass
      fallback={
        <div className="flex h-screen bg-gray-50 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading account...</p>
          </div>
        </div>
      }
    >
      <div className="flex h-screen bg-gray-50">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthBypass>
  )
}