import { render, screen } from '@testing-library/react'
import { SeasonRecord } from './season-record'

it('renders four aligned cells with a label and a single value each', () => {
  render(<SeasonRecord played={8} wins={2} draws={0} losses={6} />)

  const cells = screen.getAllByRole('listitem')
  expect(cells).toHaveLength(4)

  for (const label of ['PARTIDAS', 'VITÓRIAS', 'EMPATES', 'DERROTAS']) {
    expect(screen.getByText(label)).toBeInTheDocument()
  }

  for (const value of ['8', '2', '0', '6']) {
    expect(screen.getAllByText(value)).toHaveLength(1)
  }
})
