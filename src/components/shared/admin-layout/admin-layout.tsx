'use client'

import { Button } from '@/components/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/dropdown-menu'
import LanguageSwitcher from '@/components/shared/language-switcher/language-switcher'
import { useTranslations } from '@/hooks/useTranslations'
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  User,
  Users,
  X
} from 'lucide-react'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { WeatherWidget } from '../weather-widget'

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

  const adminUser = {
    name: 'Admin',
    avatar: null
  }

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
    router.push('/')
  }

  const handleLogout = () => {
    localStorage.removeItem('auth-storage')
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
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
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
        <div className="p-4 bg-gray-100 m-5 rounded-lg min-h-32">
          <WeatherWidget />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            Welcome, Admin!
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md"
                >
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    {adminUser.avatar ? (
                      <img
                        src={adminUser.avatar}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
                    {adminUser.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer" onClick={handleReturnToMain}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('admin.returnToMain')}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('admin.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}