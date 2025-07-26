'use client'

import { useAuthStore } from '@/lib/store/auth.store'
import { useRouter } from 'next/router'
import { Button } from '@/components/shadcn/button'
import { User, Shield, LogOut } from 'lucide-react'

interface BasicLayoutProps {
  children: React.ReactNode
}

export function BasicLayout({ children }: BasicLayoutProps) {
  const { user, logout, isAuthenticated, isAdmin } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const handleAdminDashboard = () => {
    router.push('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      {isAuthenticated ? (
        <div className="absolute top-4 right-4 flex items-center gap-4 z-50">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span>{user?.name}</span>
            {isAdmin() && (
              <Shield className="h-4 w-4 text-primary" />
            )}
          </div>
          {isAdmin() && (
            <Button variant="outline" size="sm" onClick={handleAdminDashboard}>
              Admin Dashboard
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      ) : (
        <div className="absolute top-4 right-4 z-50">
          <Button onClick={() => router.push('/auth/login')}>
            Login
          </Button>
        </div>
      )}

      {children}
    </div>
  )
} 