import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, vi } from 'vitest'
import { KitCarousel } from './kit-carousel'

function mockReducedMotion(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

beforeEach(() => mockReducedMotion(false))
afterEach(() => vi.restoreAllMocks())

it('renders the four kits with the first one active', () => {
  render(<KitCarousel />)
  expect(screen.getAllByRole('group', { name: /uniforme/i })).toHaveLength(4)
  expect(screen.getByRole('status')).toHaveTextContent(/jogador · home/i)
})

it('exposes accessible controls and indicators', () => {
  render(<KitCarousel />)
  expect(screen.getByRole('button', { name: /uniforme anterior/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /próximo uniforme/i })).toBeInTheDocument()
  const dots = screen.getByRole('tablist', { name: /uniformes/i })
  expect(within(dots).getAllByRole('tab')).toHaveLength(4)
})

it('updates the active kit after clicking next', async () => {
  const user = userEvent.setup()
  render(<KitCarousel />)
  await user.click(screen.getByRole('button', { name: /próximo uniforme/i }))
  expect(screen.getByRole('status')).toHaveTextContent(/jogador · away/i)
})

it('disables autoplay when the user prefers reduced motion', () => {
  mockReducedMotion(true)
  render(<KitCarousel />)
  expect(screen.getByTestId('kit-carousel-viewport')).toHaveAttribute('data-autoplay', 'false')
})
