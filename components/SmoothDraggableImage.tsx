import { useState, useEffect, useRef, useCallback } from 'react'
import type { DesignPosition } from '@/lib/types'

interface SmoothDraggableImageProps {
  imageUrl: string
  position: DesignPosition
  scale: number
  opacity: number
  onPositionChange: (position: DesignPosition) => void
  containerRef: React.RefObject<HTMLDivElement>
}

export default function SmoothDraggableImage({
  imageUrl,
  position,
  scale,
  opacity,
  onPositionChange,
  containerRef
}: SmoothDraggableImageProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [bounds, setBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 })
  
  // Refs for smooth dragging
  const dragStartRef = useRef({ x: 0, y: 0 })
  const currentPositionRef = useRef(position)
  const rafRef = useRef<number>()
  const lastUpdateRef = useRef<number>(0)
  const throttleTime = 16 // ~60fps

  // Update bounds when container or image size changes
  useEffect(() => {
    const updateBounds = () => {
      if (!containerRef.current || !imageRef.current) return
      
      const container = containerRef.current.getBoundingClientRect()
      const image = imageRef.current.getBoundingClientRect()
      
      const scaledWidth = image.width * scale
      const scaledHeight = image.height * scale
      
      setBounds({
        left: -scaledWidth / 2,
        top: -scaledHeight / 2,
        right: container.width - scaledWidth / 2,
        bottom: container.height - scaledHeight / 2
      })
    }

    updateBounds()
    window.addEventListener('resize', updateBounds)
    return () => window.removeEventListener('resize', updateBounds)
  }, [scale, containerRef])

  // Smooth animation frame update
  const updatePosition = useCallback((x: number, y: number) => {
    if (!elementRef.current) return
    
    // Apply bounds
    const boundedX = Math.max(bounds.left, Math.min(bounds.right, x))
    const boundedY = Math.max(bounds.top, Math.min(bounds.bottom, y))
    
    // Update element position directly for smooth movement
    elementRef.current.style.transform = `
      translate(-50%, -50%) 
      translate3d(${boundedX}px, ${boundedY}px, 0) 
      scale(${scale})
    `
    
    // Store current position
    currentPositionRef.current = { x: boundedX, y: boundedY }
    
    // Throttle updates to parent
    const now = performance.now()
    if (now - lastUpdateRef.current >= throttleTime) {
      onPositionChange({ x: boundedX, y: boundedY })
      lastUpdateRef.current = now
    }
  }, [bounds, scale, onPositionChange])

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    
    // Store initial position
    dragStartRef.current = {
      x: e.clientX - currentPositionRef.current.x,
      y: e.clientY - currentPositionRef.current.y
    }
    
    // Optimize for dragging
    if (elementRef.current) {
      elementRef.current.style.transition = 'none'
      elementRef.current.style.cursor = 'grabbing'
      elementRef.current.style.willChange = 'transform'
    }
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    // Calculate new position
    const x = e.clientX - dragStartRef.current.x
    const y = e.clientY - dragStartRef.current.y
    
    // Use requestAnimationFrame for smooth updates
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    
    rafRef.current = requestAnimationFrame(() => {
      updatePosition(x, y)
    })
  }, [isDragging, updatePosition])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    
    // Cleanup
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    
    if (elementRef.current) {
      elementRef.current.style.transition = 'transform 0.2s'
      elementRef.current.style.cursor = 'grab'
      elementRef.current.style.willChange = 'auto'
    }
    
    // Final position update
    onPositionChange(currentPositionRef.current)
  }, [onPositionChange])

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length !== 1) return
    
    setIsDragging(true)
    
    const touch = e.touches[0]
    dragStartRef.current = {
      x: touch.clientX - currentPositionRef.current.x,
      y: touch.clientY - currentPositionRef.current.y
    }
    
    if (elementRef.current) {
      elementRef.current.style.transition = 'none'
      elementRef.current.style.willChange = 'transform'
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    e.preventDefault()
    
    const touch = e.touches[0]
    const x = touch.clientX - dragStartRef.current.x
    const y = touch.clientY - dragStartRef.current.y
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    
    rafRef.current = requestAnimationFrame(() => {
      updatePosition(x, y)
    })
  }, [isDragging, updatePosition])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    
    if (elementRef.current) {
      elementRef.current.style.transition = 'transform 0.2s'
      elementRef.current.style.willChange = 'auto'
    }
    
    onPositionChange(currentPositionRef.current)
  }, [onPositionChange])

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // Sync with external position changes
  useEffect(() => {
    if (!isDragging) {
      currentPositionRef.current = position
      if (elementRef.current) {
        elementRef.current.style.transform = `
          translate(-50%, -50%) 
          translate3d(${position.x}px, ${position.y}px, 0) 
          scale(${scale})
        `
      }
    }
  }, [position, scale, isDragging])

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-grab ${isDragging ? 'cursor-grabbing z-10' : ''}`}
      style={{
        transform: `translate(-50%, -50%) translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
        opacity,
        transformOrigin: 'center',
        transition: isDragging ? 'none' : 'transform 0.2s',
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Dizaino elementas"
        className="max-w-[200px] max-h-[200px] pointer-events-none select-none"
        draggable={false}
        onLoad={() => {
          if (imageRef.current) {
            const event = new Event('resize')
            window.dispatchEvent(event)
          }
        }}
      />
    </div>
  )
}