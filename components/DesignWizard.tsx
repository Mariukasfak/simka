import { useState, useEffect } from 'react';
import { Product, PrintAreaPosition } from '@/lib/types';

export type WizardStep = 'product' | 'upload' | 'design' | 'order';

interface DesignWizardProps {
  currentStep: WizardStep;
  setCurrentStep: (step: WizardStep) => void;
  hasUploadedImage: boolean;
  hasDesignedProduct: boolean;
  designPreviews: Record<string, string | null>;
}

export default function DesignWizard({
  currentStep,
  setCurrentStep,
  hasUploadedImage,
  hasDesignedProduct,
  designPreviews
}: DesignWizardProps) {
  // Žingsnių duomenys
  const steps: Array<{
    id: WizardStep;
    name: string;
    description: string;
    isCompleted: boolean;
    isDisabled: boolean;
  }> = [
    {
      id: 'product',
      name: '1. Pasirink rūbą',
      description: 'Išsirink marškinėlius ar džemperį',
      isCompleted: currentStep !== 'product',
      isDisabled: false
    },
    {
      id: 'upload',
      name: '2. Įkelk logotipą',
      description: 'Įkelk savo logotipą ar dizainą',
      isCompleted: hasUploadedImage,
      isDisabled: currentStep === 'product'
    },
    {
      id: 'design',
      name: '3. Redaguok dizainą',
      description: 'Pritaikyk dizainą ant rūbo',
      isCompleted: hasDesignedProduct || Object.values(designPreviews).some(preview => preview !== null),
      isDisabled: !hasUploadedImage
    },
    {
      id: 'order',
      name: '4. Užsakyk',
      description: 'Pateik užsakymą',
      isCompleted: false,
      isDisabled: !hasDesignedProduct && !Object.values(designPreviews).some(preview => preview !== null)
    }
  ];

  // Žingsnio perjungimo funkcija
  const goToStep = (step: WizardStep) => {
    // Tikriname, ar galima pereiti į šį žingsnį
    const stepData = steps.find(s => s.id === step);
    if (stepData && !stepData.isDisabled) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="mb-8">
      {/* Progreso juosta */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between w-full">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`relative flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              {/* Jungiamoji linija tarp žingsnių */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute left-1/2 top-4 w-full h-0.5 transform -translate-y-1/2 ${
                    steps[index + 1].isCompleted || currentStep === steps[index + 1].id 
                      ? 'bg-accent-600' 
                      : 'bg-gray-200'
                  }`}
                ></div>
              )}
              
              {/* Žingsnio indikatorius */}
              <button
                onClick={() => goToStep(step.id)}
                disabled={step.isDisabled}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium relative z-10 transition-colors ${
                  step.isCompleted
                    ? 'bg-accent-600 text-white' 
                    : currentStep === step.id
                      ? 'bg-accent-100 border-2 border-accent-600 text-accent-600' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {step.isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
              
              {/* Žingsnio pavadinimas */}
              <div className="text-xs font-medium mt-2 text-center">
                {step.name.split('. ')[1]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}