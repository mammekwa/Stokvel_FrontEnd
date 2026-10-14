// Shared UI building blocks. One set of components and one error format across
// every screen (NFR-01).
import { useId } from 'react'
import { Link } from 'react-router-dom'

const buttonStyles = {
  primary: 'bg-brand-navy text-white hover:bg-brand-navy/90',
  secondary: 'bg-white text-brand-navy border border-brand-navy/30 hover:bg-slate-50',
  accent: 'bg-brand-gold text-brand-navy hover:bg-brand-gold/90',
  danger: 'bg-status-rejected text-white hover:bg-status-rejected/90',
  ghost: 'text-brand-navy hover:bg-brand-navy/5',
}

const buttonClass = (variant, block, className) =>
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
    block ? 'w-full' : ''
  } ${buttonStyles[variant]} ${className}`

export function Button({ children, variant = 'primary', block = false, className = '', type = 'button', ...props }) {
  return (
    <button className={buttonClass(variant, block, className)} type={type} {...props}>
      {children}
    </button>
  )
}

// A router link styled as a button (avoids nesting <button> inside <a>).
export function LinkButton({ children, variant = 'primary', block = false, className = '', ...props }) {
  return (
    <Link className={buttonClass(variant, block, className)} {...props}>
      {children}
    </Link>
  )
}

export function Card({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-base font-semibold text-brand-navy">{title}</h2> : null}
            {subtitle ? <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  )
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-navy">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

const fieldClass = (error) =>
  `mt-1.5 min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-base text-brand-text outline-none transition focus:border-brand-navy focus:ring-2 focus:ring-brand-gold/40 ${
    error ? 'border-status-rejected' : 'border-slate-300'
  }`

// Label, control, then hint/error linked via aria-describedby so screen readers
// announce the label cleanly and the hint/error as a description.
function Field({ label, hint, error, children }) {
  const id = useId()
  const messageId = `${id}-msg`
  const message = error || hint
  return (
    <div>
      {label ? (
        <label className="block text-sm font-medium text-brand-navy" htmlFor={id}>
          {label}
        </label>
      ) : null}
      {children({ id, 'aria-describedby': message ? messageId : undefined, 'aria-invalid': error ? true : undefined })}
      {message ? (
        <p className={`mt-1 text-xs ${error ? 'text-status-rejected' : 'text-slate-500'}`} id={messageId}>
          {message}
        </p>
      ) : null}
    </div>
  )
}

export function Input({ label, hint, error, className = '', ...props }) {
  return (
    <Field error={error} hint={hint} label={label}>
      {(a11y) => <input className={`${fieldClass(error)} ${className}`} {...a11y} {...props} />}
    </Field>
  )
}

export function Select({ label, hint, error, options, className = '', ...props }) {
  return (
    <Field error={error} hint={hint} label={label}>
      {(a11y) => (
        <select className={`${fieldClass(error)} ${className}`} {...a11y} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
}

export function Textarea({ label, hint, error, className = '', ...props }) {
  return (
    <Field error={error} hint={hint} label={label}>
      {(a11y) => <textarea className={`${fieldClass(error)} min-h-24 ${className}`} {...a11y} {...props} />}
    </Field>
  )
}

export function ErrorBanner({ error, className = '' }) {
  if (!error) return null
  return (
    <div className={`rounded-lg border border-status-rejected/30 bg-status-rejected/5 p-3 text-sm text-status-rejected ${className}`} role="alert">
      <p className="font-medium">{error.message}</p>
      {error.details?.length ? (
        <ul className="mt-1 list-disc pl-5">
          {error.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

const noticeTones = {
  info: 'border-brand-navy/15 bg-brand-navy/5 text-brand-navy',
  success: 'border-status-confirmed/30 bg-status-confirmed/10 text-status-confirmed',
  warning: 'border-status-pending/30 bg-status-pending/10 text-[#7a5a17]',
}

export function Notice({ tone = 'info', title, children, className = '' }) {
  return (
    <div className={`rounded-lg border p-3 text-sm ${noticeTones[tone]} ${className}`}>
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className={title ? 'mt-0.5' : ''}>{children}</div> : null}
    </div>
  )
}

// Status -> tone. Covers contribution, member, loan and recommendation values.
const STATUS_TONES = {
  CONFIRMED: 'good',
  ACTIVE: 'good',
  APPROVED: 'good',
  APPROVE: 'good',
  REPAID: 'good',
  POSITIVE: 'good',
  PENDING: 'warn',
  UNCONFIRMED: 'warn',
  APPROVED_PENDING_DISBURSEMENT: 'warn',
  REJECTED: 'bad',
  DECLINE: 'bad',
  DEFAULTED: 'bad',
  NEGATIVE: 'bad',
  RESTRICTED: 'bad',
  LEFT: 'neutral',
  ADMIN: 'navy',
}

const TONE_CLASSES = {
  good: 'bg-status-confirmed/15 text-status-confirmed',
  warn: 'bg-status-pending/15 text-[#7a5a17]',
  bad: 'bg-status-rejected/15 text-status-rejected',
  neutral: 'bg-slate-100 text-slate-600',
  navy: 'bg-brand-navy text-white',
}

const STATUS_LABELS = {
  APPROVED_PENDING_DISBURSEMENT: 'Awaiting disbursement',
  APPROVE: 'Model: approve',
  DECLINE: 'Model: decline',
}

export function StatusBadge({ status, label }) {
  const key = String(status || '').toUpperCase()
  const text = label || STATUS_LABELS[key] || key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' ')
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASSES[STATUS_TONES[key] || 'neutral']}`}>
      {text}
    </span>
  )
}

export function Spinner({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
    />
  )
}

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-2 py-6 text-sm text-slate-600">
      <Spinner />
      {label}
    </div>
  )
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center">
      <p className="font-medium text-brand-navy">{title}</p>
      {children ? <div className="mx-auto mt-1 max-w-md text-sm text-slate-600">{children}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function Modal({ open, title, onClose, children, wide = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose} role="presentation">
      <div
        aria-modal="true"
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-brand-navy">{title}</h3>
          <button aria-label="Close" className="-mr-2 -mt-1 min-h-11 min-w-11 rounded-lg text-2xl leading-none text-slate-500 hover:bg-slate-100" onClick={onClose} type="button">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Stat({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-brand-navy">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}
