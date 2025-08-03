import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface AuthGuardProps {
  children: React.ReactNode
  authRequired?: boolean
}

export default function AuthGuardComponent({ 
  children, 
  authRequired = false
}: AuthGuardProps) {
  const router = useRouter()
  const [userReady, setUserReady] = useState(false)

  useEffect(() => {
    const authData = localStorage.getItem('auth-storage')
    const parsedData = authData ? JSON.parse(authData) : {}
    const isAuthenticated = parsedData.state?.isAuthenticated || false
    const isAdmin = parsedData.state?.user?.role === 'admin'

    console.log('isAuthenticated', isAuthenticated)
    console.log('isAdmin', isAdmin)

    if (authRequired) {
      if (!isAuthenticated) {
        console.log('Authentication required')
        router.replace('/auth/login')
        return
      }
      if (isAuthenticated && !isAdmin) {
        console.log('Not authorized')
        router.replace('/403')
        return
      }
    }

    if (isAuthenticated && router.pathname === '/auth/login') {
      router.replace(isAdmin ? '/' : '/')
      return
    }

    setUserReady(true)
  }, [authRequired, router])

  if (typeof window === 'undefined' || !userReady) return null
  
  return <>{children}</>
} 