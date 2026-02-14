// filepath: /workspaces/simka/components/SimplifiedDesignCanvas.tsx
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { debounce } from 'lodash'
import html2canvas from 'html2canvas'
import { RotateCw, RotateCcw, FlipHorizontal, RefreshCw, Lock, Unlock, Check } from 'lucide-react'
import { Button } from './ui/Button'
import { Slider } from './ui/Slider'
import RelativePositionDraggableImage from './RelativePositionDraggableImage'
import type { DesignPosition, RelativePosition } from '@/lib/types'

interface SimplifiedDesignCanvasProps {
  productImage: string
  uploadedImage: string | null
  initialState?: {
    position?: DesignPosition
    relativePosition?: RelativePosition
    scale?: number
    opacity?: number
    rotation?: number
    locked?: boolean
  }
  printAreaBounds?: {
    top: number
    left: number
    width: number
    height: number
  }
  onPreviewGenerated: (preview: string | null, state: { 
    position: DesignPosition 
    relativePosition: RelativePosition
    scale: number
    opacity: number
    rotation: number
    locked: boolean
  } | null) => void
  onSaveDesign?: (state: { 
    position: DesignPosition 
    relativePosition: RelativePosition
    scale: number
    opacity: number
    rotation: number
    locked: boolean
  }) => void
  onCancel?: () => void
}

