import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerUser } from '../services/auth'
import { useAuthStore } from '../store/authStore'
import './auth.css'

const registerSchema = z
  .object({
    role: z.enum(['customer', 'vendor']),
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().regex(/^[0-9]{10,15}$/, 'Enter a valid phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm password'),
    shopName: z.string().optional(),
    gstNumber: z.string().optional(),
    referralCode: z.string().optional(),
    terms: z.boolean().refine((v) => v === true, 'You must accept terms'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
    if (data.role === 'vendor' && !data.shopName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Shop Name is required for vendors',
        path: ['shopName'],
      })
    }
  })

function redirectByRole(role, navigate) {
  if (role === 'vendor') navigate('/vendor/dashboard')
  else if (role === 'admin') navigate('/admin')
  else navigate('/dashboard')
}

function passwordStrength(password = '') {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1
  if (score <= 1) return { label: 'Weak', cls: 'weak' }
  if (score === 2) return { label: 'Medium', cls: 'medium' }
  return { label: 'Strong', cls: 'strong' }
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [params] = useSearchParams()
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'customer',
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      shopName: '',
      gstNumber: '',
      referralCode: '',
      terms: false,
    },
  })

  const role = watch('role')
  const pwd = watch('password')
  const strength = useMemo(() => passwordStrength(pwd), [pwd])

  useEffect(() => {
    const ref = params.get('ref')
    if (ref) setValue('referralCode', ref)
  }, [params, setValue])

  async function onSubmit(values) {
    setApiError('')
    try {
      const result = await registerUser(values)
      setAuth(result.user, result.token)
      redirectByRole(result.user?.role, navigate)
    } catch (error) {
      setApiError(error.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-decor">
        <p className="auth-logo">freefree.in</p>
        <h2 className="auth-tagline">Build your shopping network.</h2>
        <ul className="auth-bullets">
          <li>Create your account in minutes</li>
          <li>Refer and earn from your network</li>
          <li>Sell as a verified vendor</li>
          <li>Track rewards and purchases anytime</li>
        </ul>
      </aside>

      <section className="auth-form-wrap">
        <form className="auth-form-card" onSubmit={handleSubmit(onSubmit)}>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join freefree.in as customer or vendor</p>

          <div className="auth-role-toggle">
            <button
              type="button"
              className={`auth-role-btn${role === 'customer' ? ' active' : ''}`}
              onClick={() => setValue('role', 'customer', { shouldValidate: true })}
            >
              Customer
            </button>
            <button
              type="button"
              className={`auth-role-btn${role === 'vendor' ? ' active' : ''}`}
              onClick={() => setValue('role', 'vendor', { shouldValidate: true })}
            >
              Vendor
            </button>
          </div>

          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <input className="auth-input" {...register('fullName')} />
            {errors.fullName ? <span className="auth-error">{errors.fullName.message}</span> : null}
          </div>

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input className="auth-input" {...register('email')} />
            {errors.email ? <span className="auth-error">{errors.email.message}</span> : null}
          </div>

          <div className="auth-field">
            <label className="auth-label">Phone</label>
            <input className="auth-input" {...register('phone')} />
            {errors.phone ? <span className="auth-error">{errors.phone.message}</span> : null}
          </div>

          {role === 'vendor' ? (
            <>
              <div className="auth-field">
                <label className="auth-label">Shop Name</label>
                <input className="auth-input" {...register('shopName')} />
                {errors.shopName ? <span className="auth-error">{errors.shopName.message}</span> : null}
              </div>
              <div className="auth-field">
                <label className="auth-label">GST Number (optional)</label>
                <input className="auth-input" {...register('gstNumber')} />
              </div>
            </>
          ) : null}

          <div className="auth-field">
            <label className="auth-label">Referral Code (optional)</label>
            <input className="auth-input" {...register('referralCode')} />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input type="password" className="auth-input" {...register('password')} />
            <div className={`auth-strength ${strength.cls}`}>Strength: {strength.label}</div>
            {errors.password ? <span className="auth-error">{errors.password.message}</span> : null}
          </div>

          <div className="auth-field">
            <label className="auth-label">Confirm Password</label>
            <input type="password" className="auth-input" {...register('confirmPassword')} />
            {errors.confirmPassword ? (
              <span className="auth-error">{errors.confirmPassword.message}</span>
            ) : null}
          </div>

          <div className="auth-field">
            <label className="auth-check">
              <input type="checkbox" {...register('terms')} />
              <span>I agree to Terms and Privacy Policy</span>
            </label>
            {errors.terms ? <span className="auth-error">{errors.terms.message}</span> : null}
          </div>

          {apiError ? <p className="auth-form-error">{apiError}</p> : null}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="auth-meta">
            Already have an account? <Link className="auth-link" to="/login">Login</Link>
          </p>
        </form>
      </section>
    </div>
  )
}
