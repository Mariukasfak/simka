'use client'

import { motion } from 'framer-motion'
import { Slider } from '@/components/ui/Slider'
import { Button } from '@/components/ui/Button'
import { RefreshCw } from 'lucide-react'

interface ControlsProps {
  scale: number
  opacity: number
  onScaleChange: (scale: number) => void
  onOpacityChange: (opacity: number) => void
}

export default function Controls({
  scale,
  opacity,
  onScaleChange,
  onOpacityChange
}: ControlsProps) {
  const handleReset = () => {
    onScaleChange(1)
    onOpacityChange(1)
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-brand-900">
            Dydis
          </label>
          <span className="text-sm text-brand-600">
            {Math.round(scale * 100)}%
          </span>
        </div>
        <Slider
          value={scale}
          min={0.2}
          max={2}
          step={0.01}
          onChange={onScaleChange}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-brand-900">
            Permatomumas
          </label>
          <span className="text-sm text-brand-600">
            {Math.round(opacity * 100)}%
          </span>
        </div>
        <Slider
          value={opacity}
          min={0.1}
          max={1}
          step={0.01}
          onChange={onOpacityChange}
        />
      </div>

      <Button
        onClick={handleReset}
        variant="outline"
        className="w-full"
        icon={RefreshCw}
      >
        Atstatyti nustatymus
      </Button>

      <div className="text-sm text-brand-600 space-y-2">
        <p>
          <span className="font-medium">Valdymas:</span>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Tempkite pele norėdami perkelti dizainą</li>
          <li>Naudokite rodyklių klavišus tikslesniam pozicionavimui</li>
          <li>Laikykite SHIFT + rodyklės klavišą didesniam žingsniui</li>
          <li>Spauskite R, kad atstatytumėte poziciją</li>
        </ul>
      </div>
    </div>
  )
}