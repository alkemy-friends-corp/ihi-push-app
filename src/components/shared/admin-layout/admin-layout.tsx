'use client'

import { Button } from '@/components/shadcn/button'
import { Separator } from '@/components/shadcn/separator'
import LanguageSwitcher from '@/components/shared/language-switcher/language-switcher'
import { useTranslations } from '@/hooks/useTranslations'
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Users,
  X
} from 'lucide-react'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

export type Page = 'dashboard' | 'users' | 'notifications' | 'scheduled' | 'map' | 'disaster'

interface AdminLayoutProps {
  children: React.ReactNode
  activeMenu: Page
}

export function AdminLayout({ children, activeMenu }: AdminLayoutProps) {
  const router = useRouter()
  const { t } = useTranslations()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeUsers = 42
  const scheduledNotifications = 15
  const totalMapPoints = 128
  const urgentDisasters = 3

  const menuItems = [
    {
      id: 'dashboard' as Page,
      label: t('admin.menu.dashboard'),
      icon: LayoutDashboard,
      badge: null,
      path: '/admin/dashboard'
    },
    {
      id: 'users' as Page,
      label: t('admin.menu.users'),
      icon: Users,
      badge: activeUsers,
      path: '/admin/users'
    },
    {
      id: 'notifications' as Page,
      label: t('admin.menu.notifications'),
      icon: Bell,
      badge: scheduledNotifications,
      path: '/admin/notifications'
    },

    {
      id: 'map' as Page,
      label: t('admin.menu.map'),
      icon: Map,
      badge: totalMapPoints,
      path: '/admin/map'
    },
    {
      id: 'disaster' as Page,
      label: t('admin.menu.disaster'),
      icon: AlertTriangle,
      badge: urgentDisasters,
      path: '/admin/disaster'
    }
  ]

  const handleMenuClick = (path: string) => {
    router.push(path)
    setSidebarOpen(false)
  }

  const handleReturnToMain = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('admin')
    window.location.href = url.toString()
  }

  const handleLogout = () => {
    router.push('/auth/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`
        fixed lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 bg-white z-30 flex flex-col h-full border-r 
      `}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-xl">{t('app.title')}</h1>
            <Button
              variant="ghost"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">{t('admin.title')}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeMenu === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleMenuClick(item.path)}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            )
          })}
        </nav>

        <Separator />
        <div className="p-4 relative">
          <LanguageSwitcher />
        </div>

        <Separator /> 
        <div className="p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleReturnToMain}
          >
            <ArrowLeft className="w-4 h-4 mr-3" />
            {t('admin.returnToMain')}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            {t('admin.logout')}
          </Button>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-4 min-h-7">
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 