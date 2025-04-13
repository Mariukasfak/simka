import { useState, useCallback } from 'react'
import type { DesignState, PrintAreaPosition } from '@/lib/types'

const initialState: DesignState = {
  position: { x: 0, y: 0 },
  scale: 1,
  opacity: 1,
  rotation: 0,
  printArea: 'front'
}

export function useDesignState() {
  const [designState, setDesignState] = useState<DesignState>(initialState)
  const [currentView, setCurrentView] = useState<PrintAreaPosition>('front')

  const updateDesignState = useCallback((changes: Partial<DesignState>) => {
    setDesignState(prev => ({
      ...prev,
      ...changes
    }))
  }, [])

  const resetDesignState = useCallback(() => {
    setDesignState(initialState)
  }, [])

  return {
    designState,
    currentView,
    updateDesignState,
    setCurrentView,
    resetDesignState
  }
}