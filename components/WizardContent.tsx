import React, { useCallback } from "react";
import { WizardStep } from "./DesignWizard";
import ProductSelector from "./ProductSelector";
import UploadArea from "./UploadArea";
import EnhancedDesignCanvas from "./EnhancedDesignCanvas";
import EnhancedOrderForm from "./EnhancedOrderForm";
import { Product, PrintAreaPosition } from "@/lib/types";
import { PRODUCT_VIEWS } from "@/lib/constants";

interface WizardContentProps {
  currentStep: WizardStep;
  products: Product[];
  selectedProduct: Product;
  uploadedImage: string | null;
  designState: any;
  designPreviews: Record<string, string | null>;
  printAreas: any;
  currentView: PrintAreaPosition;
  isSubmitting: boolean;

  // Veiksmai
  onProductSelect: (product: Product) => void;
  onImageUpload: (imageUrl: string) => void;
  onDesignChange: (newState: any) => void;
  onViewChange: (view: PrintAreaPosition) => void;
  onPreviewGenerated: (preview: string | null) => void;
  onOrderSubmit: (formData: any) => Promise<void>;
  onNextStep: () => void;
}

export default function WizardContent({
  currentStep,
  products,
  selectedProduct,
  uploadedImage,
  designState,
  designPreviews,
  printAreas,
  currentView,
  isSubmitting,
  onProductSelect,
  onImageUpload,
  onDesignChange,
  onViewChange,
  onPreviewGenerated,
  onOrderSubmit,
  onNextStep,
}: WizardContentProps) {
  const handleProductSelect = useCallback(
    (product: Product) => {
      onProductSelect(product);
      onNextStep();
    },
    [onProductSelect, onNextStep],
  );

  // Produkto pasirinkimo žingsnis
  const renderProductStep = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Pasirinkite savo rūbą</h2>
        <p className="text-gray-600 mb-6">
          Pasirinkite rūbą, ant kurio bus dedama spauda
        </p>

        <ProductSelector
          products={products}
          selectedProduct={selectedProduct}
          onSelect={handleProductSelect}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNextStep}
          className="px-6 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
        >
          Toliau
        </button>
      </div>
    </div>
  );

  // Logo įkėlimo žingsnis
  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Įkelkite savo logotipą</h2>
        <p className="text-gray-600 mb-6">
          Įkelkite logotipą ar paveikslėlį, kurį naudosite spaudai
        </p>

        <UploadArea
          onImageUpload={(imageUrl) => {
            onImageUpload(imageUrl);
            onNextStep(); // Automatiškai pereiname į kitą žingsnį
          }}
        />

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Patarimai geriausiems rezultatams:
          </h3>
          <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
            <li>Naudokite PNG formatą su permatomu fonu</li>
            <li>Įkelkite didesnės raiškos paveikslėlį geresnei kokybei</li>
            <li>Rekomenduojamas minimalus dydis: 1000×1000 pikselių</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Dizaino redagavimo žingsnis
  const renderDesignStep = () => {
    // Gauname dabartinio produkto vaizdą iš importuoto PRODUCT_VIEWS
    const views =
      PRODUCT_VIEWS[selectedProduct.id as keyof typeof PRODUCT_VIEWS] || {};
    const currentProductImage =
      views && currentView in views
        ? views[currentView as keyof typeof views]
        : selectedProduct.imageUrl;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Redaguokite dizainą</h2>
          <p className="text-gray-600 mb-6">
            Pritaikykite dizainą ant rūbo - keiskite dydį ir poziciją
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium mb-3">
                Pasirinkite spaudos vietą:
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {Object.entries(printAreas).map(([position, area]) => (
                  <button
                    key={position}
                    onClick={() => onViewChange(position as PrintAreaPosition)}
                    className={`p-3 rounded-lg text-center transition ${
                      currentView === position
                        ? "bg-accent-100 border border-accent-300"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {(area as any).name}
                    </div>
                    {designPreviews[position] && (
                      <div className="text-xs text-green-600 mt-1">
                        ✓ Pridėta
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <EnhancedDesignCanvas
                productImage={currentProductImage}
                uploadedImage={uploadedImage}
                designState={designState}
                onDesignChange={onDesignChange}
                onPreviewGenerated={onPreviewGenerated}
                printAreas={printAreas}
                currentView={currentView}
                onViewChange={onViewChange}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => onNextStep()}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Atgal
          </button>
          <button
            onClick={onNextStep}
            disabled={!Object.values(designPreviews).some((p) => p !== null)}
            className={`px-6 py-2 ${
              Object.values(designPreviews).some((p) => p !== null)
                ? "bg-accent-600 text-white hover:bg-accent-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            } rounded-lg transition-colors`}
          >
            Toliau į užsakymą
          </button>
        </div>
      </div>
    );
  };

  // Užsakymo forma
  const renderOrderStep = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Užsakymo forma</h2>
        <p className="text-gray-600 mb-6">Pateikite užsakymo informaciją</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-md font-medium mb-4">
              Jūsų sukurtas dizainas:
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(designPreviews)
                  .filter(([_, preview]) => preview !== null)
                  .map(([position, preview]) => (
                    <div key={position} className="relative">
                      <div className="aspect-w-3 aspect-h-4 rounded-md overflow-hidden bg-white shadow-sm">
                        <img
                          src={preview || ""}
                          alt={`Dizainas - ${position}`}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div className="absolute top-1 right-1 bg-accent-100 text-xs text-accent-800 px-2 py-1 rounded-full">
                        {printAreas[position as PrintAreaPosition]?.name ||
                          position}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <div className="text-sm font-medium">
                  Pasirinktas produktas:
                </div>
                <div className="text-accent-700">{selectedProduct.name}</div>
              </div>
            </div>
          </div>

          <div>
            <EnhancedOrderForm
              onSubmit={onOrderSubmit}
              isSubmitting={isSubmitting}
              disabled={!Object.values(designPreviews).some((p) => p !== null)}
              designPreviews={designPreviews}
              printAreas={Object.keys(printAreas) as any[]}
              productPrice={selectedProduct.price}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Grąžiname turinį pagal aktyvų žingsnį
  switch (currentStep) {
    case "product":
      return renderProductStep();
    case "upload":
      return renderUploadStep();
    case "design":
      return renderDesignStep();
    case "order":
      return renderOrderStep();
    default:
      return null;
  }
}
