"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";
import html2canvas from "html2canvas";
import { Button } from "./ui/Button";
import { Slider } from "./ui/Slider";
import { Trash2, Copy, RotateCw, RotateCcw, Plus, Grid3X3 } from "lucide-react";
import type { Design, PrintArea } from "@/lib/types";

interface MultiDesignCanvasProps {
  productImage: string;
  printArea: PrintArea;
  designs: Design[];
  activeDesignId: string | null;
  onSelectDesign: (id: string | null) => void;
  onUpdateDesign: (id: string, updates: Partial<Design>) => void;
  onRemoveDesign: (id: string) => void;
  onAddDesign: () => void;
  onCloneDesign: (id: string) => void;
  onPreviewGenerated: (preview: string | null) => void;
}

export default function MultiDesignCanvas({
  productImage,
  printArea,
  designs,
  activeDesignId,
  onSelectDesign,
  onUpdateDesign,
  onRemoveDesign,
  onAddDesign,
  onCloneDesign,
  onPreviewGenerated,
}: MultiDesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const movementThreshold = 2;

  const generatePreview = useCallback(
    debounce(async () => {
      if (!canvasRef.current || designs.length === 0) {
        onPreviewGenerated(null);
        return;
      }

      try {
        setIsGenerating(true);
        setError(null);

        const canvas = await html2canvas(canvasRef.current, {
          backgroundColor: null,
          scale: 1,
          logging: false,
          useCORS: true,
          allowTaint: true,
        });

        const preview = canvas.toDataURL("image/jpeg", 0.85);
        onPreviewGenerated(preview);
      } catch (error) {
        console.error("Error generating preview:", error);
        setError("Nepavyko sugeneruoti peržiūros");
        onPreviewGenerated(null);
      } finally {
        setIsGenerating(false);
      }
    }, 1000),
    [designs, onPreviewGenerated],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !activeDesignId) return;

      const movementX = e.movementX;
      const movementY = e.movementY;

      if (
        Math.abs(movementX) < movementThreshold &&
        Math.abs(movementY) < movementThreshold
      ) {
        return;
      }

      const activeDesign = designs.find((d) => d.id === activeDesignId);
      if (!activeDesign) return;

      const newPosition = {
        x: activeDesign.position.x + movementX,
        y: activeDesign.position.y + movementY,
      };

      onUpdateDesign(activeDesignId, { position: newPosition });
    },
    [isDragging, activeDesignId, designs, onUpdateDesign],
  );

  useEffect(() => {
    if (!isDragging) {
      generatePreview();
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      generatePreview.cancel();
    };
  }, [isDragging, handleMouseMove, generatePreview]);

  const handleMouseDown = (e: React.MouseEvent, designId: string) => {
    e.preventDefault();
    setIsDragging(true);
    onSelectDesign(designId);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    generatePreview();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            icon={Grid3X3}
          >
            {showGrid ? "Slėpti tinklelį" : "Rodyti tinklelį"}
          </Button>
        </div>
        <Button variant="default" size="sm" onClick={onAddDesign} icon={Plus}>
          Pridėti dizainą
        </Button>
      </div>

      <div
        ref={canvasRef}
        className="relative w-full aspect-square bg-white rounded-lg shadow-md overflow-hidden"
      >
        {showGrid && (
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="border border-gray-200 opacity-50" />
            ))}
          </div>
        )}

        <img
          src={productImage}
          alt="Produkto vaizdas"
          className="w-full h-full object-contain"
        />

        <div
          className="absolute border-2 border-dashed border-accent-400 rounded-lg pointer-events-none"
          style={{
            top: `${printArea.bounds.top}%`,
            left: `${printArea.bounds.left}%`,
            width: `${printArea.bounds.width}%`,
            height: `${printArea.bounds.height}%`,
          }}
        />

        <AnimatePresence>
          {designs.map((design) => (
            <motion.div
              key={design.id}
              className={`absolute cursor-move ${
                activeDesignId === design.id ? "ring-2 ring-accent-500" : ""
              }`}
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) translate(${design.position.x}px, ${design.position.y}px) scale(${design.scale}) rotate(${design.rotation}deg)`,
                opacity: design.opacity,
                transition: isDragging
                  ? "none"
                  : "transform 0.1s, opacity 0.1s",
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: design.scale, opacity: design.opacity }}
              exit={{ scale: 0.8, opacity: 0 }}
              onMouseDown={(e) => handleMouseDown(e, design.id)}
              onClick={() => onSelectDesign(design.id)}
            >
              <img
                src={design.imageUrl}
                alt="Dizaino elementas"
                className="max-w-[200px] max-h-[200px] pointer-events-none select-none"
                draggable={false}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600 mb-2"></div>
            <span className="text-sm text-accent-600">
              Generuojama peržiūra...
            </span>
          </div>
        )}
      </div>

      {activeDesignId && (
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Dizaino nustatymai</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCloneDesign(activeDesignId)}
                icon={Copy}
              >
                Kopijuoti
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveDesign(activeDesignId)}
                icon={Trash2}
              >
                Šalinti
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Dydis</label>
            <Slider
              value={designs.find((d) => d.id === activeDesignId)?.scale || 1}
              min={0.2}
              max={3}
              step={0.01}
              onChange={(value) =>
                onUpdateDesign(activeDesignId, { scale: value })
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Permatomumas</label>
            <Slider
              value={designs.find((d) => d.id === activeDesignId)?.opacity || 1}
              min={0.1}
              max={1}
              step={0.01}
              onChange={(value) =>
                onUpdateDesign(activeDesignId, { opacity: value })
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Pasukimas</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const design = designs.find((d) => d.id === activeDesignId);
                  if (design) {
                    onUpdateDesign(activeDesignId, {
                      rotation: design.rotation - 15,
                    });
                  }
                }}
                icon={RotateCcw}
              >
                -15°
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const design = designs.find((d) => d.id === activeDesignId);
                  if (design) {
                    onUpdateDesign(activeDesignId, {
                      rotation: design.rotation + 15,
                    });
                  }
                }}
                icon={RotateCw}
              >
                +15°
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
