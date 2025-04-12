import { useCallback } from 'react'

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
  const handleReset = useCallback(() => {
    onScaleChange(1)
    onOpacityChange(1)
  }, [onScaleChange, onOpacityChange])

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-1">
          <label htmlFor="scale-slider" className="form-label">
            Dydis
          </label>
          <span className="text-sm text-gray-500">
            {Math.round(scale * 100)}%
          </span>
        </div>
        <input
          id="scale-slider"
          type="range"
          min="0.2"
          max="2"
          step="0.01"
          value={scale}
          onChange={(e) => onScaleChange(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>20%</span>
          <span>100%</span>
          <span>200%</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-1">
          <label htmlFor="opacity-slider" className="form-label">
            Permatomumas
          </label>
          <span className="text-sm text-gray-500">
            {Math.round(opacity * 100)}%
          </span>
        </div>
        <input
          id="opacity-slider"
          type="range"
          min="0.1"
          max="1"
          step="0.01"
          value={opacity}
          onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <button
        onClick={handleReset}
        className="btn btn-secondary w-full"
        type="button"
      >
        Atstatyti nustatymus
      </button>

      <div className="text-sm text-gray-500 italic mt-2">
        Pastaba: Paveikslėlį galite perkelti tiesiog pele tempiant jį ant rūbo.
        Naudokite rodyklių klavišus tikslesniam pozicionavimui.
      </div>
    </div>
  )
}