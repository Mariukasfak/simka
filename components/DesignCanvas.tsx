'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { debounce } from 'lodash'
import html2canvas from 'html2canvas'
import { RefreshCw } from 'lucide-react'
import { Button } from './ui/Button'

interface DesignCanvasProps {
  productImage: string
  uploadedImage: string | null
  scale: number
  opacity: number
  onPreviewGenerated: (preview: string | null) => void
}

export default function DesignCanvas({
  productImage,
  uploadedImage,
  scale,
  opacity,
  onPreviewGenerated
}: DesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset position
  const handleReset = useCallback(() => {
    setPosition({ x: 0, y: 0 })
    setRotation(0)
  }, [])

  // Handle start dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  // Manage drag listeners
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const movementX = e.movementX
      const movementY = e.movementY

      setPosition(prev => ({
        x: prev.x + movementX,
        y: prev.y + movementY
      }))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // Touch handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length !== 1) return
    
    const touch = e.touches[0]
    const startX = touch.clientX
    const startY = touch.clientY
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      
      const touch = e.touches[0]
      const diffX = touch.clientX - startX
      const diffY = touch.clientY - startY
      
      setPosition(prev => ({
        x: prev.x + diffX,
        y: prev.y + diffY
      }))
    }
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
  }, [])

  // Generate preview when design elements change
  const generatePreview = useCallback(
    debounce(async () => {
      if (!canvasRef.current || !uploadedImage) {
        onPreviewGenerated(null)
        return
      }

      try {
        setIsGenerating(true)
        setError(null)
        
        const canvas = await html2canvas(canvasRef.current, {
          backgroundColor: null,
          scale: 1,
          logging: false,
          useCORS: true,
          allowTaint: true
        })
        
        const preview = canvas.toDataURL('image/jpeg', 0.85)
        onPreviewGenerated(preview)
      } catch (error) {
        console.error('Error generating preview:', error)
        setError('Nepavyko sugeneruoti peržiūros')
        onPreviewGenerated(null)
      } finally {
        setIsGenerating(false)
      }
    }, 500),
    [uploadedImage, onPreviewGenerated]
  )

  // Trigger preview generation
  useEffect(() => {
    generatePreview()
    return generatePreview.cancel
  }, [productImage, uploadedImage, scale, opacity, position, rotation, generatePreview])

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          icon={RefreshCw}
        >
          Atstatyti
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGrid(!showGrid)}
        >
          {showGrid ? 'Slėpti tinklelį' : 'Rodyti tinklelį'}
        </Button>
      </div>

      <div 
        ref={canvasRef} 
        className="relative w-full aspect-square bg-white rounded-lg shadow-md overflow-hidden"
      >
        {showGrid && (
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 opacity-50"
              />
            ))}
          </div>
        )}
        
        <img
          src={productImage}
          alt="Produkto vaizdas"
          className="w-full h-full object-contain"
        />
        
        {uploadedImage && (
          <div
            className="absolute top-1/2 left-1/2 cursor-move"
            style={{
              transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              opacity: opacity,
              transition: isDragging ? 'none' : 'transform 0.1s, opacity 0.1s'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <img
              src={uploadedImage}
              alt="Įkeltas dizainas"
              className="max-w-[200px] max-h-[200px] pointer-events-none select-none"
              draggable={false}
            />
          </div>
        )}
        
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
          </div>
        )}
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>X: {Math.round(position.x)}</span>
        <span>Y: {Math.round(position.y)}</span>
        <span>Pasukimas: {Math.round(rotation)}°</span>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="text-sm text-gray-500 text-center">
        <p>Tempkite pele, kad pakeistumėte logotipo poziciją</p>
      </div>
    </div>
  )
}