import type { PrintArea, PrintAreaPosition } from './types'

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
      top: 25,
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

export const PRODUCT_VIEWS = {
  'hoodie-dark': {
    front: '/images/hoodie_dark_front.png',
    back: '/images/hoodie_dark_back.png',
    'left-sleeve': '/images/hoodie_dark_left.png',
    'right-sleeve': '/images/hoodie_dark_right.png'
  },
  'hoodie-light': {
    front: '/images/hoodie_light_front.png',
    back: '/images/hoodie_light_back.png',
    'left-sleeve': '/images/hoodie_light_left.png',
    'right-sleeve': '/images/hoodie_light_right.png'
  }
}