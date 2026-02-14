// filepath: /workspaces/simka/components/RelativePositionDraggableImage.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { DesignPosition } from '@/lib/types'

interface RelativePositionDraggableImageProps {
  imageUrl: string
  position: DesignPosition  // Vis dar naudojame pixelius įvestims dėl suderinamumo
  relativePosition?: { xPercent: number, yPercent: number }  // Nauja santykinio pozicionavimo savybė
  scale: number
  opacity: number
  rotation: number
  onPositionChange: (position: DesignPosition) => void
  onRelativePositionChange?: (position: { xPercent: number, yPercent: number }) => void
  onPositionChangeEnd?: (position: DesignPosition) => void
  onRelativePositionChangeEnd?: (position: { xPercent: number, yPercent: number }) => void
  containerRef: React.RefObject<HTMLDivElement>
  printAreaRef?: React.RefObject<HTMLDivElement>
  currentView?: string
  locked?: boolean  // Naujas užrakinimo parametras
}

export default function RelativePositionDraggableImage({
  imageUrl,
  position,
  relativePosition,
  scale,
  opacity,
  rotation,
  onPositionChange,
  onRelativePositionChange,
  onPositionChangeEnd,
  onRelativePositionChangeEnd,
  containerRef,
  printAreaRef,
  currentView,
  locked = false
}: RelativePositionDraggableImageProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [bounds, setBounds] = useState({ left: 0, top: 0, right: 100, bottom: 100 })
  
  // Performance optimization refs
  const dragStartRef = useRef({ x: 0, y: 0 })
  const currentPositionRef = useRef(position)
  const currentRelativePositionRef = useRef(relativePosition || { xPercent: 50, yPercent: 50 })
  const rafRef = useRef<number>()
  const lastUpdateRef = useRef<number>(0)
  const throttleTime = 50 // ms for throttling
  const firstLoadCompleted = useRef(false)
  const imageLoadedRef = useRef(false)
  const shouldSkipPropUpdate = useRef(false)
  const previousView = useRef<string | undefined>(currentView)
  const positionChangeTimeout = useRef<NodeJS.Timeout | null>(null)
  const containerDimensionsRef = useRef<{ width: number, height: number }>({ width: 0, height: 0 })

  // Konteinerio dimensijų atnaujinimas
  const updateContainerDimensions = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    containerDimensionsRef.current = {
      width: container.width,
      height: container.height
    };
  }, [containerRef]);

  // Konvertuoja santykinę poziciją į absoliučią
  const relativeToAbsolutePosition = useCallback((relPos: { xPercent: number, yPercent: number }): DesignPosition => {
    const { width, height } = containerDimensionsRef.current;
    
    // Apskaičiuojame absoliučias koordinates centruoto elemento atžvilgiu
    const x = (relPos.xPercent / 100 * width) - (width / 2);
    const y = (relPos.yPercent / 100 * height) - (height / 2);
    
    return { x, y };
  }, []);

  // Konvertuoja absoliučią poziciją į santykinę
  const absoluteToRelativePosition = useCallback((absPos: DesignPosition): { xPercent: number, yPercent: number } => {
    if (!containerRef.current || !printAreaRef?.current) {
      return { xPercent: 50, yPercent: 50 };
    }
    
    const container = containerRef.current.getBoundingClientRect();
    const printArea = printAreaRef.current.getBoundingClientRect();
    
    // PATOBULINTA: Skaičiuojame santykinę poziciją printArea ribose
    // Ši formulė užtikrina, kad pozicija būtų išreikšta procentais nuo printArea viršutinio kairiojo kampo
    const printAreaLeft = printArea.left - container.left;
    const printAreaTop = printArea.top - container.top;
    
    // Skaičiuojame logotipo centro poziciją container koordinačių sistemoje
    const logoCenter = {
      x: absPos.x + (container.width / 2), // Pridedame pusę container pločio, nes absPos yra atstumas nuo centro
      y: absPos.y + (container.height / 2)  // Pridedame pusę container aukščio, nes absPos yra atstumas nuo centro
    };
    
    // Skaičiuojame santykinę poziciją printArea viduje
    const xPercent = ((logoCenter.x - printAreaLeft) / printArea.width) * 100;
    const yPercent = ((logoCenter.y - printAreaTop) / printArea.height) * 100;
    
    return { 
      xPercent: Math.min(100, Math.max(0, xPercent)), 
      yPercent: Math.min(100, Math.max(0, yPercent)) 
    };
  }, [containerRef, printAreaRef]);

  // Tikslus spausdinimo zonos centro nustatymas - dabar su santykine pozicija
  const getExactPrintAreaCenter = useCallback(() => {
    if (!printAreaRef?.current || !containerRef.current) {
      return { x: 0, y: 0, xPercent: 50, yPercent: 50 };
    }
    
    updateContainerDimensions();
    
    // Gauname konteinerio ir spausdinimo zonos pozicijas
    const container = containerRef.current.getBoundingClientRect();
    const printArea = printAreaRef.current.getBoundingClientRect();
    
    // Spausdinimo zonos centro koordinatės konteinerio atžvilgiu
    const printAreaCenterX = (printArea.left - container.left) + (printArea.width / 2);
    const printAreaCenterY = (printArea.top - container.top) + (printArea.height / 2);
    
    // Santykinės koordinatės
    const xPercent = (printAreaCenterX / container.width) * 100;
    const yPercent = (printAreaCenterY / container.height) * 100;
    
    // Absoliučios koordinatės centruotam objektui
    const x = printAreaCenterX - (container.width / 2);
    const y = printAreaCenterY - (container.height / 2);
    
    return { x, y, xPercent, yPercent };
  }, [printAreaRef, containerRef, updateContainerDimensions]);

  // Pradinės pozicijos nustatymas su santykine pozicija
  const setInitialPosition = useCallback(() => {
    // Jei jau nustatyta, nebenustatom
    if (firstLoadCompleted.current) return;
    
    // Gaukime tikslią spausdinimo zonos centro poziciją
    const { x, y, xPercent, yPercent } = getExactPrintAreaCenter();
    
    // Nustatome poziciją ir santykinę poziciją
    currentPositionRef.current = { x, y };
    currentRelativePositionRef.current = { xPercent, yPercent };
    firstLoadCompleted.current = true;
    
    // Iš karto atnaujinkime DOM, kad nebūtų mirkčiojimo
    if (elementRef.current) {
      elementRef.current.style.transform = `
        translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0)
        scale(${scale})
        rotate(${rotation}deg)
      `;
    }
    
    // Informuojame tėvinį komponentą apie pradinę poziciją
    shouldSkipPropUpdate.current = true;
    onPositionChange({ x, y });
    
    if (onRelativePositionChange) {
      onRelativePositionChange({ xPercent, yPercent });
    }
  }, [getExactPrintAreaCenter, onPositionChange, onRelativePositionChange, scale, rotation]);

  // Ribų nustatymas pagal spausdinimo zoną - su santykinėmis ribomis
  const updateBounds = useCallback(() => {
    if (!containerRef.current) return;
    
    updateContainerDimensions();
    const container = containerRef.current.getBoundingClientRect();
    
    // Nustatome ribas pagal spausdinimo zoną arba konteinerį
    if (printAreaRef?.current) {
      const printArea = printAreaRef.current.getBoundingClientRect();
      
      // Dinamiškai apskaičiuojame leistino judėjimo ribas
      const margin = Math.max(printArea.width, printArea.height) * 0.5;
      
      // Spausdinimo zonos koordinatės konteinerio atžvilgiu
      const printAreaLeft = printArea.left - container.left;
      const printAreaTop = printArea.top - container.top;
      
      // Santykinės ribos procentais
      setBounds({
        left: Math.max(0, ((printAreaLeft - margin) / container.width) * 100),
        top: Math.max(0, ((printAreaTop - margin) / container.height) * 100),
        right: Math.min(100, ((printAreaLeft + printArea.width + margin) / container.width) * 100),
        bottom: Math.min(100, ((printAreaTop + printArea.height + margin) / container.height) * 100)
      });
    } else {
      // Numatytosios ribos visam konteineriui
      setBounds({ left: 0, top: 0, right: 100, bottom: 100 });
    }
  }, [containerRef, printAreaRef, updateContainerDimensions]);

  // Elemento pozicijos atnaujinimas su santykine pozicija
  const updateElementPosition = useCallback((absPos: DesignPosition, relPos: { xPercent: number, yPercent: number }) => {
    if (!elementRef.current) return;
    
    // Tiesiogiai atnaujiname elemento poziciją sklandžiam judėjimui
    elementRef.current.style.transform = `
      translate3d(calc(-50% + ${absPos.x}px), calc(-50% + ${absPos.y}px), 0) 
      scale(${scale}) 
      rotate(${rotation}deg)
    `;
    
    // Saugome dabartinę poziciją
    currentPositionRef.current = absPos;
    currentRelativePositionRef.current = relPos;
    
    // Atšaukiame ankstesnį timeout, jei toks buvo
    if (positionChangeTimeout.current) {
      clearTimeout(positionChangeTimeout.current);
    }
    
    // Šiek tiek optimizuojame atnaujinimus, kad išvengti pernelyg dažnų atnaujinimų
    const now = performance.now();
    if (now - lastUpdateRef.current >= throttleTime) {
      shouldSkipPropUpdate.current = true;
      lastUpdateRef.current = now;
      onPositionChange(absPos);
      
      if (onRelativePositionChange) {
        onRelativePositionChange(relPos);
      }
    }
  }, [scale, rotation, onPositionChange, onRelativePositionChange, throttleTime]);

  // Pozicijos atnaujinimas iš santykinės pozicijos
  const updatePositionFromRelative = useCallback((xPercent: number, yPercent: number) => {
    // Ribojame santykinę poziciją
    const boundedXPercent = Math.max(bounds.left, Math.min(bounds.right, xPercent));
    const boundedYPercent = Math.max(bounds.top, Math.min(bounds.bottom, yPercent));
    
    // Konvertuojame į absoliučią poziciją
    const absPos = relativeToAbsolutePosition({ xPercent: boundedXPercent, yPercent: boundedYPercent });
    
    // Atnaujiname elemento poziciją
    updateElementPosition(absPos, { xPercent: boundedXPercent, yPercent: boundedYPercent });
  }, [bounds, relativeToAbsolutePosition, updateElementPosition]);

  // Pozicijos atnaujinimas iš absoliučios pozicijos
  const updatePositionFromAbsolute = useCallback((x: number, y: number) => {
    // Konvertuojame į santykinę poziciją
    const relPos = absoluteToRelativePosition({ x, y });
    
    // Ribojame santykinę poziciją
    const boundedXPercent = Math.max(bounds.left, Math.min(bounds.right, relPos.xPercent));
    const boundedYPercent = Math.max(bounds.top, Math.min(bounds.bottom, relPos.yPercent));
    
    // Konvertuojame atgal į absoliučią poziciją
    const boundedAbsPos = relativeToAbsolutePosition({ xPercent: boundedXPercent, yPercent: boundedYPercent });
    
    // Atnaujiname elemento poziciją
    updateElementPosition(boundedAbsPos, { xPercent: boundedXPercent, yPercent: boundedYPercent });
  }, [absoluteToRelativePosition, bounds, relativeToAbsolutePosition, updateElementPosition]);

  // Pelės įvykių valdikliai
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (locked) return; // Jei užrakinta, nereaguojame į pelės paspaudimą
    
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
  }, [locked]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || locked) return;
    
    // Apskaičiuojame naują absoliučią poziciją
    const x = e.clientX - dragStartRef.current.x;
    const y = e.clientY - dragStartRef.current.y;
    
    // Naudojame requestAnimationFrame sklandžiam atnaujinimui
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      updatePositionFromAbsolute(x, y);
    });
  }, [isDragging, locked, updatePositionFromAbsolute]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
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
    const finalPosition = currentPositionRef.current;
    const finalRelativePosition = currentRelativePositionRef.current;
    
    // Atidedame galutinį pozicijos atnaujinimą
    positionChangeTimeout.current = setTimeout(() => {
      shouldSkipPropUpdate.current = true;
      
      if (onPositionChangeEnd) {
        onPositionChangeEnd(finalPosition);
      } else {
        onPositionChange(finalPosition);
      }
      
      if (onRelativePositionChangeEnd) {
        onRelativePositionChangeEnd(finalRelativePosition);
      } else if (onRelativePositionChange) {
        onRelativePositionChange(finalRelativePosition);
      }
      
      positionChangeTimeout.current = null;
    }, 50);
  }, [isDragging, onPositionChange, onPositionChangeEnd, onRelativePositionChange, onRelativePositionChangeEnd]);

  // Lietimo įvykių valdikliai
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (locked) return; // Jei užrakinta, nereaguojame į lietimą
    
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
  }, [locked]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1 || locked) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const x = touch.clientX - dragStartRef.current.x;
    const y = touch.clientY - dragStartRef.current.y;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      updatePositionFromAbsolute(x, y);
    });
  }, [isDragging, locked, updatePositionFromAbsolute]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    if (elementRef.current) {
      elementRef.current.classList.remove('dragging', 'active-dragging', 'no-transition');
      elementRef.current.classList.add('smooth-transition');
      elementRef.current.style.willChange = 'auto';
    }
    
    const finalPosition = currentPositionRef.current;
    const finalRelativePosition = currentRelativePositionRef.current;
    
    // Atidedame galutinį pozicijos atnaujinimą
    positionChangeTimeout.current = setTimeout(() => {
      shouldSkipPropUpdate.current = true;
      
      if (onPositionChangeEnd) {
        onPositionChangeEnd(finalPosition);
      } else {
        onPositionChange(finalPosition);
      }
      
      if (onRelativePositionChangeEnd) {
        onRelativePositionChangeEnd(finalRelativePosition);
      } else if (onRelativePositionChange) {
        onRelativePositionChange(finalRelativePosition);
      }
      
      positionChangeTimeout.current = null;
    }, 50);
  }, [isDragging, onPositionChange, onPositionChangeEnd, onRelativePositionChange, onRelativePositionChangeEnd]);

  // Patikrinkime ribas ir atnaujiname jas, kai pasikeičia elementai
  useEffect(() => {
    // Atnaujiname konteinerio dimensijas ir ribas
    updateContainerDimensions();
    updateBounds();
    
    // Pridedame įvykio klausymą lango dydžio pakeitimui
    window.addEventListener('resize', () => {
      updateContainerDimensions();
      updateBounds();
      
      // Atkuriame poziciją iš santykinės pozicijos po dydžio pakeitimo
      if (currentRelativePositionRef.current) {
        const absPos = relativeToAbsolutePosition(currentRelativePositionRef.current);
        updateElementPosition(absPos, currentRelativePositionRef.current);
      }
    });
    
    return () => {
      window.removeEventListener('resize', updateBounds);
    };
  }, [updateBounds, updateContainerDimensions, relativeToAbsolutePosition, updateElementPosition]);
  
  // Sekame vaizdo pasikeitimus - kai pakeičiamas vaizdas, atnaujinkime poziciją
  useEffect(() => {
    if (currentView && previousView.current !== currentView) {
      // Vaizdas pasikeitė, atnaujinkime ribas
      updateContainerDimensions();
      updateBounds();
      // Išsaugome naują vaizdą
      previousView.current = currentView;
    }
  }, [currentView, updateBounds, updateContainerDimensions]);

  // Pozicijos nustatymas pirmo įkėlimo metu
  useEffect(() => {
    // Jei vaizdas jau įkeltas, nustatome pradinę poziciją
    if (imageLoadedRef.current && !firstLoadCompleted.current) {
      updateContainerDimensions();
      setInitialPosition();
    }

    // Kai pasikeičia priklausomybės, atnaujiname ribas
    if (imageLoadedRef.current) {
      updateContainerDimensions();
      updateBounds();
    }
  }, [printAreaRef?.current, containerRef.current, setInitialPosition, updateBounds, updateContainerDimensions]);

  // Įvykių valdiklių pridėjimas/pašalinimas
  useEffect(() => {
    if (isDragging && !locked) {
      document.addEventListener('mousemove', handleMouseMove);
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
      
      if (positionChangeTimeout.current) {
        clearTimeout(positionChangeTimeout.current);
      }
    };
  }, [isDragging, locked, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Sinchronizavimas su išoriniais pozicijos pakeitimais
  useEffect(() => {
    // Jei šiuo metu vyksta pozicijos atnaujinimas iš vidaus, praleiskime išorinį atnaujinimą
    if (shouldSkipPropUpdate.current) {
      shouldSkipPropUpdate.current = false;
      return;
    }
    
    // Jei nesikeičia pozicija ir netempiama, neatnaujinkime
    if (
      currentPositionRef.current.x === position.x && 
      currentPositionRef.current.y === position.y &&
      !isDragging
    ) {
      return;
    }
    
    // Kitais atvejais atnaujinkime poziciją
    if (!isDragging) {
      currentPositionRef.current = position;
      
      // Atnaujinkime ir santykinę poziciją
      if (!relativePosition) {
        currentRelativePositionRef.current = absoluteToRelativePosition(position);
      }
      
      if (elementRef.current) {
        elementRef.current.style.transform = `translate3d(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px), 0) scale(${scale}) rotate(${rotation}deg)`;
      }
    }
  }, [position, scale, rotation, isDragging, relativePosition, absoluteToRelativePosition]);

  // Sinchronizavimas su išoriniais santykinės pozicijos pakeitimais
  useEffect(() => {
    if (!relativePosition) return;
    
    // Jei šiuo metu vyksta pozicijos atnaujinimas iš vidaus, praleiskime
    if (shouldSkipPropUpdate.current) {
      shouldSkipPropUpdate.current = false;
      return;
    }
    
    // Jei nesikeičia santykinė pozicija ir netempiama, neatnaujinkime
    if (
      currentRelativePositionRef.current.xPercent === relativePosition.xPercent && 
      currentRelativePositionRef.current.yPercent === relativePosition.yPercent &&
      !isDragging
    ) {
      return;
    }
    
    // Kitais atvejais atnaujinkime poziciją iš santykinės
    if (!isDragging) {
      currentRelativePositionRef.current = relativePosition;
      const absPos = relativeToAbsolutePosition(relativePosition);
      currentPositionRef.current = absPos;
      
      if (elementRef.current) {
        elementRef.current.style.transform = `translate3d(calc(-50% + ${absPos.x}px), calc(-50% + ${absPos.y}px), 0) scale(${scale}) rotate(${rotation}deg)`;
      }
    }
  }, [relativePosition, isDragging, relativeToAbsolutePosition, scale, rotation]);

  // Užkrovus vaizdą, nustatome pradinę poziciją ir atnaujiname ribas
  const handleImageLoad = useCallback(() => {
    imageLoadedRef.current = true;
    
    if (!firstLoadCompleted.current) {
      requestAnimationFrame(() => {
        updateContainerDimensions();
        updateBounds();
        setInitialPosition();
      });
    }
  }, [updateBounds, setInitialPosition, updateContainerDimensions]);

  // Valyti resursus, kai komponentas sunaikinamas
  useEffect(() => {
    return () => {
      if (positionChangeTimeout.current) {
        clearTimeout(positionChangeTimeout.current);
      }
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={elementRef}
      className={`absolute ${locked ? 'cursor-default' : 'cursor-grab'} draggable-image ${isDragging ? 'cursor-grabbing z-10 dragging' : 'smooth-transition'}`}
      style={{
        transform: `translate3d(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px), 0) scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        transformOrigin: 'center',
        touchAction: 'none',
        top: '50%',
        left: '50%',
        willChange: isDragging ? 'transform' : 'auto'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <img
        ref={imageRef}
        src={imageUrl}
        crossOrigin="anonymous"
        alt="Dizaino elementas"
        className="max-w-[200px] max-h-[200px] pointer-events-none select-none"
        draggable={false}
        onLoad={handleImageLoad}
      />
      
      {/* Užrakinimo indikatorius */}
      {locked && (
        <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}