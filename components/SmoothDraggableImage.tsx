import { useState, useEffect, useRef, useCallback } from 'react'
import type { DesignPosition } from '@/lib/types'

interface SmoothDraggableImageProps {
  imageUrl: string
  position: DesignPosition
  scale: number
  opacity: number
  rotation: number
  onPositionChange: (position: DesignPosition) => void
  containerRef: React.RefObject<HTMLDivElement>
  printAreaRef?: React.RefObject<HTMLDivElement>
}

export default function SmoothDraggableImage({
  imageUrl,
  position,
  scale,
  opacity,
  rotation,
  onPositionChange,
  containerRef,
  printAreaRef
}: SmoothDraggableImageProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [bounds, setBounds] = useState({ left: -1000, top: -1000, right: 1000, bottom: 1000 })
  
  // Performance optimization refs
  const dragStartRef = useRef({ x: 0, y: 0 })
  const currentPositionRef = useRef(position)
  const rafRef = useRef<number>()
  const lastUpdateRef = useRef<number>(0)
  const throttleTime = 16 // ~60fps
  const firstLoadCompleted = useRef(false)
  const imageLoadedRef = useRef(false)

  // Tikslus spausdinimo zonos centro nustatymas
  const getExactPrintAreaCenter = useCallback(() => {
    if (!printAreaRef?.current || !containerRef.current) {
      return { x: 0, y: 0 };
    }
    
    // Gauname konteinerio ir spausdinimo zonos pozicijas
    const container = containerRef.current.getBoundingClientRect();
    const printArea = printAreaRef.current.getBoundingClientRect();
    
    // Konvertuojame printArea koordinates į konteinerio vidaus koordinates
    const printAreaCenterX = printArea.left - container.left + printArea.width / 2;
    const printAreaCenterY = printArea.top - container.top + printArea.height / 2;
    
    // Apskaičiuojame atstumą nuo konteinerio centro iki printArea centro
    const containerCenterX = container.width / 2;
    const containerCenterY = container.height / 2;
    
    // Grąžiname poslinkį, reikalingą patalpinti elementą printArea centre
    return {
      x: printAreaCenterX - containerCenterX,
      y: printAreaCenterY - containerCenterY
    };
  }, [printAreaRef, containerRef]);

  // Pradinės pozicijos nustatymas
  const setInitialPosition = useCallback(() => {
    // Jei jau nustatyta, nebenustatom
    if (firstLoadCompleted.current) return;
    
    const centerOffset = getExactPrintAreaCenter();
    console.log("Setting initial position:", centerOffset);
    
    // Nustatome poziciją į printArea centrą
    onPositionChange(centerOffset);
    currentPositionRef.current = centerOffset;
    firstLoadCompleted.current = true;
    
    // Iš karto atnaujinkime DOM, kad nebūtų mirkčiojimo
    if (elementRef.current) {
      elementRef.current.style.transform = `
        translate(-50%, -50%)
        translate3d(${centerOffset.x}px, ${centerOffset.y}px, 0)
        scale(${scale})
        rotate(${rotation}deg)
      `;
    }
  }, [getExactPrintAreaCenter, onPositionChange, scale, rotation]);

  // Ribų nustatymas pagal spausdinimo zoną
  const updateBounds = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    
    // Nustatome ribas pagal spausdinimo zoną, jei ji egzistuoja
    if (printAreaRef?.current) {
      const printArea = printAreaRef.current.getBoundingClientRect();
      
      // Apskaičiuojame ribas, kad elementas galėtų būti tempiamas, bet išliktų arti spausdinimo zonos
      // Pridedame papildomą atstumą, kad būtų galima šiek tiek atitraukti nuo centro, jei reikia
      const margin = Math.max(printArea.width, printArea.height) * 0.5;
      
      // Spausdinimo zonos koordinatės konteinerio sistemoje
      const printAreaLeft = printArea.left - container.left;
      const printAreaTop = printArea.top - container.top;
      const printAreaRight = printAreaLeft + printArea.width;
      const printAreaBottom = printAreaTop + printArea.height;
      
      // Konteinerio centro koordinatės
      const containerCenterX = container.width / 2;
      const containerCenterY = container.height / 2;
      
      // Ribos, nustatomos nuo spausdinimo zonos
      setBounds({
        left: (printAreaLeft + printArea.width / 2) - containerCenterX - margin,
        top: (printAreaTop + printArea.height / 2) - containerCenterY - margin,
        right: (printAreaLeft + printArea.width / 2) - containerCenterX + margin,
        bottom: (printAreaTop + printArea.height / 2) - containerCenterY + margin
      });
    } else {
      // Numatytosios ribos, jei nėra spausdinimo zonos
      setBounds({
        left: -container.width / 2,
        top: -container.height / 2,
        right: container.width / 2,
        bottom: container.height / 2
      });
    }
  }, [containerRef, printAreaRef]);

  // Elemento pozicijos atnaujinimas
  const updatePosition = useCallback((x: number, y: number) => {
    if (!elementRef.current) return;
    
    // Taikome ribas
    const boundedX = Math.max(bounds.left, Math.min(bounds.right, x));
    const boundedY = Math.max(bounds.top, Math.min(bounds.bottom, y));
    
    // Tiesiogiai atnaujiname elemento poziciją sklandžiam judėjimui
    elementRef.current.style.transform = `
      translate(-50%, -50%)
      translate3d(${boundedX}px, ${boundedY}px, 0)
      scale(${scale})
      rotate(${rotation}deg)
    `;
    
    // Saugome dabartinę poziciją
    currentPositionRef.current = { x: boundedX, y: boundedY };
    
    // Ribojame atnaujinimų skaičių
    const now = performance.now();
    if (now - lastUpdateRef.current >= throttleTime) {
      onPositionChange({ x: boundedX, y: boundedY });
      lastUpdateRef.current = now;
    }
  }, [bounds, scale, rotation, onPositionChange]);

  // Pelės įvykių valdikliai
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    // Saugome pradinę poziciją
    dragStartRef.current = {
      x: e.clientX - currentPositionRef.current.x,
      y: e.clientY - currentPositionRef.current.y
    };
    
    // Optimizuojame tempimui
    if (elementRef.current) {
      elementRef.current.classList.add('dragging', 'active-dragging', 'no-transition');
      elementRef.current.classList.remove('smooth-transition');
      elementRef.current.style.willChange = 'transform';
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    // Apskaičiuojame naują poziciją
    const x = e.clientX - dragStartRef.current.x;
    const y = e.clientY - dragStartRef.current.y;
    
    // Naudojame requestAnimationFrame sklandžiam atnaujinimui
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      updatePosition(x, y);
    });
  }, [isDragging, updatePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    
    // Valome
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    if (elementRef.current) {
      elementRef.current.classList.remove('dragging', 'active-dragging', 'no-transition');
      elementRef.current.classList.add('smooth-transition');
      elementRef.current.style.willChange = 'auto';
    }
    
    // Galutinis pozicijos atnaujinimas
    onPositionChange(currentPositionRef.current);
  }, [onPositionChange]);

  // Lietimo įvykių valdikliai
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length !== 1) return;
    
    setIsDragging(true);
    
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX - currentPositionRef.current.x,
      y: touch.clientY - currentPositionRef.current.y
    };
    
    if (elementRef.current) {
      elementRef.current.classList.add('dragging', 'active-dragging', 'no-transition');
      elementRef.current.classList.remove('smooth-transition');
      elementRef.current.style.willChange = 'transform';
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const x = touch.clientX - dragStartRef.current.x;
    const y = touch.clientY - dragStartRef.current.y;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      updatePosition(x, y);
    });
  }, [isDragging, updatePosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    if (elementRef.current) {
      elementRef.current.classList.remove('dragging', 'active-dragging', 'no-transition');
      elementRef.current.classList.add('smooth-transition');
      elementRef.current.style.willChange = 'auto';
    }
    
    onPositionChange(currentPositionRef.current);
  }, [onPositionChange]);

  // Patikrinkime ribas ir atnaujiname jas, kai pasikeičia elementai
  useEffect(() => {
    // Atnaujiname ribas
    updateBounds();
    
    // Pridedame įvykio klausymą lango dydžio pakeitimui
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, [updateBounds]);

  // Pozicijos nustatymas pirmo įkėlimo metu
  useEffect(() => {
    // Jei vaizdas jau įkeltas, nustatome pradinę poziciją
    if (imageLoadedRef.current && !firstLoadCompleted.current) {
      setInitialPosition();
    }

    // Kai pasikeičia priklausomybės, galime iš naujo nustatyti poziciją
    if (imageLoadedRef.current) {
      // Atnaujinkime ribas ir poziciją su uždelsimu
      setTimeout(() => {
        updateBounds();
        // Tik pirmo krovimo metu nustatome į centrą
        if (!firstLoadCompleted.current) {
          setInitialPosition();
        }
      }, 100);
    }
  }, [printAreaRef, containerRef, setInitialPosition, updateBounds]);

  // Įvykių valdiklių pridėjimas/pašalinimas
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Sinchronizavimas su išoriniais pozicijos pakeitimais
  useEffect(() => {
    if (!isDragging) {
      currentPositionRef.current = position;
      if (elementRef.current) {
        elementRef.current.style.transform = `
          translate(-50%, -50%)
          translate3d(${position.x}px, ${position.y}px, 0)
          scale(${scale})
          rotate(${rotation}deg)
        `;
      }
    }
  }, [position, scale, rotation, isDragging]);

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-grab performance-boost draggable-image smooth-transition
        ${isDragging ? 'cursor-grabbing z-10 dragging active-dragging no-transition' : ''}`}
      style={{
        transform: `translate(-50%, -50%) translate3d(${position.x}px, ${position.y}px, 0) scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        transformOrigin: 'center',
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
          imageLoadedRef.current = true;
          
          // Kai vaizdas įkeltas, nustatome pradinę poziciją
          if (!firstLoadCompleted.current && containerRef.current && printAreaRef?.current) {
            // Uždelskime truputį, kad įsitikintume, jog DOM atnaujintas
            setTimeout(() => {
              updateBounds();
              setInitialPosition();
            }, 50);
          }
        }}
      />
    </div>
  );
}