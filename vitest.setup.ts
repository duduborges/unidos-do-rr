import '@testing-library/jest-dom/vitest'

class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

for (const name of ['IntersectionObserver', 'ResizeObserver'] as const) {
  if (!(name in globalThis)) {
    Object.defineProperty(globalThis, name, { writable: true, configurable: true, value: ObserverStub })
  }
}

if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }) as MediaQueryList
}
