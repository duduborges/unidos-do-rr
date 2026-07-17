import Link from 'next/link'
import type { HomeMatch } from './demo-data'

const RESULT_LABEL: Record<HomeMatch['result'], string> = { V: 'vitória', E: 'empate', D: 'derrota' }

export function MatchHistory({ matches }: { matches: HomeMatch[] }) {
  if (!matches.length) {
    return <p className="empty-band">As partidas encerradas aparecerão aqui.</p>
  }

  return (
    <div className="match-list">
      {matches.map((match) => (
        <Link
          key={match.id}
          href={`/jogos/${match.id}`}
          className="match-row"
          aria-label={`Unidos do RR ${match.us} a ${match.them} ${match.opponent}, ${RESULT_LABEL[match.result]}. Ver detalhes.`}
        >
          <time>{match.date}</time>
          <div><strong>UNIDOS DO RR</strong><small>{match.field}</small></div>
          <div className="row-score"><b>{match.us}</b><span>×</span><b>{match.them}</b></div>
          <strong className="opponent-name">{match.opponent}</strong>
          <span className={'result result-' + match.result.toLowerCase()}>{match.result}</span>
        </Link>
      ))}
    </div>
  )
}
