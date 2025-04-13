// Add to existing types
export type PrintAreaPosition = 'front' | 'back' | 'left-sleeve' | 'right-sleeve';

export interface PrintArea {
  id: string;
  name: string;
  position: PrintAreaPosition;
  maxWidth: number;
  maxHeight: number;
  bounds: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export interface DesignState {
  position: { x: number; y: number };
  scale: number;
  opacity: number;
  rotation: number;
  printArea: PrintAreaPosition;
}

export interface ProductView {
  position: PrintAreaPosition;
  imageUrl: string;
  printArea: PrintArea;
}