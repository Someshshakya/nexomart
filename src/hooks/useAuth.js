import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../services/auth'
import { useAuthStore } from '../store/authStore'

function redirectByRole(role, navigate) {
  if (role === 'vendor') navigate('/vendor/dashboard')
  else if (role === 'admin') navigate('/admin')
  else navigate('/dashboard')
}

export function useRequireAuth(role) {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
      return
    }
    if (role && user.role !== role) {
      navigate('/', { replace: true })
    }
  }, [user, role, navigate, location.pathname])

  return { user, isLoading: false }
}

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const api = useMemo(
    () => ({
      async login(payload) {
        setIsLoading(true)
        try {
          const result = await loginUser(payload)
          setAuth(result.user, result.token)
          redirectByRole(result.user?.role, navigate)
          return result
        } finally {
          setIsLoading(false)
        }
      },
      async register(payload) {
        setIsLoading(true)
        try {
          const result = await registerUser(payload)
          setAuth(result.user, result.token)
          redirectByRole(result.user?.role, navigate)
          return result
        } finally {
          setIsLoading(false)
        }
      },
      logout() {
        clearAuth()
        navigate('/login')
      },
    }),
    [setAuth, clearAuth, navigate],
  )

  return {
    user,
    isLoading,
    ...api,
  }
}
