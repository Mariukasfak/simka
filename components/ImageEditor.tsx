"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "./ui/Button";
import {
  Undo2,
  Redo2,
  Contrast,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  RotateCcw,
  Save,
} from "lucide-react";
import { Slider } from "./ui/Slider";

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

export default function ImageEditor({
  imageUrl,
  onSave,
  onCancel,
}: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = useCallback(() => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), dataUrl]);
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      // Set canvas size to match image
      canvasRef.current.width = img.width;
      canvasRef.current.height = img.height;

      // Draw initial image
      ctx.drawImage(img, 0, 0);

      // Add to history
      addToHistory();
    };
  }, [imageUrl, addToHistory]);

  const handleUndo = () => {
    if (historyIndex <= 0 || !canvasRef.current) return;
    setHistoryIndex((prev) => prev - 1);
    const img = new Image();
    img.src = history[historyIndex - 1];
    img.onload = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1 || !canvasRef.current) return;
    setHistoryIndex((prev) => prev + 1);
    const img = new Image();
    img.src = history[historyIndex + 1];
    img.onload = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleRotate = (angle: number) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCanvas.width = canvasRef.current.height;
    tempCanvas.height = canvasRef.current.width;

    tempCtx.save();
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate((angle * Math.PI) / 180);
    tempCtx.drawImage(
      canvasRef.current,
      -canvasRef.current.width / 2,
      -canvasRef.current.height / 2,
    );
    tempCtx.restore();

    canvasRef.current.width = tempCanvas.width;
    canvasRef.current.height = tempCanvas.height;
    ctx.drawImage(tempCanvas, 0, 0);

    addToHistory();
  };

  const handleFlip = (direction: "horizontal" | "vertical") => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCanvas.width = canvasRef.current.width;
    tempCanvas.height = canvasRef.current.height;

    tempCtx.save();
    if (direction === "horizontal") {
      tempCtx.scale(-1, 1);
      tempCtx.drawImage(canvasRef.current, -canvasRef.current.width, 0);
    } else {
      tempCtx.scale(1, -1);
      tempCtx.drawImage(canvasRef.current, 0, -canvasRef.current.height);
    }
    tempCtx.restore();

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(tempCanvas, 0, 0);

    addToHistory();
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    onSave(dataUrl);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">Redaguoti paveikslėlį</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Undo2}
            onClick={handleUndo}
            disabled={historyIndex <= 0}
          >
            Atšaukti
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Redo2}
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
          >
            Grąžinti
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 border rounded-lg overflow-hidden">
          <canvas ref={canvasRef} className="max-w-full h-auto bg-gray-50" />
        </div>

        <div className="w-64 space-y-6">
          {/* Transform controls */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Transformacija</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={() => handleRotate(-90)}
              >
                -90°
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={RotateCw}
                onClick={() => handleRotate(90)}
              >
                90°
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={FlipHorizontal}
                onClick={() => handleFlip("horizontal")}
              >
                Apversti H
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={FlipVertical}
                onClick={() => handleFlip("vertical")}
              >
                Apversti V
              </Button>
            </div>
          </div>

          {/* Adjustments */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Koregavimai</h4>

            <div>
              <label className="text-sm text-gray-600">Šviesumas</label>
              <Slider
                value={brightness}
                min={-1}
                max={1}
                step={0.1}
                onChange={setBrightness}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Kontrastas</label>
              <Slider
                value={contrast}
                min={-1}
                max={1}
                step={0.1}
                onChange={setContrast}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onCancel}>
          Atšaukti
        </Button>
        <Button variant="default" icon={Save} onClick={handleSave}>
          Išsaugoti
        </Button>
      </div>
    </div>
  );
}
