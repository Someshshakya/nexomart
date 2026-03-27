import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginUser } from '../services/auth'
import { useAuthStore } from '../store/authStore'
import './auth.css'

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or phone is required')
    .refine(
      (value) =>
        value.includes('@')
          ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          : /^[0-9]{10,15}$/.test(value),
      'Enter a valid email or phone number',
    ),
  password: z.string().min(1, 'Password is required'),
})

function redirectByRole(role, navigate) {
  if (role === 'vendor') navigate('/vendor/dashboard')
  else if (role === 'admin') navigate('/admin')
  else navigate('/dashboard')
}

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [apiError, setApiError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  })

  async function onSubmit(values) {
    setApiError('')
    try {
      const result = await loginUser(values)
      setAuth(result.user, result.token)
      redirectByRole(result.user?.role, navigate)
    } catch (error) {
      setApiError(error.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-decor">
        <p className="auth-logo">freefree.in</p>
        <h2 className="auth-tagline">Shop smarter. Earn together.</h2>
        <ul className="auth-bullets">
          <li>Explore trusted multi-vendor products</li>
          <li>Grow with referral commissions</li>
          <li>Fast shipping and easy returns</li>
          <li>Secure checkout on every order</li>
        </ul>
      </aside>

      <section className="auth-form-wrap">
        <form className="auth-form-card" onSubmit={handleSubmit(onSubmit)}>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Login to continue</p>

          <div className="auth-field">
            <label className="auth-label">Email / Phone</label>
            <input className="auth-input" {...register('identifier')} />
            {errors.identifier ? (
              <span className="auth-error">{errors.identifier.message}</span>
            ) : null}
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input type="password" className="auth-input" {...register('password')} />
            {errors.password ? (
              <span className="auth-error">{errors.password.message}</span>
            ) : null}
          </div>

          <div className="auth-row">
            <span />
            <Link to="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
          </div>

          {apiError ? <p className="auth-form-error">{apiError}</p> : null}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>

          <p className="auth-meta">
            Don&apos;t have an account? <Link className="auth-link" to="/register">Register</Link>
          </p>
        </form>
      </section>
    </div>
  )
}
