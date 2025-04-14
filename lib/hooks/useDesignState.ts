'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { DesignState, PrintAreaPosition } from '@/lib/types'

const initialState: DesignState = {
  position: { x: 0, y: 0 },
  scale: 1,
  opacity: 1,
  rotation: 0,
  printArea: 'front',
  confirmed: false
}

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

  // Nustatome naują vaizdą
  const setView = useCallback((view: PrintAreaPosition) => {
    // Jei view nesikeitė, nieko nedarome
    if (view === currentView) return;
    
    // Pažymime, kad reikia praleisti kitą atnaujinimą
    skipUpdateRef.current = true;
    
    // Nustatome naują vaizdą
    setCurrentView(view);
  }, [currentView])

  // Atstatome visų vaizdų dizaino būsenas į pradinę
  const resetDesignState = useCallback(() => {
    setDesignStates({
      'front': { ...initialState, printArea: 'front' },
      'back': { ...initialState, printArea: 'back' },
      'left-sleeve': { ...initialState, printArea: 'left-sleeve' },
      'right-sleeve': { ...initialState, printArea: 'right-sleeve' }
    })
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