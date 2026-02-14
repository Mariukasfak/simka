// filepath: /workspaces/simka/components/AdvancedDesignWizard.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/Button";
import SimplifiedDesignCanvas from "./SimplifiedDesignCanvas";
import type { DesignPosition, RelativePosition } from "@/lib/types";

interface AdvancedDesignWizardProps {
  productImages: {
    front: string;
    back: string;
    "left-sleeve"?: string;
    "right-sleeve"?: string;
  };
  printAreas: {
    front: { top: number; left: number; width: number; height: number };
    back: { top: number; left: number; width: number; height: number };
    "left-sleeve"?: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
    "right-sleeve"?: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
  };
  onComplete: (
    designs: {
      area: string;
      preview: string;
      position: DesignPosition;
      relativePosition: RelativePosition;
      scale: number;
      opacity: number;
      rotation: number;
    }[],
  ) => void;
  onCancel?: () => void;
}

export default function AdvancedDesignWizard({
  productImages,
  printAreas,
  onComplete,
  onCancel,
}: AdvancedDesignWizardProps) {
  // Aktyvus rodinys (priekis, nugara, rankovės)
  const [currentView, setCurrentView] = useState<string>("front");

  // Įkeltas vaizdas kiekvienai sričiai
  const [uploadedImages, setUploadedImages] = useState<
    Record<string, string | null>
  >({
    front: null,
    back: null,
    "left-sleeve": null,
    "right-sleeve": null,
  });

  // Peržiūros vaizdas kiekvienai sričiai
  const [previews, setPreviews] = useState<Record<string, string | null>>({
    front: null,
    back: null,
    "left-sleeve": null,
    "right-sleeve": null,
  });

  // Dizaino būsena kiekvienai sričiai
  const [designStates, setDesignStates] = useState<
    Record<
      string,
      {
        position: DesignPosition;
        relativePosition: RelativePosition;
        scale: number;
        opacity: number;
        rotation: number;
        locked: boolean;
      } | null
    >
  >({
    front: null,
    back: null,
    "left-sleeve": null,
    "right-sleeve": null,
  });

  // Failo įkėlimo valdymas
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedImages((prev) => ({ ...prev, [currentView]: dataUrl }));
      };
      reader.readAsDataURL(file);
    },
    [currentView],
  );

  // Peržiūros generavimo valdymas
  const handlePreviewGenerated = useCallback(
    (
      preview: string | null,
      state: {
        position: DesignPosition;
        relativePosition: RelativePosition;
        scale: number;
        opacity: number;
        rotation: number;
        locked: boolean;
      } | null,
    ) => {
      if (preview) {
        setPreviews((prev) => ({ ...prev, [currentView]: preview }));
      }

      if (state) {
        setDesignStates((prev) => ({ ...prev, [currentView]: state }));
      }
    },
    [currentView],
  );

  // Dizaino išsaugojimo valdymas
  const handleSaveDesign = useCallback(
    (state: {
      position: DesignPosition;
      relativePosition: RelativePosition;
      scale: number;
      opacity: number;
      rotation: number;
      locked: boolean;
    }) => {
      // Užrakiname dizainą
      setDesignStates((prev) => ({
        ...prev,
        [currentView]: { ...state, locked: true },
      }));

      // Tikrinti ar turime daugiau sričių, į kurias galime pereiti
      const availableViews = Object.keys(productImages || {}).filter(
        (view) => view !== currentView,
      );

      if (availableViews.length > 0) {
        // Jei yra daugiau sričių, pereikime į sekančią
        const nextView = availableViews[0];
        setCurrentView(nextView);
      } else {
        // Jei visos sritys jau užpildytos, galime baigti visą procesą
        handleComplete();
      }
    },
    [currentView, productImages],
  );

  // Viso proceso užbaigimas
  const handleComplete = useCallback(() => {
    // Surenkame visus užpildytus dizainus
    const completedDesigns = Object.entries(designStates)
      .filter(([_, state]) => state !== null && state.locked)
      .map(([area, state]) => ({
        area,
        preview: previews[area] || "",
        position: state!.position,
        relativePosition: state!.relativePosition,
        scale: state!.scale,
        opacity: state!.opacity,
        rotation: state!.rotation,
      }));

    // Perduodame užbaigtus dizainus
    if (completedDesigns.length > 0) {
      onComplete(completedDesigns);
    }
  }, [designStates, previews, onComplete]);

  // Naujo dizaino pridėjimas šioje srityje
  const handleAddDesignToCurrentView = useCallback(() => {
    // Atidarome failų pasirinkimo dialogą
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = handleFileUpload as any;
    input.click();
  }, [handleFileUpload]);

  // Dizaino pašalinimas iš aktyvios srities
  const handleRemoveDesignFromCurrentView = useCallback(() => {
    setUploadedImages((prev) => ({ ...prev, [currentView]: null }));
    setPreviews((prev) => ({ ...prev, [currentView]: null }));
    setDesignStates((prev) => ({ ...prev, [currentView]: null }));
  }, [currentView]);

  // Saugos patikrinimas - jei productImages yra undefined arba null
  if (!productImages || !printAreas) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-red-800">
        <h3 className="text-lg font-medium mb-2">Konfigūracijos klaida</h3>
        <p>
          Dizaino vedliui trūksta reikalingų duomenų: produktų vaizdų arba
          spausdinimo zonų.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Dizaino redagavimas
        </h2>
        <p className="text-gray-600">
          Pridėkite ir koreguokite savo logotipą ant produkto
        </p>
      </div>

      {/* Rodinių pasirinkimas */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {Object.entries(productImages).map(([view, _]) => (
          <Button
            key={view}
            variant={currentView === view ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentView(view)}
            className="capitalize"
          >
            {view === "front"
              ? "Priekis"
              : view === "back"
                ? "Nugara"
                : view === "left-sleeve"
                  ? "Kairė rankovė"
                  : view === "right-sleeve"
                    ? "Dešinė rankovė"
                    : view}
          </Button>
        ))}
      </div>

      {/* Dizaino drobė arba įkėlimo zona */}
      {uploadedImages[currentView] ? (
        // Jei šiai sričiai jau yra įkeltas vaizdas, rodome dizaino drobę
        <SimplifiedDesignCanvas
          productImage={
            productImages[currentView as keyof typeof productImages] || ""
          }
          uploadedImage={uploadedImages[currentView]}
          initialState={designStates[currentView] || undefined}
          printAreaBounds={
            printAreas[currentView as keyof typeof printAreas] || {
              top: 25,
              left: 25,
              width: 50,
              height: 50,
            }
          }
          onPreviewGenerated={handlePreviewGenerated}
          onSaveDesign={handleSaveDesign}
          onCancel={() => handleRemoveDesignFromCurrentView()}
        />
      ) : (
        // Jei šiai sričiai dar nėra įkelto vaizdo, rodome įkėlimo zoną
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Įkelkite savo logotipą
          </h3>
          <p className="text-gray-500 mb-4">
            PNG, JPG arba SVG formatas (rekomenduojama skaidri PNG)
          </p>
          <Button onClick={handleAddDesignToCurrentView} icon={ImageIcon}>
            Pasirinkti paveikslėlį
          </Button>
        </div>
      )}

      {/* Peržiūrų juosta */}
      {Object.values(previews).some((preview) => preview !== null) && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Jūsų dizainai
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(previews).map(
              ([view, preview]) =>
                preview && (
                  <div
                    key={view}
                    className={`relative border rounded-lg overflow-hidden cursor-pointer ${currentView === view ? "ring-2 ring-accent-500" : ""}`}
                    onClick={() => setCurrentView(view)}
                  >
                    <img
                      src={preview}
                      alt={`Dizainas - ${view}`}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center capitalize">
                      {view === "front"
                        ? "Priekis"
                        : view === "back"
                          ? "Nugara"
                          : view === "left-sleeve"
                            ? "Kairė"
                            : view === "right-sleeve"
                              ? "Dešinė"
                              : view}
                    </div>
                  </div>
                ),
            )}
          </div>
        </div>
      )}

      {/* Apatiniai mygtukai */}
      <div className="mt-8 flex justify-between">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Atšaukti
          </Button>
        )}

        <Button
          onClick={handleComplete}
          disabled={
            !Object.values(designStates).some(
              (state) => state !== null && state.locked,
            )
          }
          className="ml-auto"
          variant="default"
        >
          Užbaigti dizainą
        </Button>
      </div>
    </div>
  );
}
