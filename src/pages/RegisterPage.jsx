import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAvailableGroups } from '../api/groups'
import Button from '../components/Button'
import Card from '../components/Card'
import ErrorBanner from '../components/ErrorBanner'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+?\d{10,15}$/
const NATIONAL_ID_REGEX = /^\d{13}$/

const validateRegistration = ({ fullName, email, phone, password, nationalId, groupId }) => {
  const errors = {}

  if (!fullName) errors.fullName = 'Full name is required.'
  if (!email) errors.email = 'Email is required.'
  else if (!EMAIL_REGEX.test(email)) errors.email = 'Enter a valid email address.'
  if (!phone) errors.phone = 'Phone is required.'
  else if (!PHONE_REGEX.test(phone)) errors.phone = 'Enter a valid phone number.'
  if (!password) errors.password = 'Password is required.'
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (!nationalId) errors.nationalId = 'National ID is required.'
  else if (!NATIONAL_ID_REGEX.test(nationalId)) errors.nationalId = 'National ID must be exactly 13 digits.'
  if (!groupId) errors.groupId = 'Group ID is required.'

  return errors
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    nationalId: '',
    groupId: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [groupOptions, setGroupOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true)
      try {
        const groups = await getAvailableGroups()
        setGroupOptions(groups)
      } catch {
        setGroupOptions([])
      } finally {
        setLoadingGroups(false)
      }
    }

    fetchGroups()
  }, [])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const submit = async (event) => {
    event.preventDefault()
    setError(null)

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      nationalId: form.nationalId.trim(),
      groupId: form.groupId.trim(),
    }

    const validationErrors = validateRegistration(payload)
    setFieldErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setLoading(true)
    try {
      await register(payload)
      navigate('/')
    } catch (err) {
      if (err?.field) {
        setFieldErrors((current) => ({ ...current, [err.field]: err.message }))
      }
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
          <Input
            error={fieldErrors.fullName}
            label="Full name"
            onChange={(event) => updateField('fullName', event.target.value)}
            required
            value={form.fullName}
          />
          <Input
            error={fieldErrors.email}
            label="Email"
            onChange={(event) => updateField('email', event.target.value)}
            required
            type="email"
            value={form.email}
          />
          <Input
            error={fieldErrors.phone}
            hint="Use 10-15 digits, optionally starting with +."
            label="Phone"
            onChange={(event) => updateField('phone', event.target.value)}
            pattern="^\+?\d{10,15}$"
            required
            value={form.phone}
          />
          <Input
            error={fieldErrors.password}
            label="Password"
            minLength={8}
            onChange={(event) => updateField('password', event.target.value)}
            required
            type="password"
            value={form.password}
          />
          <Input
            error={fieldErrors.nationalId}
            hint="Enter the 13-digit national ID."
            label="National ID"
            onChange={(event) => updateField('nationalId', event.target.value)}
            pattern="^\d{13}$"
            required
            value={form.nationalId}
          />
          <Input
            error={fieldErrors.groupId}
            hint={loadingGroups ? 'Loading available groups...' : 'Select from suggestions or enter a valid existing Group ID.'}
            label="Group ID"
            list="available-group-ids"
            onChange={(event) => updateField('groupId', event.target.value)}
            required
            value={form.groupId}
          />
          <datalist id="available-group-ids">
            {groupOptions.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </datalist>
          <Button disabled={loading} type="submit">{loading ? 'Creating account...' : 'Register'}</Button>
        </form>
        <p className="mt-3 text-sm text-slate-700">
          Already have an account? <Link className="font-semibold text-brand-navy underline" to="/login">Login</Link>
        </p>
      </Card>
    </main>
  )
}
