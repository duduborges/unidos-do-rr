export default function Loading() {
  return (
    <div className="detail-shell">
      <div className="detail-skeleton" aria-hidden="true">
        <div className="detail-skeleton-bar" />
        <div className="detail-skeleton-hero" />
        <div className="detail-skeleton-block" />
        <div className="detail-skeleton-block" />
      </div>
      <span className="sr-only" role="status">Carregando partida…</span>
    </div>
  )
}
