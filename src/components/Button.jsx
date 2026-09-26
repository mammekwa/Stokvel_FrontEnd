export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-brand-navy text-white hover:opacity-95',
    secondary: 'bg-white text-brand-navy border border-brand-navy hover:bg-slate-50',
    accent: 'bg-brand-gold text-brand-navy hover:opacity-95',
    danger: 'bg-status-rejected text-white hover:opacity-95',
  }

  return (
    <button
      className={`min-h-11 w-full rounded-lg px-4 py-3 text-base font-semibold transition disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
