import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HistoricalMatchEditor } from './historical-match-editor'

function createClientSpy() {
  const insert = vi.fn().mockResolvedValue({ error: null })
  const client = { from: vi.fn(() => ({ insert })) }
  return { client, insert }
}

const opponents = [{ id: 'opp-1', name: 'Muito Paia FC' }]
const fields = [{ id: 'field-1', name: 'Arena Rio Vermelho' }]

async function fillResult(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText('Adversário'), 'opp-1')
  await user.selectOptions(screen.getByLabelText('Campo'), 'field-1')
  await user.type(screen.getByLabelText('Data e hora'), '2026-07-05T16:00')
  const unidos = screen.getByLabelText('Gols do Unidos')
  const opponent = screen.getByLabelText('Gols do adversário')
  await user.clear(unidos)
  await user.type(unidos, '3')
  await user.clear(opponent)
  await user.type(opponent, '2')
}

it('registers a finished match with the consolidated score', async () => {
  const user = userEvent.setup()
  const { client, insert } = createClientSpy()
  const onSuccess = vi.fn()
  render(<HistoricalMatchEditor opponents={opponents} fields={fields} onSuccess={onSuccess} client={client as never} />)

  await fillResult(user)
  await user.click(screen.getByRole('button', { name: /salvar resultado/i }))

  expect(client.from).toHaveBeenCalledWith('matches')
  expect(insert).toHaveBeenCalledWith(expect.objectContaining({
    status: 'finished',
    opponent_id: 'opp-1',
    field_id: 'field-1',
    score_unidos: 3,
    score_opponent: 2,
    started_at: expect.any(String),
    ended_at: expect.any(String),
  }))
  expect(onSuccess).toHaveBeenCalled()
})

it('does not require a scorer or assist to save the result', async () => {
  const user = userEvent.setup()
  const { client, insert } = createClientSpy()
  render(<HistoricalMatchEditor opponents={opponents} fields={fields} onSuccess={vi.fn()} client={client as never} />)

  expect(screen.queryByLabelText(/autor/i)).not.toBeInTheDocument()

  await fillResult(user)
  await user.click(screen.getByRole('button', { name: /salvar resultado/i }))

  expect(insert).toHaveBeenCalledWith(expect.not.objectContaining({ scorer_player_id: expect.anything() }))
})