export default function SimplifiedDesignCanvas({
  productImage,
  uploadedImage,
  initialState,
  printAreaBounds = { top: 25, left: 25, width: 50, height: 50 },
  onPreviewGenerated,
  onSaveDesign,
  onCancel
}: SimplifiedDesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const printAreaRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<DesignPosition>(initialState?.position || { x: 0, y: 0 })
  const [relativePosition, setRelativePosition] = useState<RelativePosition>(
    initialState?.relativePosition || { xPercent: 50, yPercent: 50 }
  )
  const [scale, setScale] = useState(initialState?.scale || 1)
  const [opacity, setOpacity] = useState(initialState?.opacity || 1)
  const [rotation, setRotation] = useState(initialState?.rotation || 0)
  const [locked, setLocked] = useState(initialState?.locked || false)
  const [flipX, setFlipX] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const generatingRef = useRef(false)
  const positionChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Centrinis dizaino pozicionavimas
  const handleReset = useCallback(() => {
    if (canvasRef.current && printAreaRef.current) {
      const container = canvasRef.current.getBoundingClientRect()
      const printArea = printAreaRef.current.getBoundingClientRect()
      
      // Spausdinimo zonos centro koordinatės konteinerio atžvilgiu
      const printAreaCenterX = (printArea.left - container.left) + (printArea.width / 2)
      const printAreaCenterY = (printArea.top - container.top) + (printArea.height / 2)
      
      // Santykinės koordinatės
      const xPercent = (printAreaCenterX / container.width) * 100
      const yPercent = (printAreaCenterY / container.height) * 100
      
      // Absoliučios koordinatės centruotam elementui
      const x = printAreaCenterX - (container.width / 2)
      const y = printAreaCenterY - (container.height / 2)
      
      setPosition({ x, y })
      setRelativePosition({ xPercent, yPercent })
      setRotation(0)
      setScale(1)
      setOpacity(1)
      setFlipX(false)
    }
  }, [])

  // Dizaino apvertimas
  const handleFlip = useCallback(() => {
    if (locked) return
    setFlipX(prev => !prev)
    setScale(prev => -prev)
  }, [locked])
  
  // Užrakinimas/atrakinimas
  const toggleLock = useCallback(() => {
    // Kai užrakiname - sugeneruojame galutinę peržiūrą
    if (!locked) {
      // Išsaugome tikslią poziciją prieš užrakinant
      generatePreview(true)
    }
    setLocked(prev => !prev)
  }, [locked])

  // Peržiūros generavimas
  const generatePreview = useCallback(
    debounce((forceGenerate = false) => {
      if (!canvasRef.current || !uploadedImage || (generatingRef.current && !forceGenerate)) {
        return
      }

      try {
        generatingRef.current = true
        setIsGenerating(true)
        setError(null)
        
        // Sukaupkime būsenos duomenis
        const stateData = {
          position,
          relativePosition,
          scale: Math.abs(scale), // Absoliuti skalė be apvertimo
          opacity,
          rotation,
          locked
        }
        
        html2canvas(canvasRef.current, {
          backgroundColor: null,
          scale: 2, // Geresnė kokybė
          logging: false,
          useCORS: true,
          allowTaint: true
        }).then((canvas) => {
          // Išsaugome vaizdą PNG formatu, kad išlaikytų permatomumą
          const preview = canvas.toDataURL('image/png', 0.9)
          onPreviewGenerated(preview, stateData)
        }).catch((error) => {
          console.error('Peržiūros generavimo klaida:', error)
          setError('Nepavyko sugeneruoti peržiūros')
          onPreviewGenerated(null, null)
        }).finally(() => {
          setIsGenerating(false)
          generatingRef.current = false
        })
      } catch (error) {
        console.error('Peržiūros generavimo klaida:', error)
        setError('Nepavyko sugeneruoti peržiūros')
        onPreviewGenerated(null, null)
        setIsGenerating(false)
        generatingRef.current = false
      }
    }, 500),
    [position, relativePosition, scale, opacity, rotation, locked, uploadedImage, onPreviewGenerated]
  )

  // Pozicijos keitimo valdikliai
  const handlePositionChange = useCallback((newPosition: DesignPosition) => {
    if (locked) return
    setPosition(newPosition)
    
    // Atšaukiame ankstesnį laikmatį
    if (positionChangeTimeoutRef.current) {
      clearTimeout(positionChangeTimeoutRef.current)
    }
    
    // Nustatome naują laikmatį peržiūros generavimui
    positionChangeTimeoutRef.current = setTimeout(() => {
      generatePreview()
      positionChangeTimeoutRef.current = null
    }, 200)
  }, [locked, generatePreview])

  // Santykinės pozicijos keitimo valdiklis
  const handleRelativePositionChange = useCallback((newRelativePosition: RelativePosition) => {
    if (locked) return
    setRelativePosition(newRelativePosition)
  }, [locked])

  // Rotacijos keitimas
  const handleRotate = useCallback((degrees: number) => {
    if (locked) return
    setRotation(prev => prev + degrees)
  }, [locked])

  // Skalės keitimas
  const handleScaleChange = useCallback((newScale: number) => {
    if (locked) return
    // Išlaikome apvertimo būseną
    setScale(prev => (prev < 0 ? -newScale : newScale))
  }, [locked])

  // Permatomumo keitimas
  const handleOpacityChange = useCallback((newOpacity: number) => {
    if (locked) return
    setOpacity(newOpacity)
  }, [locked])

  // Automatinis peržiūros generavimas, kai keičiasi dizaino elementai
  useEffect(() => {
    if (!locked) {
      generatePreview()
    }
    return generatePreview.cancel
  }, [productImage, uploadedImage, rotation, locked, generatePreview])

  // Skalės ir permatomumo pakeitimų stebėjimas peržiūros atnaujinimui
  useEffect(() => {
    // Nedažnas atnaujinimas, neperkraunant prie kiekvieno slankiklio pakeitimo
    const timer = setTimeout(() => {
      generatePreview()
    }, 300)
    
    return () => clearTimeout(timer)
  }, [scale, opacity, generatePreview])

  // Išsaugojimo funkcija
  const handleSave = useCallback(() => {
    // Prieš išsaugant, užtikriname, kad turime galutinę peržiūrą
    if (!locked) {
      setLocked(true)
    }
    
    // Sugeneruojame galutinę peržiūrą ir iškviečiame išsaugojimo funkciją
    generatePreview.cancel()
    
    const finalState = {
      position,
      relativePosition,
      scale: Math.abs(scale),
      opacity,
      rotation,
      locked: true
    }
    
    // Pirmiausia atnaujinkime peržiūrą
    html2canvas(canvasRef.current!, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    }).then((canvas) => {
      const preview = canvas.toDataURL('image/png', 0.9)
      onPreviewGenerated(preview, finalState)
      
      // Tada iškvieskime išsaugojimo funkciją
      if (onSaveDesign) {
        onSaveDesign(finalState)
      }
    }).catch((error) => {
      console.error('Išsaugojimo klaida:', error)
      setError('Nepavyko išsaugoti dizaino')
    })
  }, [position, relativePosition, scale, opacity, rotation, locked, onPreviewGenerated, onSaveDesign, generatePreview])

  return (
    <div className="w-full space-y-4">
      {/* Redagavimo drobė */}
      <div 
        ref={canvasRef}
        className="design-canvas relative w-full aspect-square bg-white rounded-lg overflow-hidden shadow-md"
      >
        {/* Produkto paveikslėlis */}
        <img 
          src={productImage} 
          alt="Produktas" 
          className="w-full h-full object-contain"
        />
        
        {/* Spausdinimo zona */}
        <div 
          ref={printAreaRef}
          className="absolute border-2 border-dashed border-accent-400 rounded-lg pointer-events-none z-10"
          style={{
            top: `${printAreaBounds.top}%`,
            left: `${printAreaBounds.left}%`,
            width: `${printAreaBounds.width}%`,
            height: `${printAreaBounds.height}%`,
          }}
        />
        
        {/* Įkeltas paveikslėlis */}
        {uploadedImage && (
          <RelativePositionDraggableImage
            imageUrl={uploadedImage}
            position={position}
            relativePosition={relativePosition}
            scale={scale}
            opacity={opacity}
            rotation={rotation}
            onPositionChange={handlePositionChange}
            onRelativePositionChange={handleRelativePositionChange}
            containerRef={canvasRef}
            printAreaRef={printAreaRef}
            locked={locked}
          />
        )}
        
        {/* Generavimo indikatoriaus sluoksnis */}
        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75 z-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600 mb-2"></div>
            <span className="text-sm text-accent-600">Generuojama peržiūra...</span>
          </div>
        )}
      </div>
      
      {/* Supaprastinti valdikliai mobiliai sąsajai - viena eilė */}
      <div className="flex flex-wrap items-center gap-2 justify-between bg-white rounded-lg p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={locked ? "default" : "outline"}
            size="sm"
            onClick={toggleLock}
            icon={locked ? Unlock : Lock}
            title={locked ? "Atrakinti dizainą" : "Užrakinti dizainą"}
          >
            {locked ? "" : ""}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRotate(-15)}
            icon={RotateCcw}
            disabled={locked}
            title="Pasukti prieš laikrodžio rodyklę"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRotate(15)}
            icon={RotateCw}
            disabled={locked}
            title="Pasukti pagal laikrodžio rodyklę"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleFlip}
            icon={FlipHorizontal}
            disabled={locked}
            title="Apversti horizontaliai"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            icon={RefreshCw}
            disabled={locked}
            title="Atstatyti į pradinę poziciją"
          />
        </div>
        
        {locked && (
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            icon={Check}
          >
            Išsaugoti
          </Button>
        )}
      </div>
      
      {/* Slankikliai */}
      {!locked && (
        <>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Dydis</span>
              <span className="text-sm">{Math.abs(Math.round(scale * 100))}%</span>
            </div>
            <Slider
              value={Math.abs(scale)}
              min={0.5}
              max={2}
              step={0.05}
              onChange={handleScaleChange}
            />
          </div>
          
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Permatomumas</span>
              <span className="text-sm">{Math.round(opacity * 100)}%</span>
            </div>
            <Slider
              value={opacity}
              min={0.1}
              max={1}
              step={0.05}
              onChange={handleOpacityChange}
            />
          </div>
        </>
      )}
      
      {/* Informacija ir klaidos */}
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
          {error}
        </div>
      )}
      
      {/* Veiksmo mygtukai */}
      <div className="flex gap-2">
        {onCancel && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Atšaukti
          </Button>
        )}
        
        {onSaveDesign && (
          <Button
            variant="default"
            className="flex-1"
            onClick={handleSave}
            disabled={!uploadedImage}
          >
            {locked ? "Išsaugoti" : "Užrakinti ir išsaugoti"}
          </Button>
        )}
      </div>
      
      {/* Pagalbinis tekstas */}
      <div className="text-sm text-gray-500 text-center">
        {locked ? (
          <p>Dizainas užrakintas. Atlikus pakeitimus, paspauskite „Išsaugoti“.</p>
        ) : (
          <p>Tempkite logotipą, koreguokite dydį ir pasukimą. Tada paspauskite „Užrakinti“ mygtuką.</p>
        )}
      </div>
    </div>
  )
}