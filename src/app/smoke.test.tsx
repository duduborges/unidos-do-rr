import { render, screen } from '@testing-library/react'
import Home from './(site)/page'

vi.mock('@/features/public-site/queries', () => ({
  getHomeData: vi.fn().mockResolvedValue(null),
}))

it('renders the club identity', async () => {
  render(await Home())
  expect(screen.getByRole('heading', { name: /unidos do rr/i })).toBeInTheDocument()
})
