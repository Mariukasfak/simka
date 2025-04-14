import { Client } from 'figma-js'

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN || 'dummy-token'
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY || 'dummy-key'

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
  // Pakeičiame Figma funkcionalumą į fiktyvius duomenis
  // Kadangi neplanuojate naudoti Figma, grąžinsime fiktyvius duomenis
  try {
    // Vietoj Figma API iškviečio, grąžiname fiksuotus duomenis
    return [
      {
        id: 'mock-1',
        name: 'T-shirt Mockup',
        imageUrl: '/images/tshirt_light.png'
      },
      {
        id: 'mock-2',
        name: 'Hoodie Mockup',
        imageUrl: '/images/hoodie_light.png'
      }
    ]
  } catch (error) {
    console.error('Error getting product mockups:', error)
    throw error
  }
}