export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bg px-4 py-10">
      <div className="mb-6 flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-navy text-lg font-black text-brand-gold">S</span>
        <span className="text-2xl font-bold text-brand-navy">StokvelChain</span>
      </div>
      <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold text-brand-navy">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
      {footer ? <div className="mt-4 text-sm text-slate-600">{footer}</div> : null}
      <p className="mt-8 max-w-md text-center text-xs text-slate-500">
        Every contribution, payout and loan is recorded on the Ethereum Sepolia test network for transparent, tamper-evident records.
      </p>
    </div>
  )
}
