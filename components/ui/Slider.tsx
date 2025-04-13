'use client'

import React from 'react'

interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  className?: string
}

export function Slider({
  value,
  min,
  max,
  step = 0.01,
  onChange,
  className = '',
}: SliderProps) {
  return (
    <div className={`w-full ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-opacity-50"
        style={{
          background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${((value - min) / (max - min)) * 100}%, #E5E7EB ${((value - min) / (max - min)) * 100}%, #E5E7EB 100%)`,
        }}
      />
    </div>
  )
}