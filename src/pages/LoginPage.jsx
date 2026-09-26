import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import ErrorBanner from '../components/ErrorBanner'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <Card title="Login">
        <ErrorBanner error={error} />
        <form onSubmit={submit}>
          <Input label="Email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          <Input label="Password" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
          <Button disabled={loading} type="submit">{loading ? 'Logging in...' : 'Login'}</Button>
        </form>
        <p className="mt-3 text-sm text-slate-700">
          No account? <Link className="font-semibold text-brand-navy underline" to="/register">Register</Link>
        </p>
      </Card>
    </main>
  )
}
