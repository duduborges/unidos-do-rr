'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  if (typeof window.matchMedia !== 'function') return () => {}
  const query = window.matchMedia(REDUCED_MOTION_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false,
    () => false,
  )
}

interface Kit {
  src: string
  label: string
  palette: string
}

const KITS: Kit[] = [
  { src: '/kits/jogador-home.png', label: 'JOGADOR · HOME', palette: 'Azul-marinho, vermelho e branco' },
  { src: '/kits/jogador-away.png', label: 'JOGADOR · AWAY', palette: 'Branco, azul-marinho e vermelho' },
  { src: '/kits/goleiro-home.png', label: 'GOLEIRO · HOME', palette: 'Amarelo, azul-marinho e vermelho' },
  { src: '/kits/goleiro-away.png', label: 'GOLEIRO · AWAY', palette: 'Roxo, vermelho e branco' },
]

export function KitCarousel() {
  const reduceMotion = usePrefersReducedMotion()
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: 4200, stopOnInteraction: false })],
  )
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect).on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect).off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    const autoplay = emblaApi?.plugins()?.autoplay
    if (!autoplay) return
    if (reduceMotion) autoplay.stop()
    else autoplay.play()
  }, [emblaApi, reduceMotion])

  const scrollTo = useCallback((index: number) => {
    setSelectedIndex(index)
    emblaApi?.scrollTo(index)
  }, [emblaApi])

  const scrollPrev = useCallback(() => {
    const target = (selectedIndex - 1 + KITS.length) % KITS.length
    setSelectedIndex(target)
    emblaApi?.scrollPrev()
  }, [emblaApi, selectedIndex])

  const scrollNext = useCallback(() => {
    const target = (selectedIndex + 1) % KITS.length
    setSelectedIndex(target)
    emblaApi?.scrollNext()
  }, [emblaApi, selectedIndex])

  const activeKit = KITS[selectedIndex]

  return (
    <div className="kit-carousel">
      <div
        className="kit-viewport"
        data-testid="kit-carousel-viewport"
        data-autoplay={reduceMotion ? 'false' : 'true'}
        ref={emblaRef}
      >
        <div className="kit-track">
          {KITS.map((kit, index) => (
            <div
              key={kit.src}
              className="kit-slide"
              role="group"
              aria-label={`Uniforme ${kit.label.toLowerCase()}`}
              data-active={index === selectedIndex}
            >
              <Image src={kit.src} alt={`Uniforme ${kit.label}`} width={1448} height={1086} sizes="(max-width: 800px) 80vw, 520px" />
            </div>
          ))}
        </div>
      </div>

      <div className="kit-controls">
        <button type="button" className="kit-arrow" onClick={scrollPrev} aria-label="Uniforme anterior"><ChevronLeft /></button>
        <div className="kit-active" role="status" aria-live="polite">
          <strong>{activeKit.label}</strong>
          <small>{activeKit.palette}</small>
        </div>
        <button type="button" className="kit-arrow" onClick={scrollNext} aria-label="Próximo uniforme"><ChevronRight /></button>
      </div>

      <div className="kit-dots" role="tablist" aria-label="Uniformes">
        {KITS.map((kit, index) => (
          <button
            key={kit.src}
            type="button"
            role="tab"
            aria-selected={index === selectedIndex}
            aria-label={kit.label}
            className={index === selectedIndex ? 'active' : ''}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  )
}
