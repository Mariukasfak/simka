import type { PrintArea, PrintAreaPosition } from './types'

// Spausdinimo vietos - optimizuotos pagal produkto tipą
export const PRINT_AREAS: Record<PrintAreaPosition, PrintArea> = {
  'front': {
    id: 'front',
    name: 'Priekis',
    position: 'front',
    maxWidth: 300,
    maxHeight: 350,
    bounds: {
      top: 25,
      left: 25,
      width: 50,
      height: 50
    }
  },
  'back': {
    id: 'back',
    name: 'Nugara',
    position: 'back',
    maxWidth: 300,
    maxHeight: 350,
    bounds: {
      top: 25, // Nekeičiame, nes tai yra simetriškas vaizdas
      left: 25,
      width: 50,
      height: 50
    }
  },
  'left-sleeve': {
    id: 'left-sleeve',
    name: 'Kairė rankovė',
    position: 'left-sleeve',
    maxWidth: 100,
    maxHeight: 150,
    bounds: {
      top: 30,
      left: 15,
      width: 25,
      height: 30
    }
  },
  'right-sleeve': {
    id: 'right-sleeve',
    name: 'Dešinė rankovė',
    position: 'right-sleeve',
    maxWidth: 100,
    maxHeight: 150,
    bounds: {
      top: 30,
      left: 60,
      width: 25,
      height: 30
    }
  }
}

// Galimos spausdinimo vietos pagal produktą
export const PRODUCT_AVAILABLE_PRINT_AREAS: Record<string, PrintAreaPosition[]> = {
  'hoodie-dark': ['front', 'back', 'left-sleeve', 'right-sleeve'],
  'hoodie-light': ['front', 'back'], // Neturi rankovių spausdinimo
  'tshirt-dark': ['front', 'back'],
  'tshirt-light': ['front', 'back']
}

// Produktų vaizdai skirtingoms spausdinimo vietoms
export const PRODUCT_VIEWS = {
  'hoodie-dark': {
    front: '/images/hoodie_dark.png', // Naudojame bendrą vaizdą, nes nėra atskiro
    back: '/images/hoodie_dark.png'   // Naudojame bendrą vaizdą, nes nėra atskiro
  },
  'hoodie-light': {
    front: '/images/hoodie_light_front.png',
    back: '/images/hoodie_light_back.png'
  },
  'tshirt-dark': {
    front: '/images/tshirt_dark.png', // Naudojame bendrą vaizdą, nes nėra atskiro
    back: '/images/tshirt_dark.png'   // Naudojame bendrą vaizdą, nes nėra atskiro
  },
  'tshirt-light': {
    front: '/images/tshirt_light.png', // Laikinai naudojame bendrą vaizdą
    back: '/images/tshirt_light.png'   // Laikinai naudojame bendrą vaizdą
  }
}

// Produkto spalvos
export const PRODUCT_COLORS = {
  'hoodie': [
    { id: 'dark', name: 'Tamsus', hexCode: '#1e293b' },
    { id: 'light', name: 'Šviesus', hexCode: '#f8fafc' },
    { id: 'black', name: 'Juodas', hexCode: '#000000' },
    { id: 'navy', name: 'Tamsiai mėlynas', hexCode: '#172554' }
  ],
  'tshirt': [
    { id: 'dark', name: 'Tamsus', hexCode: '#1e293b' },
    { id: 'light', name: 'Šviesus', hexCode: '#f8fafc' },
    { id: 'black', name: 'Juodas', hexCode: '#000000' },
    { id: 'white', name: 'Baltas', hexCode: '#ffffff' }
  ]
}