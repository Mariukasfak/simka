"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { DesignPosition } from "@/lib/types";
import { PRINT_AREAS } from "@/lib/constants";

interface SmoothDraggableImageProps {
  imageUrl: string;
  position: DesignPosition;
  scale: number;
  opacity: number;
  rotation: number;
  onPositionChange: (position: DesignPosition) => void;
  onPositionChangeEnd?: (position: DesignPosition) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  printAreaRef?: React.RefObject<HTMLDivElement>;
  currentView?: string; // Pridėta nauja savybė, kad žinotume, kuris vaizdas rodomas
}

export default function SmoothDraggableImage({
  imageUrl,
  position,
  scale,
  opacity,
  rotation,
  onPositionChange,
  onPositionChangeEnd,
  containerRef,
  printAreaRef,
  currentView,
}: SmoothDraggableImageProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [bounds, setBounds] = useState({
    left: -1000,
    top: -1000,
    right: 1000,
    bottom: 1000,
  });

  // Performance optimization refs
  const dragStartRef = useRef({ x: 0, y: 0 });
  const currentPositionRef = useRef(position);
  const rafRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const throttleTime = 50; // ms for throttling
  const firstLoadCompleted = useRef(false);
  const imageLoadedRef = useRef(false);
  const shouldSkipPropUpdate = useRef(false);
  const previousView = useRef<string | undefined>(currentView);
  const positionChangeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Tikslus spausdinimo zonos centro nustatymas - dabar atsižvelgia į spausdinimo ploto dydį
  const getExactPrintAreaCenter = useCallback(() => {
    if (!printAreaRef?.current || !containerRef.current) {
      return { x: 0, y: 0 };
    }

    // Gauname konteinerio ir spausdinimo zonos pozicijas
    const container = containerRef.current.getBoundingClientRect();
    const printArea = printAreaRef.current.getBoundingClientRect();

    // Spausdinimo zonos centro koordinatės konteinerio atžvilgiu
    const printAreaCenterX =
      printArea.left - container.left + printArea.width / 2;
    const printAreaCenterY =
      printArea.top - container.top + printArea.height / 2;

    // Konteinerio centro koordinatės
    const containerCenterX = container.width / 2;
    const containerCenterY = container.height / 2;

    return {
      x: printAreaCenterX - containerCenterX,
      y: printAreaCenterY - containerCenterY,
    };
  }, [printAreaRef, containerRef]);

  // Pradinės pozicijos nustatymas - ištobulintas, kad geriau veiktų su skirtingais rodiniais
  const setInitialPosition = useCallback(() => {
    // Jei jau nustatyta, nebenustatom
    if (firstLoadCompleted.current) return;

    // Gaukime tikslią spausdinimo zonos centro poziciją
    const centerOffset = getExactPrintAreaCenter();

    // Nustatome poziciją į printArea centrą, bet neatnaujinsime state čia
    // tik atnaujinsime DOM elementą ir ref
    currentPositionRef.current = centerOffset;
    firstLoadCompleted.current = true;

    // Iš karto atnaujinkime DOM, kad nebūtų mirkčiojimo
    if (elementRef.current) {
      elementRef.current.style.transform = `
        translate3d(calc(-50% + ${centerOffset.x}px), calc(-50% + ${centerOffset.y}px), 0)
        scale(${scale})
        rotate(${rotation}deg)
      `;
    }

    // Informuojame tėvinį komponentą apie pradinę poziciją, bet tik kartą
    shouldSkipPropUpdate.current = true;
    onPositionChange(centerOffset);
  }, [getExactPrintAreaCenter, onPositionChange, scale, rotation]);

  // Ribų nustatymas pagal spausdinimo zoną - patobulinta versija su santykiniu dydžiu
  const updateBounds = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();

    // Nustatome ribas pagal spausdinimo zoną, jei ji egzistuoja
    if (printAreaRef?.current) {
      const printArea = printAreaRef.current.getBoundingClientRect();

      // Dinamiškai apskaičiuojame leistino judėjimo ribas
      // Dabar atsižvelgiame į spausdinimo ploto dydį ir logotipo skalę
      const margin =
        Math.max(printArea.width, printArea.height) *
        Math.max(0.4, scale * 0.3);

      // Spausdinimo zonos koordinatės konteinerio sistemoje
      const printAreaLeft = printArea.left - container.left;
      const printAreaTop = printArea.top - container.top;
      const printAreaRight = printAreaLeft + printArea.width;
      const printAreaBottom = printAreaTop + printArea.height;

      // Konteinerio centro koordinatės
      const containerCenterX = container.width / 2;
      const containerCenterY = container.height / 2;

      // Dabar ribos atsižvelgia ir į spausdinimo zoną, ir į logotipo mastelį
      setBounds({
        left: printAreaLeft + printArea.width / 2 - containerCenterX - margin,
        top: printAreaTop + printArea.height / 2 - containerCenterY - margin,
        right: printAreaLeft + printArea.width / 2 - containerCenterX + margin,
        bottom: printAreaTop + printArea.height / 2 - containerCenterY + margin,
      });
    } else {
      // Numatytosios ribos, jei nėra spausdinimo zonos
      setBounds({
        left: -container.width / 2,
        top: -container.height / 2,
        right: container.width / 2,
        bottom: container.height / 2,
      });
    }
  }, [containerRef, printAreaRef, scale]);

  // Elemento pozicijos atnaujinimas - dabar su geresnėmis ribomis
  const updatePosition = useCallback(
    (x: number, y: number) => {
      if (!elementRef.current) return;

      // Taikome ribas
      const boundedX = Math.max(bounds.left, Math.min(bounds.right, x));
      const boundedY = Math.max(bounds.top, Math.min(bounds.bottom, y));

      // Tiesiogiai atnaujiname elemento poziciją sklandžiam judėjimui
      elementRef.current.style.transform = `translate3d(calc(-50% + ${boundedX}px), calc(-50% + ${boundedY}px), 0) scale(${scale}) rotate(${rotation}deg)`;

      // Saugome dabartinę poziciją
      currentPositionRef.current = { x: boundedX, y: boundedY };

      // Atšaukiame ankstesnį timeout, jei toks buvo
      if (positionChangeTimeout.current) {
        clearTimeout(positionChangeTimeout.current);
      }

      // Šiek tiek optimizuojame atnaujinimus, kad išvengti begalinio ciklo
      const now = performance.now();
      if (now - lastUpdateRef.current >= throttleTime) {
        shouldSkipPropUpdate.current = true;
        lastUpdateRef.current = now;
        onPositionChange({ x: boundedX, y: boundedY });
      }
    },
    [bounds, scale, rotation, onPositionChange, throttleTime],
  );

  // Pelės įvykių valdikliai
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    // Saugome pradinę poziciją
    dragStartRef.current = {
      x: e.clientX - currentPositionRef.current.x,
      y: e.clientY - currentPositionRef.current.y,
    };

    // Optimizuojame tempimui
    if (elementRef.current) {
      elementRef.current.classList.add(
        "dragging",
        "active-dragging",
        "no-transition",
      );
      elementRef.current.classList.remove("smooth-transition");
      elementRef.current.style.willChange = "transform";
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
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
    },
    [isDragging, updatePosition],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);

    // Valome
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    if (elementRef.current) {
      elementRef.current.classList.remove(
        "dragging",
        "active-dragging",
        "no-transition",
      );
      elementRef.current.classList.add("smooth-transition");
      elementRef.current.style.willChange = "auto";
    }

    // Galutinis pozicijos atnaujinimas
    const finalPosition = currentPositionRef.current;

    // Atidedame galutinį pozicijos atnaujinimą, kad išvengti rendarinimų konfliktų
    positionChangeTimeout.current = setTimeout(() => {
      if (onPositionChangeEnd) {
        shouldSkipPropUpdate.current = true;
        onPositionChangeEnd(finalPosition);
      } else {
        shouldSkipPropUpdate.current = true;
        onPositionChange(finalPosition);
      }
      positionChangeTimeout.current = null;
    }, 50);
  }, [onPositionChange, onPositionChangeEnd]);

  // Lietimo įvykių valdikliai
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length !== 1) return;

    setIsDragging(true);

    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX - currentPositionRef.current.x,
      y: touch.clientY - currentPositionRef.current.y,
    };

    if (elementRef.current) {
      elementRef.current.classList.add(
        "dragging",
        "active-dragging",
        "no-transition",
      );
      elementRef.current.classList.remove("smooth-transition");
      elementRef.current.style.willChange = "transform";
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
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
    },
    [isDragging, updatePosition],
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    if (elementRef.current) {
      elementRef.current.classList.remove(
        "dragging",
        "active-dragging",
        "no-transition",
      );
      elementRef.current.classList.add("smooth-transition");
      elementRef.current.style.willChange = "auto";
    }

    const finalPosition = currentPositionRef.current;

    // Atidedame galutinį pozicijos atnaujinimą
    positionChangeTimeout.current = setTimeout(() => {
      if (onPositionChangeEnd) {
        shouldSkipPropUpdate.current = true;
        onPositionChangeEnd(finalPosition);
      } else {
        shouldSkipPropUpdate.current = true;
        onPositionChange(finalPosition);
      }
      positionChangeTimeout.current = null;
    }, 50);
  }, [onPositionChange, onPositionChangeEnd]);

  // Patikrinkime ribas ir atnaujiname jas, kai pasikeičia elementai
  useEffect(() => {
    // Atnaujiname ribas
    updateBounds();

    // Pridedame įvykio klausymą lango dydžio pakeitimui
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, [updateBounds]);

  // Sekame vaizdo pasikeitimus - kai pakeičiamas vaizdas, atnaujinkime poziciją
  useEffect(() => {
    if (currentView && previousView.current !== currentView) {
      // Vaizdas pasikeitė, atnaujinkime ribas
      updateBounds();
      // Išsaugome naują vaizdą
      previousView.current = currentView;
    }
  }, [currentView, updateBounds]);

  // Pozicijos nustatymas pirmo įkėlimo metu
  useEffect(() => {
    // Jei vaizdas jau įkeltas, nustatome pradinę poziciją
    if (imageLoadedRef.current && !firstLoadCompleted.current) {
      setInitialPosition();
    }

    // Kai pasikeičia priklausomybės, atnaujiname ribas, bet ne poziciją
    if (imageLoadedRef.current) {
      updateBounds();
    }
  }, [
    printAreaRef?.current,
    containerRef.current,
    setInitialPosition,
    updateBounds,
  ]);

  // Įvykių valdiklių pridėjimas/pašalinimas
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      if (positionChangeTimeout.current) {
        clearTimeout(positionChangeTimeout.current);
      }
    };
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // Sinchronizavimas su išoriniais pozicijos pakeitimais, bet tik kai tikrai reikia
  useEffect(() => {
    // Jei šiuo metu vyksta pozicijos atnaujinimas iš vidaus, praleiskime išorinį atnaujinimą
    if (shouldSkipPropUpdate.current) {
      shouldSkipPropUpdate.current = false;
      return;
    }

    // Jei nesikeičia pozicija, neatnaujinkime
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
      if (elementRef.current) {
        elementRef.current.style.transform = `translate3d(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px), 0) scale(${scale}) rotate(${rotation}deg)`;
      }
    }
  }, [position, scale, rotation, isDragging]);

  // Užkrovus vaizdą, nustatome pradinę poziciją ir atnaujiname ribas
  const handleImageLoad = useCallback(() => {
    imageLoadedRef.current = true;

    // Sumažiname uždelsą, kad greičiau nustatytų
    if (
      !firstLoadCompleted.current &&
      containerRef.current &&
      printAreaRef?.current
    ) {
      requestAnimationFrame(() => {
        updateBounds();
        setInitialPosition();
      });
    }
  }, [updateBounds, setInitialPosition, containerRef, printAreaRef]);

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
      className={`absolute cursor-grab draggable-image ${isDragging ? "cursor-grabbing z-10 dragging" : "smooth-transition"}`}
      style={{
        transform: `translate3d(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px), 0) scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        transformOrigin: "center",
        touchAction: "none",
        top: "50%",
        left: "50%",
        willChange: isDragging ? "transform" : "auto",
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
        onLoad={handleImageLoad}
      />
    </div>
  );
}
