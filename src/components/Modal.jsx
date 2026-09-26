export default function Modal({ open, title, children, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/40 p-4 md:items-center md:justify-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-4" onClick={(event) => event.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brand-navy">{title}</h3>
          <button className="min-h-11 min-w-11 text-2xl leading-none" onClick={onClose} type="button">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
