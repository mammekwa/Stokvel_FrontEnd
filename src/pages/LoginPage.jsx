import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, ErrorBanner, Input, Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../layout/AuthLayout'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login({ email: form.email.trim(), password: form.password })
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
          New to StokvelChain?{' '}
          <Link className="font-semibold text-brand-navy underline" state={location.state} to="/register">
            Create an account
          </Link>
        </>
      }
      subtitle="Log in to manage your stokvel."
      title="Welcome back"
    >
      <form className="space-y-4" onSubmit={submit}>
        <ErrorBanner error={error} />
        <Input autoComplete="email" label="Email" onChange={update('email')} required type="email" value={form.email} />
        <Input autoComplete="current-password" label="Password" onChange={update('password')} required type="password" value={form.password} />
        <Button block disabled={loading} type="submit">
          {loading ? (
            <>
              <Spinner /> Logging in…
            </>
          ) : (
            'Log in'
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
