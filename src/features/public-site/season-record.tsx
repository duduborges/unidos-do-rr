interface SeasonRecordProps {
  played: number
  wins: number
  draws: number
  losses: number
}

export function SeasonRecord({ played, wins, draws, losses }: SeasonRecordProps) {
  const cells = [
    { key: 'played', label: 'PARTIDAS', value: played, tone: '' },
    { key: 'wins', label: 'VITÓRIAS', value: wins, tone: 'win' },
    { key: 'draws', label: 'EMPATES', value: draws, tone: 'draw' },
    { key: 'losses', label: 'DERROTAS', value: losses, tone: 'loss' },
  ]

  return (
    <ul className="season-record" aria-label="Visão geral da temporada">
      {cells.map((cell) => (
        <li key={cell.key} className={cell.tone}>
          <strong>{cell.value}</strong>
          <small>{cell.label}</small>
        </li>
      ))}
    </ul>
  )
}
