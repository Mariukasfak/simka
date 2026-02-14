// filepath: /workspaces/simka/components/DesignWizardStub.tsx
"use client";

import React from "react";

// Eksportuojame WizardStep tipą, kuris naudojamas esamame projekte
export type WizardStep = "product" | "upload" | "design" | "order";

interface DesignWizardProps {
  currentStep: WizardStep;
  setCurrentStep: (step: WizardStep) => void;
  hasUploadedImage: boolean;
  hasDesignedProduct: boolean;
  designPreviews: Record<string, string | null>;
}

/**
 * Šis komponentas yra laikinas sprendimas, kuris leidžia išvengti konfliktų
 * tarp naujo AdvancedDesignWizard ir esamo DesignWizard
 */
export default function DesignWizard({
  currentStep,
  setCurrentStep,
  hasUploadedImage,
  hasDesignedProduct,
  designPreviews,
}: DesignWizardProps) {
  const steps: WizardStep[] = ["product", "upload", "design", "order"];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div
              className={`flex flex-col items-center ${
                currentStep === step
                  ? "text-accent-600"
                  : steps.indexOf(currentStep) > index
                    ? "text-accent-400"
                    : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  currentStep === step
                    ? "bg-accent-600 text-white"
                    : steps.indexOf(currentStep) > index
                      ? "bg-accent-200 text-accent-700"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {index + 1}
              </div>
              <span className="text-xs font-medium">
                {step === "product" && "Produktas"}
                {step === "upload" && "Įkėlimas"}
                {step === "design" && "Dizainas"}
                {step === "order" && "Užsakymas"}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  steps.indexOf(currentStep) > index
                    ? "bg-accent-300"
                    : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Žingsnius rodančios ikonos po progressu */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        {steps.map((step, index) => (
          <div
            key={`status-${step}`}
            className={`text-xs text-center ${
              currentStep === step
                ? "text-accent-600 font-medium"
                : "text-gray-500"
            }`}
          >
            {step === "product" && (
              <span
                className={
                  steps.indexOf(currentStep) >= index
                    ? "text-accent-600"
                    : "text-gray-400"
                }
              >
                {/* Produkto žingsnis visada "atliktas" */}✓
              </span>
            )}

            {step === "upload" && (
              <span
                className={
                  hasUploadedImage ? "text-accent-600" : "text-gray-400"
                }
              >
                {hasUploadedImage ? "✓" : "•"}
              </span>
            )}

            {step === "design" && (
              <span
                className={
                  hasDesignedProduct ? "text-accent-600" : "text-gray-400"
                }
              >
                {hasDesignedProduct ? "✓" : "•"}
              </span>
            )}

            {step === "order" && <span className="text-gray-400">•</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
