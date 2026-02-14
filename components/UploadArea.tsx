"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, X, Edit2 } from "lucide-react";
import { Button } from "./ui/Button";
import ImageEditor from "./ImageEditor";

interface UploadAreaProps {
  onImageUpload: (imageUrl: string) => void;
}

export default function UploadArea({ onImageUpload }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      try {
        setError(null);
        setIsUploading(true);
        setUploadProgress(0);

        // Validate file type
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/svg+xml",
        ];
        if (!validTypes.includes(file.type)) {
          throw new Error(
            "Netinkamas failo formatas. Galimi formatai: PNG, JPEG, GIF, SVG",
          );
        }

        // Validate file size (3MB max)
        if (file.size > 3 * 1024 * 1024) {
          throw new Error("Failas per didelis. Maksimalus dydis yra 3MB");
        }

        // Create object URL instead of DataURL
        const objectUrl = URL.createObjectURL(file);

        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 10;
          });
        }, 100);

        // Load image to validate it
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = () => reject(new Error("Nepavyko įkelti paveikslėlio"));
          img.src = objectUrl;
        });

        setCurrentImage(objectUrl);
        onImageUpload(objectUrl);

        // Cleanup
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(() => setIsUploading(false), 500);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Įvyko klaida įkeliant failą",
        );
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [onImageUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFile(e.target.files[0]);
      }
    },
    [processFile],
  );

  const handleRemove = useCallback(() => {
    if (currentImage && currentImage.startsWith("blob:")) {
      URL.revokeObjectURL(currentImage);
    }
    setCurrentImage(null);
    onImageUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [currentImage, onImageUpload]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = (editedImageUrl: string) => {
    if (currentImage && currentImage.startsWith("blob:")) {
      URL.revokeObjectURL(currentImage);
    }
    setCurrentImage(editedImageUrl);
    onImageUpload(editedImageUrl);
    setIsEditing(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentImage && currentImage.startsWith("blob:")) {
        URL.revokeObjectURL(currentImage);
      }
    };
  }, [currentImage]);

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {currentImage ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-start space-x-4">
              <div className="relative w-24 h-24 bg-gray-50 rounded overflow-hidden">
                <img
                  src={currentImage}
                  alt="Įkeltas paveikslėlis"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Įkeltas paveikslėlis
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    icon={Edit2}
                  >
                    Redaguoti
                  </Button>
                  <Button
                    onClick={handleRemove}
                    variant="outline"
                    size="sm"
                    icon={X}
                  >
                    Pašalinti
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-accent-500 bg-accent-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              <Upload
                className={`w-12 h-12 mb-3 ${
                  isDragging ? "text-accent-500" : "text-gray-400"
                }`}
              />
              <p className="mb-2 text-sm text-gray-700">
                <span className="font-medium">Vilkite paveikslėlį čia</span>{" "}
                arba
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="default"
                icon={ImageIcon}
              >
                Pasirinkti failą
              </Button>
              <p className="mt-2 text-xs text-gray-500">
                PNG, JPG, GIF arba SVG (iki 3MB)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-accent-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            {uploadProgress < 100 ? "Įkeliama..." : "Apdorojama..."}
          </p>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600"
        >
          {error}
        </motion.div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/png, image/jpeg, image/gif, image/svg+xml"
        onChange={handleFileChange}
      />

      {isEditing && currentImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <ImageEditor
            imageUrl={currentImage}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      )}
    </div>
  );
}
