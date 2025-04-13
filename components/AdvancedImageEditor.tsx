'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { debounce } from 'lodash'
import { Button } from './ui/Button'
import { Slider } from './ui/Slider'
import {
  Save,
  Undo2,
  Redo2,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  SunMedium,
  Contrast,
  Palette,
  X
} from 'lucide-react'

interface AdvancedImageEditorProps {
  imageUrl: string
  onSave: (editedImageUrl: string) => void
  onCancel: () => void
}

interface ImageAdjustments {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  sepia: number
  grayscale: number
}

interface ImageTransform {
  rotate: number
  flipX: boolean
  flipY: boolean
  crop: {
    x: number
    y: number
    width: number
    height: number
  } | null
}

const defaultAdjustments: ImageAdjustments = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
  blur: 0,
  sepia: 0,
  grayscale: 0
}

const defaultTransform: ImageTransform = {
  rotate: 0,
  flipX: false,
  flipY: false,
  crop: null
}

export default function AdvancedImageEditor({
  imageUrl,
  onSave,
  onCancel
}: AdvancedImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(defaultAdjustments)
  const [transform, setTransform] = useState<ImageTransform>(defaultTransform)
  const [isCropping, setIsCropping] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize canvas with image
  useEffect(() => {
    const img = new Image()
    img.src = imageUrl
    img.onload = () => {
      if (!canvasRef.current) return
      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return

      // Set canvas size to match image
      canvasRef.current.width = img.width
      canvasRef.current.height = img.height

      // Draw initial image
      ctx.drawImage(img, 0, 0)
      
      // Add to history
      addToHistory()
    }
  }, [imageUrl])

  // Add current canvas state to history
  const addToHistory = useCallback(() => {
    if (!canvasRef.current) return
    const dataUrl = canvasRef.current.toDataURL()
    setHistory(prev => [...prev.slice(0, historyIndex + 1), dataUrl])
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  // Apply image adjustments
  const applyAdjustments = useCallback(
    debounce(() => {
      if (!canvasRef.current) return
      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return

      // Reset canvas
      ctx.filter = 'none'
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

      // Apply current adjustments
      ctx.filter = `
        brightness(${adjustments.brightness})
        contrast(${adjustments.contrast})
        saturate(${adjustments.saturation})
        blur(${adjustments.blur}px)
        sepia(${adjustments.sepia})
        grayscale(${adjustments.grayscale})
      `

      // Draw image with current transform
      const img = new Image()
      img.src = history[historyIndex]
      img.onload = () => {
        if (!canvasRef.current || !ctx) return

        ctx.save()
        
        // Apply transforms
        ctx.translate(canvasRef.current.width / 2, canvasRef.current.height / 2)
        ctx.rotate((transform.rotate * Math.PI) / 180)
        ctx.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1)
        ctx.translate(-canvasRef.current.width / 2, -canvasRef.current.height / 2)

        // Draw image
        ctx.drawImage(img, 0, 0)
        
        ctx.restore()

        // Apply crop if active
        if (transform.crop) {
          const { x, y, width, height } = transform.crop
          const imageData = ctx.getImageData(x, y, width, height)
          
          canvasRef.current.width = width
          canvasRef.current.height = height
          
          ctx.putImageData(imageData, 0, 0)
        }

        addToHistory()
      }
    }, 200),
    [adjustments, transform, history, historyIndex, addToHistory]
  )

  // Handle undo/redo
  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return
    setHistoryIndex(prev => prev - 1)
    
    const img = new Image()
    img.src = history[historyIndex - 1]
    img.onload = () => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx || !canvasRef.current) return
      
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.drawImage(img, 0, 0)
    }
  }, [history, historyIndex])

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    setHistoryIndex(prev => prev + 1)
    
    const img = new Image()
    img.src = history[historyIndex + 1]
    img.onload = () => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx || !canvasRef.current) return
      
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.drawImage(img, 0, 0)
    }
  }, [history, historyIndex])

  // Handle save
  const handleSave = useCallback(() => {
    if (!canvasRef.current) return
    setIsProcessing(true)
    
    try {
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85)
      onSave(dataUrl)
    } catch (error) {
      console.error('Error saving image:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [onSave])

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Redaguoti paveikslėlį</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto mx-auto"
          />
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* History controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              icon={Undo2}
            >
              Atšaukti
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              icon={Redo2}
            >
              Grąžinti
            </Button>
          </div>

          {/* Image adjustments */}
          <div className="space-y-4">
            <h3 className="font-medium">Koregavimai</h3>
            
            <div>
              <label className="text-sm text-gray-600 flex items-center">
                <SunMedium className="h-4 w-4 mr-2" />
                Šviesumas
              </label>
              <Slider
                value={adjustments.brightness}
                min={0.5}
                max={1.5}
                step={0.01}
                onChange={(value) => {
                  setAdjustments(prev => ({ ...prev, brightness: value }))
                  applyAdjustments()
                }}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 flex items-center">
                <Contrast className="h-4 w-4 mr-2" />
                Kontrastas
              </label>
              <Slider
                value={adjustments.contrast}
                min={0.5}
                max={1.5}
                step={0.01}
                onChange={(value) => {
                  setAdjustments(prev => ({ ...prev, contrast: value }))
                  applyAdjustments()
                }}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 flex items-center">
                <Palette className="h-4 w-4 mr-2" />
                Sodrumas
              </label>
              <Slider
                value={adjustments.saturation}
                min={0}
                max={2}
                step={0.01}
                onChange={(value) => {
                  setAdjustments(prev => ({ ...prev, saturation: value }))
                  applyAdjustments()
                }}
              />
            </div>
          </div>

          {/* Transform controls */}
          <div className="space-y-4">
            <h3 className="font-medium">Transformacija</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTransform(prev => ({
                    ...prev,
                    rotate: prev.rotate - 90
                  }))
                  applyAdjustments()
                }}
                icon={RotateCcw}
              >
                -90°
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTransform(prev => ({
                    ...prev,
                    rotate: prev.rotate + 90
                  }))
                  applyAdjustments()
                }}
                icon={RotateCw}
              >
                90°
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTransform(prev => ({
                    ...prev,
                    flipX: !prev.flipX
                  }))
                  applyAdjustments()
                }}
                icon={FlipHorizontal}
              >
                Apversti H
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTransform(prev => ({
                    ...prev,
                    flipY: !prev.flipY
                  }))
                  applyAdjustments()
                }}
                icon={FlipVertical}
              >
                Apversti V
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsCropping(!isCropping)}
              icon={Crop}
            >
              {isCropping ? 'Atšaukti apkarpymą' : 'Apkarpyti'}
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Atšaukti
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={handleSave}
              disabled={isProcessing}
              icon={Save}
            >
              {isProcessing ? 'Išsaugoma...' : 'Išsaugoti'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}