'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface ImageAdjustModalProps {
  imageSrc: string
  onSave: (file: File) => void
  onCancel: () => void
}

export default function ImageAdjustModal({
  imageSrc,
  onSave,
  onCancel,
}: ImageAdjustModalProps) {
  const [zoom, setZoom] = useState<number>(1)
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const offsetStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)

  // Viewport dimensions for the crop preview (4:5 aspect ratio)
  const VP_WIDTH = 280
  const VP_HEIGHT = 350

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
    }
    img.src = imageSrc
  }, [imageSrc])

  // Compute base dimensions to cover viewport at zoom = 1
  const getBaseDimensions = useCallback(() => {
    if (!naturalSize) return { bw: VP_WIDTH, bh: VP_HEIGHT, s0: 1 }
    const s0 = Math.max(VP_WIDTH / naturalSize.w, VP_HEIGHT / naturalSize.h)
    return {
      bw: naturalSize.w * s0,
      bh: naturalSize.h * s0,
      s0,
    }
  }, [naturalSize])

  // Mouse / Touch handlers for panning
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true)
    dragStart.current = { x: clientX, y: clientY }
    offsetStart.current = { ...offset }
  }

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return
    const dx = clientX - dragStart.current.x
    const dy = clientY - dragStart.current.y
    setOffset({
      x: offsetStart.current.x + dx,
      y: offsetStart.current.y + dy,
    })
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  // Presets
  const handlePresetCenter = () => {
    setOffset({ x: 0, y: 0 })
  }

  const handlePresetTop = () => {
    const { bh } = getBaseDimensions()
    const maxShift = Math.max(0, (bh * zoom - VP_HEIGHT) / 2)
    setOffset({ x: 0, y: maxShift })
  }

  const handleReset = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  // Export cropped high-res canvas
  const handleApply = () => {
    if (!naturalSize) return

    const { s0 } = getBaseDimensions()
    const effectiveScale = s0 * zoom

    // Viewport relative to image top-left
    const { bw, bh } = getBaseDimensions()
    const imgLeft = VP_WIDTH / 2 + offset.x - (bw * zoom) / 2
    const imgTop = VP_HEIGHT / 2 + offset.y - (bh * zoom) / 2

    const cropX_nat = -imgLeft / effectiveScale
    const cropY_nat = -imgTop / effectiveScale
    const cropW_nat = VP_WIDTH / effectiveScale
    const cropH_nat = VP_HEIGHT / effectiveScale

    const outWidth = 800
    const outHeight = 1000

    const canvas = document.createElement('canvas')
    canvas.width = outWidth
    canvas.height = outHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Background fill in case of empty boundary
      ctx.fillStyle = '#111827'
      ctx.fillRect(0, 0, outWidth, outHeight)

      ctx.drawImage(
        img,
        cropX_nat,
        cropY_nat,
        cropW_nat,
        cropH_nat,
        0,
        0,
        outWidth,
        outHeight
      )

      canvas.toBlob(
        (blob) => {
          if (!blob) return
          const file = new File([blob], `team-photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          })
          onSave(file)
        },
        'image/jpeg',
        0.92
      )
    }
    img.src = imageSrc
  }

  const { bw, bh } = getBaseDimensions()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="card-cream w-full max-w-md rounded-2xl shadow-float p-6 space-y-4 border border-[var(--color-dusty-blue)]/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-dusty-blue)]/30 pb-3">
          <div>
            <h3 className="heading-section text-xl text-[var(--color-navy)]">
              Adjust Member Photo
            </h3>
            <p className="text-xs text-[var(--color-navy)] opacity-60">
              Drag photo to reposition, use slider to zoom.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-[var(--color-navy)] opacity-60 hover:opacity-100 p-1 text-sm rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Viewport Frame */}
        <div className="flex flex-col items-center">
          <div
            className="relative overflow-hidden select-none touch-none rounded-xl border-2 border-[var(--color-navy)] bg-black shadow-inner cursor-grab active:cursor-grabbing"
            style={{ width: `${VP_WIDTH}px`, height: `${VP_HEIGHT}px` }}
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={(e) =>
              e.touches[0] &&
              handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)
            }
            onTouchMove={(e) =>
              e.touches[0] &&
              handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)
            }
            onTouchEnd={handlePointerUp}
          >
            {/* The Image */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px)`,
              }}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                draggable={false}
                style={{
                  width: `${bw * zoom}px`,
                  height: `${bh * zoom}px`,
                  maxWidth: 'none',
                  maxHeight: 'none',
                }}
              />
            </div>

            {/* Rule of thirds grid overlay */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-25">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div />
            </div>

            {/* Hint overlay */}
            <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
              <span className="bg-black/70 text-[10px] text-white px-2.5 py-0.5 rounded-full font-medium tracking-wide">
                ✋ Drag to move
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3 pt-2">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--color-navy)] w-12">
              Zoom
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
              className="px-2 py-0.5 rounded bg-[var(--color-dusty-blue)]/30 hover:bg-[var(--color-dusty-blue)]/50 text-xs text-[var(--color-navy)] font-bold"
            >
              −
            </button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-[var(--color-navy)] h-1.5 bg-[var(--color-dusty-blue)]/30 rounded-lg cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
              className="px-2 py-0.5 rounded bg-[var(--color-dusty-blue)]/30 hover:bg-[var(--color-dusty-blue)]/50 text-xs text-[var(--color-navy)] font-bold"
            >
              +
            </button>
            <span className="text-xs font-mono text-[var(--color-navy)] opacity-70 w-10 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[var(--color-navy)] opacity-70 font-medium">
              Quick Align:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePresetTop}
                className="px-2.5 py-1 rounded bg-[var(--color-dusty-blue)]/30 hover:bg-[var(--color-dusty-blue)]/50 text-[var(--color-navy)] text-xs font-medium transition"
              >
                Top / Face
              </button>
              <button
                type="button"
                onClick={handlePresetCenter}
                className="px-2.5 py-1 rounded bg-[var(--color-dusty-blue)]/30 hover:bg-[var(--color-dusty-blue)]/50 text-[var(--color-navy)] text-xs font-medium transition"
              >
                Center
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 rounded bg-[var(--color-dusty-blue)]/20 hover:bg-[var(--color-dusty-blue)]/40 text-[var(--color-navy)] opacity-70 hover:opacity-100 text-xs transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-dusty-blue)]/30">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary !py-2 !px-4 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="btn-primary !py-2 !px-5 text-xs"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  )
}
