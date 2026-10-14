import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, ErrorBanner, Input, Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../layout/AuthLayout'

// Same rules as RegisterRequest on the backend, checked before submitting.
const validate = (form) => {
  const errors = {}
  if (!form.fullName.trim()) errors.fullName = 'Full name is required.'
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.'
  if (!/^\+?[0-9]{9,15}$/.test(form.phone.replace(/\s/g, ''))) errors.phone = 'Enter 9–15 digits, optionally starting with +.'
  if (!/^[0-9]{13}$/.test(form.nationalId.trim())) errors.nationalId = 'SA ID numbers have exactly 13 digits.'
  if (form.password.length < 8) errors.password = 'Use at least 8 characters.'
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.'
  return errors
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', nationalId: '', password: '', confirmPassword: '' })
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const errors = touched ? validate(form) : {}
  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setTouched(true)
    if (Object.keys(validate(form)).length) return

    setLoading(true)
    setError(null)
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\s/g, ''),
        nationalId: form.nationalId.trim(),
        password: form.password,
      })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      footer={
        <>
          Already have an account?{' '}
          <Link className="font-semibold text-brand-navy underline" state={location.state} to="/login">
            Log in
          </Link>
        </>
      }
      subtitle="No credit record needed — your stokvel history becomes your credit history."
      title="Create your account"
    >
      <form className="space-y-4" noValidate onSubmit={submit}>
        <ErrorBanner error={error} />
        <Input autoComplete="name" error={errors.fullName} label="Full name" onChange={update('fullName')} value={form.fullName} />
        <Input autoComplete="email" error={errors.email} label="Email" onChange={update('email')} type="email" value={form.email} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input autoComplete="tel" error={errors.phone} label="Phone" onChange={update('phone')} placeholder="0821234567" type="tel" value={form.phone} />
          <Input error={errors.nationalId} inputMode="numeric" label="SA ID number" maxLength={13} onChange={update('nationalId')} value={form.nationalId} />
        </div>
        <Input autoComplete="new-password" error={errors.password} hint="At least 8 characters." label="Password" onChange={update('password')} type="password" value={form.password} />
        <Input autoComplete="new-password" error={errors.confirmPassword} label="Confirm password" onChange={update('confirmPassword')} type="password" value={form.confirmPassword} />
        <Button block disabled={loading} type="submit">
          {loading ? (
            <>
              <Spinner /> Creating account…
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
