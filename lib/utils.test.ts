import { describe, it, expect } from 'vitest'
import { formatPrice } from './utils'

describe('formatPrice', () => {
  it('formats positive integers correctly', () => {
    expect(formatPrice(10)).toBe('10,00\u00A0€')
  })

  it('formats decimals correctly', () => {
    expect(formatPrice(10.5)).toBe('10,50\u00A0€')
    expect(formatPrice(10.567)).toBe('10,57\u00A0€')
  })

  it('formats zero correctly', () => {
    expect(formatPrice(0)).toBe('0,00\u00A0€')
  })

  it('formats negative numbers correctly', () => {
    expect(formatPrice(-10)).toBe('\u221210,00\u00A0€')
  })

  it('formats large numbers correctly', () => {
    expect(formatPrice(1000)).toBe('1\u00A0000,00\u00A0€')
    expect(formatPrice(1234567.89)).toBe('1\u00A0234\u00A0567,89\u00A0€')
  })
})
