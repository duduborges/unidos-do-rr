import { render, screen } from '@testing-library/react'
import Home from './(site)/page'

vi.mock('@/features/public-site/queries', () => ({
  getHomeData: vi.fn().mockRejectedValue(new Error('offline')),
}))

it('renders the club identity', async () => {
  render(await Home())
  expect(screen.getByRole('link', { name: /unidos do rr - inicio/i })).toBeInTheDocument()
})
