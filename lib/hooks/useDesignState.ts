'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { DesignState, PrintAreaPosition, DesignPosition } from '@/lib/types'
import { PRINT_AREAS } from '@/lib/constants'

const initialState: DesignState = {
  position: { x: 0, y: 0 },
  scale: 1,
  opacity: 1,
  rotation: 0,
  printArea: 'front',
  confirmed: false
}

// Funkcija, kuri apskaičiuoja santykį tarp spausdinimo plotų
// Tai padės išsaugoti santykinę poziciją tarp skirtingų vaizdų
const calculatePositionRatio = (
  position: DesignPosition, 
  sourcePrintArea: PrintAreaPosition, 
  targetPrintArea: PrintAreaPosition
): DesignPosition => {
  if (!PRINT_AREAS[sourcePrintArea] || !PRINT_AREAS[targetPrintArea]) {
    return position; // Jei nėra duomenų apie spausdinimo plotus, grąžiname tą pačią poziciją
  }
  
  const sourceBounds = PRINT_AREAS[sourcePrintArea].bounds;
  const targetBounds = PRINT_AREAS[targetPrintArea].bounds;
  
  // Apskaičiuojame, kokia dalis spausdinimo ploto yra užimta (santykis)
  const sourceWidthRatio = position.x / (sourceBounds.width / 100);
  const sourceHeightRatio = position.y / (sourceBounds.height / 100);
  
  // Pritaikome tą patį santykį naujam spausdinimo plotui
  return {
    x: sourceWidthRatio * (targetBounds.width / 100),
    y: sourceHeightRatio * (targetBounds.height / 100)
  };
};

export function useDesignState() {
  // Saugome atskiras būsenas kiekvienai pozicijai
  const [designStates, setDesignStates] = useState<Record<PrintAreaPosition, DesignState>>({
    'front': { ...initialState, printArea: 'front' },
    'back': { ...initialState, printArea: 'back' },
    'left-sleeve': { ...initialState, printArea: 'left-sleeve' },
    'right-sleeve': { ...initialState, printArea: 'right-sleeve' }
  })
  
  const [currentView, setCurrentView] = useState<PrintAreaPosition>('front')

  // Naudojame ref, kad išvengti begalinio ciklo
  const skipUpdateRef = useRef(false)
  const isFirstRender = useRef(true)
  const previousViewRef = useRef<PrintAreaPosition>('front')
  const positionRatiosRef = useRef<Record<PrintAreaPosition, { x: number, y: number }>>({
    'front': { x: 0, y: 0 },
    'back': { x: 0, y: 0 },
    'left-sleeve': { x: 0, y: 0 },
    'right-sleeve': { x: 0, y: 0 }
  });

  // Patogi prieiga prie dabartinės pozicijos dizaino būsenos
  const designState = designStates[currentView]

  // Atnaujina tik dabartinės pozicijos dizaino būseną
  const updateDesignState = useCallback((changes: Partial<DesignState>) => {
    // Jei turime praleisti atnaujinimą (vyksta vidinis atnaujinimas), ignoruojame
    if (skipUpdateRef.current) {
      skipUpdateRef.current = false;
      return;
    }

    // Išsaugome dabartinę poziciją, jei ji nenustatyta
    const printArea = changes.printArea || currentView;
    
    // Jei keičiasi pozicija, atnaujiname ir santykinės pozicijos vertę
    if (changes.position) {
      const printAreaData = PRINT_AREAS[printArea];
      if (printAreaData && printAreaData.bounds) {
        const { width, height } = printAreaData.bounds;
        // Išsaugome santykį tarp pozicijos ir spausdinimo ploto dydžio
        positionRatiosRef.current[printArea] = {
          x: changes.position.x / (width / 100),
          y: changes.position.y / (height / 100)
        };
      }
    }
    
    setDesignStates(prev => ({
      ...prev,
      [printArea]: {
        ...prev[printArea],
        ...changes,
        // Visada įsitikiname, kad printArea reikšmė yra teisinga
        printArea: printArea
      }
    }))
  }, [currentView])

  // Nustatome naują vaizdą ir pritaikome santykinę poziciją iš ankstesnio vaizdo
  const setView = useCallback((view: PrintAreaPosition) => {
    // Jei view nesikeitė, nieko nedarome
    if (view === currentView) return;
    
    // Išsaugome dabartinį vaizdą prieš jį pakeičiant
    previousViewRef.current = currentView;
    
    // Nustatome naują vaizdą
    setCurrentView(view);
    
    // Apskaičiuojame naują poziciją pagal išsaugotas santykines vertes
    const ratio = positionRatiosRef.current[previousViewRef.current];
    const targetPrintAreaBounds = PRINT_AREAS[view].bounds;
    
    if (ratio && targetPrintAreaBounds) {
      // Apskaičiuojame naują poziciją santykinai pagal naują spausdinimo plotą
      const newPosition = {
        x: ratio.x * (targetPrintAreaBounds.width / 100),
        y: ratio.y * (targetPrintAreaBounds.height / 100)
      };
      
      // Užtikrinkime, kad šis atnaujinimas nesukeltų begalinio ciklo
      skipUpdateRef.current = true;
      
      // Atnaujiname poziciją naujam vaizdui
      setDesignStates(prev => ({
        ...prev,
        [view]: {
          ...prev[view],
          position: newPosition
        }
      }));
    }
  }, [currentView])

  // Atstatome visų vaizdų dizaino būsenas į pradinę
  const resetDesignState = useCallback(() => {
    // Taip pat atstatome ir santykines pozicijas
    positionRatiosRef.current = {
      'front': { x: 0, y: 0 },
      'back': { x: 0, y: 0 },
      'left-sleeve': { x: 0, y: 0 },
      'right-sleeve': { x: 0, y: 0 }
    };
    
    setDesignStates({
      'front': { ...initialState, printArea: 'front' },
      'back': { ...initialState, printArea: 'back' },
      'left-sleeve': { ...initialState, printArea: 'left-sleeve' },
      'right-sleeve': { ...initialState, printArea: 'right-sleeve' }
    });
  }, [])

  // Gauti visų dizaino būsenų objektą (naudojama siuntimui)
  const getAllDesignStates = useCallback(() => {
    return designStates
  }, [designStates])
  
  // Effect'as, kad išvalytų pirmojo rendarinimo žymę
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, []);

  return {
    designState,
    designStates,
    currentView,
    updateDesignState,
    setCurrentView: setView,
    resetDesignState,
    getAllDesignStates
  }
}