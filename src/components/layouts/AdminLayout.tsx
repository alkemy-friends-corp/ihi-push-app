'use client'

import React from 'react'
import { useAuthStore } from '@/lib/store/auth.store'
import { useRouter } from 'next/router'
import { Button } from '@/components/shadcn/button'
import { Badge } from '@/components/shadcn/badge'
import { Shield, LogOut, User, LayoutDashboard, Smartphone } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  activeModuleMenu?: string
}

export function AdminLayout({ children, activeModuleMenu }: AdminLayoutProps) {
  const { user, logout, isAdmin } = useAuthStore()
  const router = useRouter()

  // Check if user is admin, if not redirect to 403
  React.useEffect(() => {
    if (user && !isAdmin()) {
      router.replace('/403')
    }
  }, [user, isAdmin, router])

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Admin
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <Button
              variant={activeModuleMenu === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeModuleMenu === 'device-manager' ? 'default' : 'ghost'}
              onClick={() => router.push('/admin/device-manager')}
              className="flex items-center gap-2"
            >
              <Smartphone className="h-4 w-4" />
              Device Manager
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
} 