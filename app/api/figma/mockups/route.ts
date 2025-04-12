import { NextResponse } from 'next/server'
import { getProductMockups } from '@/lib/figma'

export async function GET() {
  try {
    const mockups = await getProductMockups()
    return NextResponse.json(mockups)
  } catch (error) {
    console.error('Error fetching mockups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mockups' },
      { status: 500 }
    )
  }
}