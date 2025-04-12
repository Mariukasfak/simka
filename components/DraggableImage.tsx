import { useState, useEffect, useRef } from 'react'
import Draggable from 'react-draggable'
import { DesignPosition } from '@/lib/types'

interface DraggableImageProps {
  imageUrl: string
  position: DesignPosition
  scale: number
  opacity: number
  onPositionChange: (position: DesignPosition) => void
  containerRef: React.RefObject<HTMLDivElement>
}

export default function DraggableImage({
  imageUrl,
  position,
  scale,
  opacity,
  onPositionChange,
  containerRef
}: DraggableImageProps) {
  const [bounds, setBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 })
  const imageRef = useRef<HTMLImageElement>(null)
  const nodeRef = useRef<HTMLDivElement>(null)

  // Update bounds when image or container size changes
  useEffect(() => {
    const updateBounds = () => {
      if (containerRef.current && imageRef.current) {
        const container = containerRef.current.getBoundingClientRect()
        const image = imageRef.current.getBoundingClientRect()
        
        // Calculate scaled dimensions
        const scaledWidth = image.width * scale
        const scaledHeight = image.height * scale
        
        // Set bounds to keep the image within the container
        setBounds({
          left: -scaledWidth / 2,
          top: -scaledHeight / 2,
          right: container.width - scaledWidth / 2,
          bottom: container.height - scaledHeight / 2
        })
      }
    }

    // Initial bounds calculation
    updateBounds()

    // Update bounds on window resize and scale change
    window.addEventListener('resize', updateBounds)
    return () => window.removeEventListener('resize', updateBounds)
  }, [scale, containerRef])

  // Handle drag events
  const handleDrag = (_e: any, data: { x: number; y: number }) => {
    const newPosition = {
      x: Math.max(bounds.left, Math.min(bounds.right, data.x)),
      y: Math.max(bounds.top, Math.min(bounds.bottom, data.y))
    }
    onPositionChange(newPosition)
  }

  // Handle keyboard events for fine-tuning position
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!nodeRef.current || !document.activeElement?.contains(nodeRef.current)) return

      const step = e.shiftKey ? 10 : 1
      let newPosition = { ...position }

      switch (e.key) {
        case 'ArrowLeft':
          newPosition.x -= step
          break
        case 'ArrowRight':
          newPosition.x += step
          break
        case 'ArrowUp':
          newPosition.y -= step
          break
        case 'ArrowDown':
          newPosition.y += step
          break
        case 'r':
          newPosition = { x: 0, y: 0 }
          break
        default:
          return
      }

      // Ensure new position is within bounds
      newPosition.x = Math.max(bounds.left, Math.min(bounds.right, newPosition.x))
      newPosition.y = Math.max(bounds.top, Math.min(bounds.bottom, newPosition.y))
      
      onPositionChange(newPosition)
      e.preventDefault()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [position, bounds, onPositionChange])

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onDrag={handleDrag}
      bounds={bounds}
      onStart={() => nodeRef.current?.focus()}
    >
      <div
        ref={nodeRef}
        className="absolute cursor-move touch-none"
        style={{
          transform: `scale(${scale})`,
          opacity: opacity,
          transformOrigin: 'center',
          transition: 'transform 0.1s, opacity 0.1s'
        }}
        tabIndex={0}
        role="button"
        aria-label="Dizaino elementas"
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
    </Draggable>
  )
}