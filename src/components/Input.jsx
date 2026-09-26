export default function Input({ label, error, hint, className = '', ...props }) {
  return (
    <label className="mb-4 block text-sm font-medium text-brand-navy">
      {label}
      <input
        className={`mt-2 min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-base text-brand-text outline-none ring-brand-gold focus:ring-2 ${
          error ? 'border-status-rejected' : 'border-slate-300'
        } ${className}`}
        {...props}
      />
      {hint ? <p className="mt-1 text-xs text-slate-600">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-status-rejected">{error}</p> : null}
    </label>
  )
}
