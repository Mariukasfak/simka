'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import html2canvas from 'html2canvas'
import { useHotkeys } from 'react-hotkeys-hook'
import { RotateCw, ZoomIn, ZoomOut, Move } from 'lucide-react'
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
  const designRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [productImageLoaded, setProductImageLoaded] = useState(false)
  const [uploadedImageLoaded, setUploadedImageLoaded] = useState(false)
  const [showGrid, setShowGrid] = useState(false)

  // Reset position with 'r' key
  useHotkeys('r', () => {
    setPosition({ x: 0, y: 0 })
    setRotation(0)
  })

  // Rotation with '[' and ']' keys
  useHotkeys('[', () => setRotation(prev => prev - 5))
  useHotkeys(']', () => setRotation(prev => prev + 5))

  // Arrow key movement
  useHotkeys('up', (e) => {
    e.preventDefault()
    setPosition(prev => ({ ...prev, y: prev.y - (e.shiftKey ? 10 : 1) }))
  })
  useHotkeys('down', (e) => {
    e.preventDefault()
    setPosition(prev => ({ ...prev, y: prev.y + (e.shiftKey ? 10 : 1) }))
  })
  useHotkeys('left', (e) => {
    e.preventDefault()
    setPosition(prev => ({ ...prev, x: prev.x - (e.shiftKey ? 10 : 1) }))
  })
  useHotkeys('right', (e) => {
    e.preventDefault()
    setPosition(prev => ({ ...prev, x: prev.x + (e.shiftKey ? 10 : 1) }))
  })

  // Generate preview when design changes
  useEffect(() => {
    const generatePreview = async () => {
      if (!canvasRef.current || !uploadedImage || !productImageLoaded || (uploadedImage && !uploadedImageLoaded)) {
        onPreviewGenerated(null)
        return
      }

      try {
        const canvas = await html2canvas(canvasRef.current, {
          backgroundColor: null,
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true
        })
        
        const preview = canvas.toDataURL('image/png')
        onPreviewGenerated(preview)
      } catch (error) {
        console.error('Error generating preview:', error)
        onPreviewGenerated(null)
      }
    }

    generatePreview()
  }, [productImage, uploadedImage, scale, opacity, position, rotation, onPreviewGenerated, productImageLoaded, uploadedImageLoaded])

  const handleReset = () => {
    setPosition({ x: 0, y: 0 })
    setRotation(0)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          icon={RotateCw}
        >
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGrid(!showGrid)}
          icon={Move}
        >
          {showGrid ? 'Hide Grid' : 'Show Grid'}
        </Button>
      </div>

      <div 
        ref={canvasRef} 
        className="design-canvas"
      >
        {/* Background Grid */}
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

        {/* Product image */}
        <Image
          src={productImage}
          alt="Produkto vaizdas"
          className="w-full h-full object-contain"
          width={500}
          height={500}
          priority
          onLoad={() => setProductImageLoaded(true)}
        />
        
        {/* Print area indicator */}
        <div className="print-area absolute inset-0 pointer-events-none" />
        
        {/* Uploaded design image */}
        <AnimatePresence>
          {uploadedImage && (
            <motion.div
              ref={designRef}
              className="absolute touch-none cursor-move"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: opacity,
                scale: scale,
                x: position.x,
                y: position.y,
                rotate: rotation
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              drag
              dragMomentum={false}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={(e, info) => {
                setIsDragging(false)
                setPosition(prev => ({
                  x: prev.x + info.offset.x,
                  y: prev.y + info.offset.y
                }))
              }}
              whileDrag={{ cursor: 'grabbing' }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30
              }}
            >
              <Image
                src={uploadedImage}
                alt="Įkeltas dizainas"
                width={200}
                height={200}
                className="max-w-[200px] max-h-[200px] pointer-events-none select-none"
                draggable={false}
                onLoad={() => setUploadedImageLoaded(true)}
              />

              {/* Rotation handles */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={() => setRotation(prev => prev - 5)}
                  className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                >
                  <RotateCw className="w-4 h-4 rotate-180" />
                </button>
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={() => setRotation(prev => prev + 5)}
                  className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Scale handles */}
              <div className="absolute -left-6 top-1/2 transform -translate-y-1/2">
                <button
                  onClick={() => onScaleChange(scale - 0.1)}
                  className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                <button
                  onClick={() => onScaleChange(scale + 0.1)}
                  className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Position indicators */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>X: {Math.round(position.x)}</span>
        <span>Y: {Math.round(position.y)}</span>
        <span>Rotation: {Math.round(rotation)}°</span>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-500 text-center space-y-1">
        <p>Tempkite dizainą pele arba naudokite rodyklių klavišus tikslesniam pozicionavimui</p>
        <p>Naudokite [ ir ] klavišus dizaino pasukimui</p>
        <p>Spauskite R, kad atstatytumėte poziciją</p>
      </div>
    </div>
  )
}