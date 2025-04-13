import { useRef, useEffect, useState, useCallback } from 'react'
import { debounce } from 'lodash'
import html2canvas from 'html2canvas'
import { RefreshCw, RotateCw, RotateCcw } from 'lucide-react'
import { Button } from './ui/Button'
import { Slider } from './ui/Slider'
import SmoothDraggableImage from './SmoothDraggableImage'
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
  const printAreaRef = useRef<HTMLDivElement>(null) // Nauja nuoroda į spausdinimo zoną
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const previewInProgressRef = useRef(false)
  
  // Optimizuotas peržiūros generavimas - padidinta debounce reikšmė ir triggerinimas tik reikšmingų pakeitimų
  const generatePreview = useCallback(
    debounce(async () => {
      if (!canvasRef.current || !uploadedImage || previewInProgressRef.current) {
        return;
      }

      try {
        previewInProgressRef.current = true;
        setIsGenerating(true)
        setError(null)
        
        const canvas = await html2canvas(canvasRef.current, {
          backgroundColor: null,
          scale: 2, // Padidintas mastelis geresnei kokybei
          logging: false,
          useCORS: true,
          allowTaint: true
        })
        
        const preview = canvas.toDataURL('image/jpeg', 0.9)
        onPreviewGenerated(preview)
      } catch (error) {
        console.error('Peržiūros generavimo klaida:', error)
        setError('Nepavyko sugeneruoti peržiūros')
        onPreviewGenerated(null)
      } finally {
        setIsGenerating(false)
        previewInProgressRef.current = false;
      }
    }, 1500), // Padidinta debounce reikšmė stabilesniam veikimui
    [uploadedImage, onPreviewGenerated]
  )

  const handlePositionChange = useCallback((newPosition: { x: number, y: number }) => {
    onDesignChange({ position: newPosition })
  }, [onDesignChange])

  const handleReset = useCallback(() => {
    // Nustatome poziciją į spausdinimo zonos centrą, jei yra
    if (printAreaRef.current && canvasRef.current) {
      const printArea = printAreaRef.current.getBoundingClientRect()
      const container = canvasRef.current.getBoundingClientRect()
      
      const containerCenter = {
        x: container.width / 2,
        y: container.height / 2
      }
      
      const printAreaCenter = {
        x: (printArea.left - container.left) + printArea.width / 2,
        y: (printArea.top - container.top) + printArea.height / 2
      }
      
      const offsetX = printAreaCenter.x - containerCenter.x
      const offsetY = printAreaCenter.y - containerCenter.y
      
      onDesignChange({
        position: { x: offsetX, y: offsetY },
        rotation: 0,
        scale: 1,
        opacity: 1
      })
    } else {
      // Jei negalime gauti spausdinimo zonos, naudojame numatytuosius
      onDesignChange({
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        opacity: 1
      })
    }
  }, [onDesignChange])

  // Valymas sunaikinant komponentą
  useEffect(() => {
    return () => {
      generatePreview.cancel()
    }
  }, [generatePreview])

  // Peržiūros generavimas po reikšmingų pakeitimų
  useEffect(() => {
    generatePreview()
  }, [
    productImage, 
    uploadedImage, 
    designState.scale, 
    designState.opacity, 
    designState.rotation, 
    currentView,
    generatePreview
  ])
  
  // Atnaujinkime pradinę poziciją pakrovus naują vaizdą
  useEffect(() => {
    if (uploadedImage && !designState.position.x && !designState.position.y) {
      // Kai naujas vaizdas įkeltas, bet pozicija dar nenustatyta, centruojame jį
      handleReset()
    }
  }, [uploadedImage, designState.position, handleReset])

  return (
    <div className="space-y-4">
      {/* Rodinio pasirinkimo mygtukai */}
      <div className="flex justify-center gap-2 mb-4">
        {Object.entries(printAreas).map(([position, area]) => (
          <Button
            key={position}
            variant={currentView === position ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewChange(position as PrintAreaPosition)}
          >
            {area.name}
          </Button>
        ))}
      </div>

      {/* Valdikliai */}
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
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none z-10">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 opacity-50"
              />
            ))}
          </div>
        )}
        
        {/* Spausdinimo srities indikatorius */}
        <div
          ref={printAreaRef} // Pridėta nuoroda į printArea elementą
          className="absolute border-2 border-dashed border-accent-400 rounded-lg pointer-events-none z-10"
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
          <SmoothDraggableImage
            imageUrl={uploadedImage}
            position={designState.position}
            scale={designState.scale}
            opacity={designState.opacity}
            rotation={designState.rotation}
            onPositionChange={handlePositionChange}
            containerRef={canvasRef}
            printAreaRef={printAreaRef} // Perduodame nuorodą į spausdinimo zoną
          />
        )}
        
        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75 z-20">
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
          onClick={() => {
            onDesignChange({ confirmed: true });
            generatePreview();  // Generuojame galutinę peržiūrą patvirtinus
          }}
          variant="default"
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