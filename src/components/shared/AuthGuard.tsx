'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/lib/store/auth.store'

interface AuthGuardProps {
  children: React.ReactNode
  authRequired?: boolean
  adminRequired?: boolean
  authNotRequiredButLoggedInCb?: () => void
}

export function AuthGuard({ 
  children, 
  authRequired = false, 
  adminRequired = false,
  authNotRequiredButLoggedInCb
}: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, user, isAdmin } = useAuthStore()
  const [userReady, setUserReady] = useState(false)

  useEffect(() => {
    if (adminRequired) {
      if (!isAuthenticated) {
        // Show toast notification here if you have a toast system
        console.log('Please login to continue')
        router.replace('/auth/login')
      } else if (!isAdmin()) {
        // Show toast notification here if you have a toast system
        console.log('You are not authorized to access this page')
        router.replace('/')
      } else {
        setUserReady(true)
      }
    } else if (authRequired && !isAuthenticated) {
      // Show toast notification here if you have a toast system
      console.log('Please login to continue')
      router.replace('/auth/login')
    } else if (!authRequired && isAuthenticated) {
      authNotRequiredButLoggedInCb?.()
      setUserReady(true)
    } else {
      setUserReady(true)
    }
  }, [authRequired, adminRequired, isAuthenticated, isAdmin, router, authNotRequiredButLoggedInCb])

  if (typeof window === 'undefined' || !userReady) return null
  
  return <>{children}</>
} 