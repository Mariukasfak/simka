import { useRef, useEffect, useState, useCallback } from 'react'
import { debounce } from 'lodash'
import html2canvas from 'html2canvas'
import { RefreshCw, RotateCw, RotateCcw } from 'lucide-react'
import { Button } from './ui/Button'
import { Slider } from './ui/Slider'
import type { PrintArea, PrintAreaPosition, DesignState } from '@/lib/types'

interface EnhancedDesignCanvasProps {
  productImage: string
  uploadedImage: string | null
  designState: DesignState
  onDesignChange: (changes: Partial<DesignState>) => void
  onPreviewGenerated: (preview: string | null) => void
  printAreas: Record<PrintAreaPosition, PrintArea>
  currentView: PrintAreaPosition
  onViewChange: (view: PrintAreaPosition) => void
}

export default function EnhancedDesignCanvas({
  productImage,
  uploadedImage,
  designState,
  onDesignChange,
  onPreviewGenerated,
  printAreas,
  currentView,
  onViewChange
}: EnhancedDesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastPositionRef = useRef(designState.position)
  const movementThreshold = 2

  // Generate preview with increased debounce time
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
    }, 1000), // Increased from 500ms to 1000ms
    [uploadedImage, onPreviewGenerated]
  )

  // Optimized mouse movement handler with threshold
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    const movementX = e.movementX
    const movementY = e.movementY
    
    // Ignore small movements below threshold
    if (Math.abs(movementX) < movementThreshold && Math.abs(movementY) < movementThreshold) {
      return
    }

    const newPosition = {
      x: lastPositionRef.current.x + movementX,
      y: lastPositionRef.current.y + movementY
    }
    
    lastPositionRef.current = newPosition
    
    onDesignChange({
      position: newPosition
    })
  }, [isDragging, onDesignChange])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    lastPositionRef.current = designState.position
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove, designState.position])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    generatePreview()
  }, [handleMouseMove, generatePreview])

  const handleReset = useCallback(() => {
    onDesignChange({
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      opacity: 1
    })
  }, [onDesignChange])

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      generatePreview.cancel()
    }
  }, [handleMouseMove, handleMouseUp, generatePreview])

  // Only trigger preview generation on significant state changes
  useEffect(() => {
    if (!isDragging) {
      generatePreview()
    }
  }, [productImage, uploadedImage, designState.scale, designState.opacity, designState.rotation, generatePreview, isDragging])

  return (
    <div className="space-y-4">
      {/* View selection buttons */}
      <div className="flex justify-center gap-2 mb-4">
        {Object.entries(printAreas).map(([position, area]) => (
          <Button
            key={position}
            variant={currentView === position ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onViewChange(position as PrintAreaPosition)}
          >
            {area.name}
          </Button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-brand-900">
              Dydis
            </label>
            <span className="text-sm text-brand-600">
              {Math.round(designState.scale * 100)}%
            </span>
          </div>
          <Slider
            value={designState.scale}
            min={0.2}
            max={3}
            step={0.01}
            onChange={(value) => onDesignChange({ scale: value })}
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-brand-900">
              Permatomumas
            </label>
            <span className="text-sm text-brand-600">
              {Math.round(designState.opacity * 100)}%
            </span>
          </div>
          <Slider
            value={designState.opacity}
            min={0.1}
            max={1}
            step={0.01}
            onChange={(value) => onDesignChange({ opacity: value })}
          />
        </div>
      </div>

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
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDesignChange({ rotation: designState.rotation - 15 })}
          icon={RotateCcw}
        >
          -15°
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDesignChange({ rotation: designState.rotation + 15 })}
          icon={RotateCw}
        >
          +15°
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
        
        {/* Print area indicator */}
        <div
          className="absolute border-2 border-dashed border-accent-400 rounded-lg pointer-events-none"
          style={{
            top: `${printAreas[currentView].bounds.top}%`,
            left: `${printAreas[currentView].bounds.left}%`,
            width: `${printAreas[currentView].bounds.width}%`,
            height: `${printAreas[currentView].bounds.height}%`,
          }}
        />
        
        <img
          src={productImage}
          alt="Produkto vaizdas"
          className="w-full h-full object-contain"
        />
        
        {uploadedImage && (
          <div
            className="absolute top-1/2 left-1/2 cursor-move"
            style={{
              transform: `translate(-50%, -50%) translate(${designState.position.x}px, ${designState.position.y}px) scale(${designState.scale}) rotate(${designState.rotation}deg)`,
              opacity: designState.opacity,
              transition: isDragging ? 'none' : 'transform 0.1s, opacity 0.1s'
            }}
            onMouseDown={handleMouseDown}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600 mb-2"></div>
            <span className="text-sm text-accent-600">Generuojama peržiūra...</span>
          </div>
        )}
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>X: {Math.round(designState.position.x)}</span>
        <span>Y: {Math.round(designState.position.y)}</span>
        <span>Pasukimas: {Math.round(designState.rotation)}°</span>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
          {error}
        </div>
      )}

      {uploadedImage && !designState.confirmed && (
        <Button
          onClick={() => onDesignChange({ confirmed: true })}
          variant="primary"
          className="w-full mt-4"
        >
          Patvirtinti dizainą
        </Button>
      )}

      {uploadedImage && designState.confirmed && (
        <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-green-800 flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Dizainas patvirtintas!
          <Button
            onClick={() => onDesignChange({ confirmed: false })}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            Redaguoti
          </Button>
        </div>
      )}

      <div className="text-sm text-gray-500 text-center">
        <p>Tempkite pele, kad pakeistumėte logotipo poziciją</p>
        <p>Naudokite slankiklius dydžio ir permatomumo keitimui</p>
      </div>
    </div>
  )
}