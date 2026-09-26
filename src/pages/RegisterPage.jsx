import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import ErrorBanner from '../components/ErrorBanner'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register({ fullName, email, password })
      navigate('/')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <Card title="Register">
        <ErrorBanner error={error} />
        <form onSubmit={submit}>
          <Input label="Full name" onChange={(event) => setFullName(event.target.value)} value={fullName} />
          <Input label="Email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          <Input label="Password" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
          <Button disabled={loading} type="submit">{loading ? 'Creating account...' : 'Register'}</Button>
        </form>
        <p className="mt-3 text-sm text-slate-700">
          Already have an account? <Link className="font-semibold text-brand-navy underline" to="/login">Login</Link>
        </p>
      </Card>
    </main>
  )
}
