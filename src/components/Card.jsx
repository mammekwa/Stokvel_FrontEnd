export default function Card({ title, right, children, className = '' }) {
  return (
    <section className={`rounded-xl bg-white p-4 shadow-sm ${className}`}>
      {(title || right) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          {title ? <h2 className="text-lg font-semibold text-brand-navy">{title}</h2> : <div />}
          {right}
        </div>
      )}
      {children}
    </section>
  )
}
