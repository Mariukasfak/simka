import { Client } from 'figma-js'

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY

if (!FIGMA_ACCESS_TOKEN) {
  throw new Error('FIGMA_ACCESS_TOKEN is not defined')
}

if (!FIGMA_FILE_KEY) {
  throw new Error('FIGMA_FILE_KEY is not defined')
}

// Šis kintamasis yra užtikrintas, kad yra string, nes patikrinome anksčiau
const FILE_KEY = FIGMA_FILE_KEY as string

export const figmaClient = Client({
  personalAccessToken: FIGMA_ACCESS_TOKEN
})

export async function getFigmaFile() {
  try {
    const file = await figmaClient.file(FILE_KEY)
    return file
  } catch (error) {
    console.error('Error fetching Figma file:', error)
    throw error
  }
}

export async function getFigmaImages(nodeIds: string[]) {
  try {
    const images = await figmaClient.fileImages(FILE_KEY, {
      ids: nodeIds,
      format: 'png',
      scale: 2
    })
    return images
  } catch (error) {
    console.error('Error fetching Figma images:', error)
    throw error
  }
}

export async function getProductMockups() {
  try {
    const file = await getFigmaFile()
    
    // Find the mockups canvas/frame
    const mockupsFrame = file.data.document.children.find(
      child => child.name === 'Product Mockups'
    )

    if (!mockupsFrame || !('children' in mockupsFrame)) {
      throw new Error('Product Mockups frame not found or has no children')
    }

    // Get all mockup components
    const mockups = mockupsFrame.children.filter(
      child => child.type === 'COMPONENT' || child.type === 'INSTANCE'
    )

    // Get image URLs for mockups
    const mockupIds = mockups.map(mockup => mockup.id)
    const images = await getFigmaImages(mockupIds)

    return mockups.map(mockup => ({
      id: mockup.id,
      name: mockup.name,
      imageUrl: images.data.images[mockup.id]
    }))
  } catch (error) {
    console.error('Error getting product mockups:', error)
    throw error
  }
}