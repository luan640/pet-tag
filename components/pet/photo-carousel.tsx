'use client'

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PetPhoto } from '@/lib/types'
import { cn } from '@/lib/utils'

const AUTOPLAY_INTERVAL_MS = 4000

export function PhotoCarousel({ photos, petName }: { photos: PetPhoto[]; petName: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{ startX: number; startScrollLeft: number; pointerId: number } | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      const el = containerRef.current
      if (!el) return
      const count = photos.length
      const looped = ((index % count) + count) % count
      el.scrollTo({ left: looped * el.clientWidth, behavior: 'smooth' })
      setActiveIndex(looped)
    },
    [photos.length]
  )

  useEffect(() => {
    if (photos.length < 2 || isDragging || isHovering) return
    const id = window.setInterval(() => goTo(activeIndex + 1), AUTOPLAY_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [activeIndex, isDragging, isHovering, photos.length, goTo])

  const handleScroll = () => {
    const el = containerRef.current
    if (!el || el.clientWidth === 0 || dragState.current) return
    setActiveIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el || e.pointerType === 'touch') return
    setIsDragging(true)
    dragState.current = { startX: e.clientX, startScrollLeft: el.scrollLeft, pointerId: e.pointerId }
    el.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el || !dragState.current) return
    el.scrollLeft = dragState.current.startScrollLeft - (e.clientX - dragState.current.startX)
  }

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el || !dragState.current) return
    if (el.hasPointerCapture(dragState.current.pointerId)) {
      el.releasePointerCapture(dragState.current.pointerId)
    }
    dragState.current = null
    setIsDragging(false)
    goTo(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto cursor-grab active:cursor-grabbing"
      >
        {photos.map((photo, index) => (
          <div key={photo.id} className="aspect-[4/5] w-full shrink-0 snap-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={`${petName}${photo.is_with_owner ? ' com o tutor' : ''}`}
              className="h-full w-full select-none object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={() => goTo(activeIndex - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/40 p-1.5 text-white backdrop-blur-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={() => goTo(activeIndex + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/40 p-1.5 text-white backdrop-blur-sm"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                aria-label={`Ir para foto ${index + 1}`}
                onClick={() => goTo(index)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  index === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
