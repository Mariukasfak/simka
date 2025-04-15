// filepath: /workspaces/simka/components/DesignDebugger.tsx
import React from 'react';

interface DesignDebuggerProps {
  designState: any;
  printArea: any;
  containerRef: React.RefObject<HTMLDivElement>;
  printAreaRef: React.RefObject<HTMLDivElement>;
  visible?: boolean;
}

export default function DesignDebugger({
  designState,
  printArea,
  containerRef,
  printAreaRef,
  visible = false
}: DesignDebuggerProps) {
  if (!visible) return null;
  
  // Gauti elementų matmenis
  const containerRect = containerRef.current?.getBoundingClientRect();
  const printAreaRect = printAreaRef.current?.getBoundingClientRect();
  
  // Apskaičiuoti santykinę poziciją
  const calculateRelativePositionInPrintArea = () => {
    if (!containerRect || !printAreaRect || !designState) return { x: 0, y: 0 };
    
    const { position } = designState;
    
    // Absoliuti pozicija nuo container centro
    const absoluteX = position.x;
    const absoluteY = position.y;
    
    // Absoliuti pozicija nuo container viršutinio kairiojo kampo
    const absoluteFromLeft = absoluteX + (containerRect.width / 2);
    const absoluteFromTop = absoluteY + (containerRect.height / 2);
    
    // Santykinė pozicija printArea viduje
    const printAreaLeft = printAreaRect.left - containerRect.left;
    const printAreaTop = printAreaRect.top - containerRect.top;
    
    const xInPrintArea = absoluteFromLeft - printAreaLeft;
    const yInPrintArea = absoluteFromTop - printAreaTop;
    
    return {
      x: xInPrintArea,
      y: yInPrintArea,
      xPercent: (xInPrintArea / printAreaRect.width) * 100,
      yPercent: (yInPrintArea / printAreaRect.height) * 100
    };
  };
  
  const relativePos = calculateRelativePositionInPrintArea();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white p-2 text-xs z-50">
      <div className="flex flex-wrap gap-2">
        <div>
          <b>Pozicija (px):</b> X: {Math.round(designState?.position?.x || 0)}, Y: {Math.round(designState?.position?.y || 0)}
        </div>
        <div>
          <b>Santykis printArea (%):</b> X: {Math.round(relativePos.xPercent)}%, Y: {Math.round(relativePos.yPercent)}%
        </div>
        <div>
          <b>Elementų dydžiai:</b> Container: {containerRect?.width.toFixed(0)}x{containerRect?.height.toFixed(0)}px, 
          PrintArea: {printAreaRect?.width.toFixed(0)}x{printAreaRect?.height.toFixed(0)}px
        </div>
        <div>
          <b>PrintArea (CSS):</b> L: {printArea?.bounds?.left}%, T: {printArea?.bounds?.top}%, 
          W: {printArea?.bounds?.width}%, H: {printArea?.bounds?.height}%
        </div>
        <div>
          <b>Skalė:</b> {designState?.scale.toFixed(2)}, <b>Pasukimas:</b> {designState?.rotation}°, 
          <b>Permatomumas:</b> {(designState?.opacity * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}