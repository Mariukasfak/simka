import { useRef, useEffect, useState, useCallback } from 'react'
import { debounce } from 'lodash'
import html2canvas from 'html2canvas'
import { RefreshCw, RotateCw, RotateCcw, HelpCircle, X, Lock, Unlock } from 'lucide-react'
import { Button } from './ui/Button'
import { Slider } from './ui/Slider'
import RelativePositionDraggableImage from './RelativePositionDraggableImage'
import DesignDebugger from './DesignDebugger'
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
  const printAreaRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showInitialTooltip, setShowInitialTooltip] = useState(true)
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const previewInProgressRef = useRef(false)
  const initialLoadCompleted = useRef(false)
  const lastViewRef = useRef<PrintAreaPosition>(currentView)
  const skipStateUpdateRef = useRef(false)

  // ⚡ PERFORMANCE: Local state for smooth dragging without re-rendering parent
  const [dragPosition, setDragPosition] = useState(designState.position)
  const [dragRelativePosition, setDragRelativePosition] = useState(designState.relativePrintAreaPosition)
  const isDraggingRef = useRef(false)

  // ⚡ PERFORMANCE: Local state for high-frequency inputs (sliders)
  const [localDesignState, setLocalDesignState] = useState({
    scale: designState.scale,
    opacity: designState.opacity,
    rotation: designState.rotation
  })
  const lastLocalChangeRef = useRef<number>(0)

  // ⚡ PERFORMANCE: Sync local state with props when NOT dragging and no recent slider updates
  useEffect(() => {
    if (!isDraggingRef.current) {
      setDragPosition(designState.position)
      setDragRelativePosition(designState.relativePrintAreaPosition)
    }

    // Only sync from props if there haven't been recent local changes
    // This prevents the sliders from jumping back to previous values.
    // If external changes occur (like parent resets or view changes),
    // we want those to override local state.
    const now = Date.now()
    if (now - lastLocalChangeRef.current > 500) {
      setLocalDesignState({
        scale: designState.scale,
        opacity: designState.opacity,
        rotation: designState.rotation
      })
    }
  }, [designState.position, designState.relativePrintAreaPosition, designState.scale, designState.opacity, designState.rotation])

  // ⚡ PERFORMANCE: Debounced parent state update for sliders
  // We use a ref to store the debounced function so it doesn't get recreated on every render
  const debouncedOnDesignChangeRef = useRef(
    debounce((changes: Partial<DesignState>, onChange: typeof onDesignChange, generate: typeof generatePreview) => {
      onChange(changes)
      generate()
    }, 100)
  )

  // Clean up the debounced function on unmount
  useEffect(() => {
    const debouncedFn = debouncedOnDesignChangeRef.current
    return () => {
      debouncedFn.cancel()
    }
  }, [])

  // Wrapper for immediate local update + debounced parent update
  const handleLocalDesignChange = useCallback((changes: Partial<typeof localDesignState>) => {
    lastLocalChangeRef.current = Date.now()
    setLocalDesignState(prev => ({ ...prev, ...changes }))

    // Call the stable debounced function, passing the current dependencies
    debouncedOnDesignChangeRef.current(changes, onDesignChange, generatePreview)

    if (showInitialTooltip) {
      setShowInitialTooltip(false)
    }
  }, [onDesignChange, generatePreview, showInitialTooltip])
  
  // Optimizuotas peržiūros generavimas
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const generatePreview = useCallback(
    debounce(async (forceGenerate = false) => {
      if (!canvasRef.current || !uploadedImage || (previewInProgressRef.current && !forceGenerate)) {
        return;
      }

      try {
        previewInProgressRef.current = true;
        setIsGenerating(true);
        setError(null);
        
        // Sukuriame tikslią kopiją, kurią naudosime peržiūrai
        const originalCanvas = canvasRef.current;
        const previewContainer = document.createElement('div');
        previewContainer.style.position = 'absolute';
        previewContainer.style.left = '-9999px';
        previewContainer.style.width = originalCanvas.offsetWidth + 'px';
        previewContainer.style.height = originalCanvas.offsetHeight + 'px';
        document.body.appendChild(previewContainer);
        
        // Kopijuojame originalų turinį
        previewContainer.innerHTML = originalCanvas.innerHTML;
        
        // Suraskime logotipo elementą ir pritaikykime tiksliai tokią pačią transformaciją
        const originalLogo = originalCanvas.querySelector('.draggable-image') as HTMLElement;
        const previewLogo = previewContainer.querySelector('.draggable-image') as HTMLElement;
        
        if (originalLogo && previewLogo) {
          previewLogo.style.transform = originalLogo.style.transform;
          previewLogo.style.opacity = originalLogo.style.opacity;
        }
        
        // Generuojame peržiūrą naudodami naujai sukurtą konteinerį
        const canvas = await html2canvas(previewContainer, {
          backgroundColor: null,
          scale: 1.5,
          logging: false,
          useCORS: true,
          allowTaint: true,
          // Neliesti transformacijos
          onclone: (clonedDoc, clonedElem) => {
            const clonedLogo = clonedElem.querySelector('.draggable-image') as HTMLElement;
            if (clonedLogo && originalLogo) {
              clonedLogo.style.transform = originalLogo.style.transform;
            }
          }
        });
        
        // Išvalome laikiną konteinerį
        document.body.removeChild(previewContainer);
        
        // Išsaugome peržiūrą
        const preview = canvas.toDataURL('image/png', 0.9);
        onPreviewGenerated(preview);
      } catch (error) {
        console.error('Peržiūros generavimo klaida:', error);
        setError('Nepavyko sugeneruoti peržiūros');
        onPreviewGenerated(null);
      } finally {
        setIsGenerating(false);
        previewInProgressRef.current = false;
      }
    }, 800),
    [uploadedImage, onPreviewGenerated]
  )

  // Avarinė funkcija visoms peržiūroms regeneruoti
  const forceRegenerateAllPreviews = useCallback(async () => {
    if (!canvasRef.current || !uploadedImage) {
      return;
    }
    
    setIsGenerating(true);
    
    // Sukaupkime visas pozicijas ir suraskime problemą
    const positionLog = {
      currentView,
      designState,
      canvasSize: canvasRef.current?.getBoundingClientRect(),
      printAreaSize: printAreaRef.current?.getBoundingClientRect(),
      windowSize: { width: window.innerWidth, height: window.innerHeight },
      cssStyles: {
        position: designState.position,
        scale: designState.scale,
        rotation: designState.rotation,
        opacity: designState.opacity,
        relativePrintAreaPosition: designState.relativePrintAreaPosition
      }
    };
    
    console.log('DEBUG: Pozicijos diagnozė', positionLog);
    
    try {
      // Sukuriame tikslią kopiją, kurią naudosime peržiūrai
      const originalCanvas = canvasRef.current;
      const previewContainer = document.createElement('div');
      previewContainer.style.position = 'absolute';
      previewContainer.style.left = '-9999px';
      previewContainer.style.width = originalCanvas.offsetWidth + 'px';
      previewContainer.style.height = originalCanvas.offsetHeight + 'px';
      document.body.appendChild(previewContainer);
      
      // Kopijuojame originalų turinį
      previewContainer.innerHTML = originalCanvas.innerHTML;
      
      // Suraskime logotipo elementą 
      const originalLogo = originalCanvas.querySelector('.draggable-image') as HTMLElement;
      const previewLogo = previewContainer.querySelector('.draggable-image') as HTMLElement;
      
      if (originalLogo && previewLogo) {
        // Išsaugome originalią transformaciją
        const originalTransform = originalLogo.style.transform;
        console.log('Originali transformacija:', originalTransform);
        
        // Tiesiogiai nustatome transformaciją pagal santykinę poziciją
        if (designState.relativePrintAreaPosition && printAreaRef.current) {
          const printArea = printAreaRef.current.getBoundingClientRect();
          const container = canvasRef.current.getBoundingClientRect();
          
          // Apskaičiuojame tikslų atstumą nuo printArea viršutinio kairiojo kampo
          const relPos = designState.relativePrintAreaPosition;
          const xInPrintArea = (relPos.xPercent / 100) * printArea.width;
          const yInPrintArea = (relPos.yPercent / 100) * printArea.height;
          
          // Apskaičiuojame absoliučią poziciją canvasRef koordinačių sistemoje
          const printAreaLeft = printArea.left - container.left;
          const printAreaTop = printArea.top - container.top;
          
          const xFromLeft = printAreaLeft + xInPrintArea;
          const yFromTop = printAreaTop + yInPrintArea;
          
          // Atstatome atstumą nuo centro
          const xFromCenter = xFromLeft - (container.width / 2);
          const yFromCenter = yFromTop - (container.height / 2);
          
          // Taikome naują transformaciją
          previewLogo.style.transform = `
            translate3d(calc(-50% + ${xFromCenter}px), calc(-50% + ${yFromCenter}px), 0) 
            scale(${designState.scale}) 
            rotate(${designState.rotation}deg)
          `;
          
          console.log('Nauja transformacija pagal santykines koordinates:', previewLogo.style.transform);
        } else {
          // Jei nėra santykinių koordinačių, naudojame originalią transformaciją
          previewLogo.style.transform = originalTransform;
        }
        
        previewLogo.style.opacity = String(designState.opacity);
      }
      
      // Generuojame peržiūrą
      const canvas = await html2canvas(previewContainer, {
        backgroundColor: null,
        scale: 1.5,
        logging: true,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc, clonedElem) => {
          const clonedLogo = clonedElem.querySelector('.draggable-image') as HTMLElement;
          if (clonedLogo && previewLogo) {
            clonedLogo.style.transform = previewLogo.style.transform;
          }
        }
      });
      
      // Išvalome laikiną konteinerį
      document.body.removeChild(previewContainer);
      
      // Išsaugome peržiūrą
      const preview = canvas.toDataURL('image/png', 0.9);
      onPreviewGenerated(preview);
      
      console.log('Peržiūra sėkmingai regeneruota');
    } catch (error) {
      console.error('Regeneravimo klaida:', error);
      setError('Nepavyko regeneruoti peržiūros');
    } finally {
      setIsGenerating(false);
    }
  }, [canvasRef, printAreaRef, uploadedImage, currentView, designState, onPreviewGenerated]);

  // ⚡ PERFORMANCE: Update only local state during drag
  const handlePositionChange = useCallback((newPosition: { x: number, y: number }) => {
    if (skipStateUpdateRef.current) {
      skipStateUpdateRef.current = false;
      return;
    }
    
    isDraggingRef.current = true;

    // Išjungiame pradinį patarimą kai vartotojas pirmą kartą keičia poziciją
    if (showInitialTooltip) {
      setShowInitialTooltip(false);
    }

    setDragPosition(newPosition);
  }, [showInitialTooltip]);

  // ⚡ PERFORMANCE: Update only local state during drag
  const handleRelativePositionChange = useCallback((relPosition: { xPercent: number, yPercent: number }) => {
    if (skipStateUpdateRef.current) {
      skipStateUpdateRef.current = false;
      return;
    }
    
    isDraggingRef.current = true;

    // Išjungiame pradinį patarimą kai vartotojas pirmą kartą keičia poziciją
    if (showInitialTooltip) {
      setShowInitialTooltip(false);
    }
    
    setDragRelativePosition(relPosition);
  }, [showInitialTooltip]);

  // ⚡ PERFORMANCE: Update parent state only on drag end
  const handlePositionChangeEnd = useCallback((newPosition: { x: number, y: number }) => {
    isDraggingRef.current = false;

    // Atnaujiniame poziciją
    if (
      designState.position.x !== newPosition.x || 
      designState.position.y !== newPosition.y
    ) {
      onDesignChange({ position: newPosition });
      // Peržiūrą generuojame tik kartą po pozicijos pasikeitimo
      generatePreview();
    }
  }, [onDesignChange, generatePreview, designState.position.x, designState.position.y]);

  // ⚡ PERFORMANCE: Update parent state only on drag end
  const handleRelativePositionChangeEnd = useCallback((relPosition: { xPercent: number, yPercent: number }) => {
    isDraggingRef.current = false;

    // Patikriname ar santykinė pozicija pasikeitė
    const currentRelPos = designState.relativePrintAreaPosition || { xPercent: 50, yPercent: 50 };
    
    if (
      currentRelPos.xPercent !== relPosition.xPercent || 
      currentRelPos.yPercent !== relPosition.yPercent
    ) {
      // Atnaujiname santykinę poziciją ir generuojame peržiūrą
      onDesignChange({
        relativePrintAreaPosition: relPosition
      });
      
      // Generuojame peržiūrą po pozicijos pakeitimo
      generatePreview();
    }
  }, [onDesignChange, generatePreview, designState.relativePrintAreaPosition]);

  // Tikslaus spausdinimo zonos centro skaičiavimas
  const calculatePrintAreaCenterOffset = useCallback(() => {
    if (!printAreaRef.current || !canvasRef.current) {
      return { x: 0, y: 0 };
    }

    const container = canvasRef.current.getBoundingClientRect();
    const printArea = printAreaRef.current.getBoundingClientRect();
    
    // Apskaičiuojame spausdinimo zonos centro koordinates konteinerio viduje
    const printAreaCenterX = printArea.left - container.left + printArea.width / 2;
    const printAreaCenterY = printArea.top - container.top + printArea.height / 2;
    
    // Apskaičiuojame atstumą nuo konteinerio centro
    const containerCenterX = container.width / 2;
    const containerCenterY = container.height / 2;
    
    return {
      x: printAreaCenterX - containerCenterX,
      y: printAreaCenterY - containerCenterY
    };
  }, []);

  // Grąžina elementą į spausdinimo zonos centrą
  const handleReset = useCallback(() => {
    if (printAreaRef.current && canvasRef.current) {
      const offset = calculatePrintAreaCenterOffset();
      
      onDesignChange({
        position: offset,
        rotation: 0,
        scale: 1,
        opacity: 1
      });
      
      // Po pozicijos atstatymo generuojame naują peržiūrą
      setTimeout(() => {
        generatePreview();
      }, 100);
    } else {
      // Jei negalime gauti spausdinimo zonos, naudojame numatytuosius
      onDesignChange({
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        opacity: 1
      });
    }
  }, [onDesignChange, calculatePrintAreaCenterOffset, generatePreview]);

  // Valymas sunaikinant komponentą
  useEffect(() => {
    return () => {
      generatePreview.cancel();
    }
  }, [generatePreview]);

  // Peržiūros generavimas po reikšmingų pakeitimų, bet ne po pozicijos
  useEffect(() => {
    // Generuojame peržiūrą tik po svarbių pakeitimų
    generatePreview();
  }, [
    productImage,  
    uploadedImage, 
    designState.scale, 
    designState.opacity, 
    designState.rotation, 
    generatePreview
  ]);
  
  // Rodinių pasikeitimo apdorojimas
  useEffect(() => {
    if (currentView !== lastViewRef.current) {
      // Išsaugome naują vaizdą
      lastViewRef.current = currentView;
      
      // Atnaujinus poziciją, būtinai pergeneruojame peržiūrą
      // bet su uždelsimu, kad būtų supaprastinta būsenos pasikeitimų seka
      setTimeout(() => {
        generatePreview();
      }, 300);
    }
  }, [currentView, generatePreview]);

  // Atnaujinkime pradinę poziciją, kai produkto vaizdas įkeliamas
  useEffect(() => {
    const img = new Image();
    img.src = productImage;
    img.onload = () => {
      // Kai produkto vaizdas įkeliamas
      if (uploadedImage && !initialLoadCompleted.current) {
        initialLoadCompleted.current = true;
        
        // Pirmą kartą atšviežinus būsena - kviečiamas pozicijos atstatymas
        // bet ne kiekvieną kartą kai keičiamas vaizdas
        handleReset();
      }
    };
  }, [productImage, uploadedImage, handleReset]);

  // Efektas pagalbos patarimui - išjungiame automatiškai po 5 sekundžių
  useEffect(() => {
    if (showInitialTooltip) {
      const timer = setTimeout(() => {
        setShowInitialTooltip(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showInitialTooltip]);

  return (
    <div className="space-y-4">
      {/* Rodinio pasirinkimo mygtukai */}
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
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
              {Math.round(localDesignState.scale * 100)}%
            </span>
          </div>
          <Slider
            value={localDesignState.scale}
            min={0.2}
            max={3}
            step={0.01}
            onChange={(value) => handleLocalDesignChange({ scale: value })}
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-brand-900">
              Permatomumas
            </label>
            <span className="text-sm text-brand-600">
              {Math.round(localDesignState.opacity * 100)}%
            </span>
          </div>
          <Slider
            value={localDesignState.opacity}
            min={0.1}
            max={1}
            step={0.01}
            onChange={(value) => handleLocalDesignChange({ opacity: value })}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          icon={RefreshCw}
        >
          Atstatyti į centrą
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
          onClick={() => handleLocalDesignChange({ rotation: localDesignState.rotation - 15 })}
          icon={RotateCcw}
        >
          -15°
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleLocalDesignChange({ rotation: localDesignState.rotation + 15 })}
          icon={RotateCw}
        >
          +15°
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onDesignChange({ locked: !designState.locked });
            setShowInitialTooltip(false);
            // Peržiūrą generuojame, kad atsinaujintų ir užrakto indikatoriaus vaizdas
            generatePreview();
          }}
          icon={designState.locked ? Unlock : Lock}
        >
          {designState.locked ? 'Atrakinti' : 'Užrakinti'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHelp(true)}
          icon={HelpCircle}
        >
          Pagalba
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
          ref={printAreaRef}
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
          <>
            <RelativePositionDraggableImage
              imageUrl={uploadedImage}
              position={dragPosition} // ⚡ Using local state
              relativePosition={dragRelativePosition} // ⚡ Using local state
              scale={localDesignState.scale}
              opacity={localDesignState.opacity}
              rotation={localDesignState.rotation}
              onPositionChange={handlePositionChange}
              onRelativePositionChange={handleRelativePositionChange}
              onPositionChangeEnd={handlePositionChangeEnd}
              onRelativePositionChangeEnd={handleRelativePositionChangeEnd}
              containerRef={canvasRef}
              printAreaRef={printAreaRef}
              currentView={currentView}
              locked={designState.locked}
            />
            
            {/* Pradinis patarimas kaip redaguoti dizainą */}
            {showInitialTooltip && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-accent-100 text-accent-800 p-3 rounded-lg shadow-lg border border-accent-200 max-w-xs text-center z-30">
                <button 
                  onClick={() => setShowInitialTooltip(false)}
                  className="absolute top-1 right-1 text-accent-500 hover:text-accent-700"
                >
                  <X size={16} />
                </button>
                <p className="text-sm font-medium mb-1">Tempkite logotipą pele!</p>
                <p className="text-xs">Galite keisti dydį, pasukimą ir poziciją naudodami valdiklius viršuje</p>
              </div>
            )}
          </>
        )}
        
        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75 z-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600 mb-2"></div>
            <span className="text-sm text-accent-600">Generuojama peržiūra...</span>
          </div>
        )}
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>X: {Math.round(dragPosition.x)}</span> {/* ⚡ Using local state */}
        <span>Y: {Math.round(dragPosition.y)}</span> {/* ⚡ Using local state */}
        <span>Pasukimas: {Math.round(localDesignState.rotation)}°</span>
      </div>
      
      {/* Derinimo informacija apie santykinę poziciją - rodoma tik kūrimo aplinkoje */}
      {process.env.NODE_ENV === 'development' && dragRelativePosition && ( /* ⚡ Using local state */
        <div className="mt-2 p-2 bg-gray-100 text-xs text-gray-700 rounded">
          <div className="flex justify-between">
            <span>RelX: {Math.round(dragRelativePosition.xPercent)}%</span>
            <span>RelY: {Math.round(dragRelativePosition.yPercent)}%</span>
            <span>{designState.locked ? '🔒 Užrakinta' : '🔓 Atrakinta'}</span>
          </div>
        </div>
      )}

      {/* Derinimo mygtukai rodomi tik kūrimo aplinkoje */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="text-xs"
          >
            {showDebugInfo ? 'Išjungti derinimą' : 'Įjungti derinimą'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={forceRegenerateAllPreviews}
            className="text-xs bg-amber-50"
          >
            Priverstinai regeneruoti peržiūrą
          </Button>
        </div>
      )}
      
      {/* DesignDebugger komponentas rodo tikslią pozicijos informaciją */}
      <DesignDebugger
        designState={designState}
        printArea={printAreas[currentView]}
        containerRef={canvasRef}
        printAreaRef={printAreaRef}
        visible={showDebugInfo}
      />

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
        <p className="mt-2 text-accent-600 font-medium">Logotipas bus pritaikytas punktyrinių linijų zonoje</p>
      </div>
      
      {/* Pagalbos modalas */}
      {showHelp && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Kaip naudotis dizaino įrankiu</h3>
              <button 
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-accent-100 rounded-full p-2 flex-shrink-0">
                  <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Judinti dizainą</h4>
                  <p className="text-sm text-gray-600">Tiesiog tempkite logotipą pele ir padėkite jį norimoje vietoje.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-accent-100 rounded-full p-2 flex-shrink-0">
                  <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Keisti dydį</h4>
                  <p className="text-sm text-gray-600">Naudokite „Dydis&quot; slankiklį, kad padidintumėte arba sumažintumėte logotipą.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-accent-100 rounded-full p-2 flex-shrink-0">
                  <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Pasukti dizainą</h4>
                  <p className="text-sm text-gray-600">Naudokite +15° ir -15° mygtukus, kad pasuktumėte logotipą.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-accent-100 rounded-full p-2 flex-shrink-0">
                  <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Keisti permatomumą</h4>
                  <p className="text-sm text-gray-600">Koreguokite „Permatomumas&quot; slankiklį, kad pakeistumėte logotipo ryškumą.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-accent-100 rounded-full p-2 flex-shrink-0">
                  <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Keisti spaudos vietą</h4>
                  <p className="text-sm text-gray-600">Pasirinkite skirtingas spaudos vietas (priekis, nugara, rankovės) naudodami mygtukus viršuje.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowHelp(false)}>
                Supratau
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}