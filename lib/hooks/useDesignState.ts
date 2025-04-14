'use client'

import { useState, useCallback, useEffect } from 'react'
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

  // Patogi prieiga prie dabartinės pozicijos dizaino būsenos
  const designState = designStates[currentView]

  // Atnaujina tik dabartinės pozicijos dizaino būseną
  const updateDesignState = useCallback((changes: Partial<DesignState>) => {
    setDesignStates(prev => ({
      ...prev,
      [currentView]: {
        ...prev[currentView],
        ...changes
      }
    }))
  }, [currentView])

  // Nustatome naują vaizdą ir galimybę gautų esamą vaizdo dizaino būseną
  const setView = useCallback((view: PrintAreaPosition) => {
    setCurrentView(view)
  }, [])

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