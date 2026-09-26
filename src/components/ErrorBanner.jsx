export default function ErrorBanner({ error }) {
  if (!error) return null

  return <div className="mb-3 rounded-lg bg-status-rejected/10 p-3 text-sm text-status-rejected">{error.message}</div>
}
