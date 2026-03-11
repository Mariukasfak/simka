"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  DesignState,
  PrintAreaPosition,
  DesignPosition,
} from "@/lib/types";
import { PRINT_AREAS } from "@/lib/constants";

const initialState: DesignState = {
  position: { x: 0, y: 0 },
  relativePrintAreaPosition: { xPercent: 50, yPercent: 50 },
  scale: 1,
  opacity: 1,
  rotation: 0,
  printArea: "front",
  confirmed: false,
};

// Funkcija, kuri apskaičiuoja santykį tarp spausdinimo plotų
// Tai padės išsaugoti santykinę poziciją tarp skirtingų vaizdų
const calculatePositionRatio = (
  position: DesignPosition,
  sourcePrintArea: PrintAreaPosition,
  targetPrintArea: PrintAreaPosition,
): DesignPosition => {
  if (!PRINT_AREAS[sourcePrintArea] || !PRINT_AREAS[targetPrintArea]) {
    return position; // Jei nėra duomenų apie spausdinimo plotus, grąžiname tą pačią poziciją
  }

  const sourceBounds = PRINT_AREAS[sourcePrintArea].bounds;
  const targetBounds = PRINT_AREAS[targetPrintArea].bounds;

  // Apskaičiuojame, kokia dalis spausdinimo ploto yra užimta (santykis)
  const sourceWidthRatio = position.x / (sourceBounds.width / 100);
  const sourceHeightRatio = position.y / (sourceBounds.height / 100);

  // Pritaikome tą patį santykį naujam spausdinimo plotui
  return {
    x: sourceWidthRatio * (targetBounds.width / 100),
    y: sourceHeightRatio * (targetBounds.height / 100),
  };
};

export function useDesignState() {
  // Saugome atskiras būsenas kiekvienai pozicijai
  const [designStates, setDesignStates] = useState<
    Record<PrintAreaPosition, DesignState>
  >({
    front: { ...initialState, printArea: "front" },
    back: { ...initialState, printArea: "back" },
    "left-sleeve": { ...initialState, printArea: "left-sleeve" },
    "right-sleeve": { ...initialState, printArea: "right-sleeve" },
  });

  const [currentView, setCurrentView] = useState<PrintAreaPosition>("front");

  // Saugome naujausią designStates būseną nuorodoje (ref), kad
  // getAllDesignStates funkcija būtų stabili ir nesikeistų keičiantis state
  const designStatesRef = useRef(designStates);

  useEffect(() => {
    designStatesRef.current = designStates;
  }, [designStates]);

  // Naudojame ref, kad išvengti begalinio ciklo
  const skipUpdateRef = useRef(false);
  const isFirstRender = useRef(true);
  const previousViewRef = useRef<PrintAreaPosition>("front");
  const positionRatiosRef = useRef<
    Record<
      PrintAreaPosition,
      {
        x: number;
        y: number;
        xPercent: number;
        yPercent: number;
      }
    >
  >({
    front: { x: 0, y: 0, xPercent: 50, yPercent: 50 },
    back: { x: 0, y: 0, xPercent: 50, yPercent: 50 },
    "left-sleeve": { x: 0, y: 0, xPercent: 50, yPercent: 50 },
    "right-sleeve": { x: 0, y: 0, xPercent: 50, yPercent: 50 },
  });

  // Patogi prieiga prie dabartinės pozicijos dizaino būsenos
  const designState = designStates[currentView];

  // Atnaujina tik dabartinės pozicijos dizaino būseną
  const updateDesignState = useCallback(
    (changes: Partial<DesignState>) => {
      // Jei turime praleisti atnaujinimą (vyksta vidinis atnaujinimas), ignoruojame
      if (skipUpdateRef.current) {
        skipUpdateRef.current = false;
        return;
      }

      // Išsaugome dabartinę poziciją, jei ji nenustatyta
      const printArea = changes.printArea || currentView;

      // Jei keičiasi pozicija, atnaujiname ir santykinės pozicijos vertę
      if (changes.position) {
        const printAreaData = PRINT_AREAS[printArea];
        if (printAreaData && printAreaData.bounds) {
          const { width, height } = printAreaData.bounds;
          // Išsaugome santykį tarp pozicijos ir spausdinimo ploto dydžio
          positionRatiosRef.current[printArea] = {
            x: changes.position.x / (width / 100),
            y: changes.position.y / (height / 100),
            xPercent:
              changes.relativePrintAreaPosition?.xPercent ||
              ((changes.position.x + width / 2) / width) * 100,
            yPercent:
              changes.relativePrintAreaPosition?.yPercent ||
              ((changes.position.y + height / 2) / height) * 100,
          };
        }
      }

      // Jei pateikta nauja santykinė pozicija, naudojame ją
      if (changes.relativePrintAreaPosition) {
        positionRatiosRef.current[printArea] = {
          ...positionRatiosRef.current[printArea],
          xPercent: changes.relativePrintAreaPosition.xPercent,
          yPercent: changes.relativePrintAreaPosition.yPercent,
        };
      }

      setDesignStates((prev) => ({
        ...prev,
        [printArea]: {
          ...prev[printArea],
          ...changes,
          printArea: printArea,
        },
      }));
    },
    [currentView],
  );

  // Nustatome naują vaizdą ir pritaikome santykinę poziciją iš ankstesnio vaizdo
  const setView = useCallback(
    (view: PrintAreaPosition) => {
      // Jei view nesikeitė, nieko nedarome
      if (view === currentView) return;

      // Išsaugome dabartinį vaizdą prieš jį pakeičiant
      previousViewRef.current = currentView;

      const sourcePrintArea = PRINT_AREAS[previousViewRef.current];
      const targetPrintArea = PRINT_AREAS[view];

      if (sourcePrintArea && targetPrintArea) {
        const currentDesign = designStates[previousViewRef.current];
        const relPosition = positionRatiosRef.current[previousViewRef.current];

        const newPosition = {
          x:
            (relPosition.xPercent / 100) * targetPrintArea.bounds.width -
            targetPrintArea.bounds.width / 2,
          y:
            (relPosition.yPercent / 100) * targetPrintArea.bounds.height -
            targetPrintArea.bounds.height / 2,
        };

        skipUpdateRef.current = true;

        setDesignStates((prev) => ({
          ...prev,
          [view]: {
            ...prev[view],
            position: newPosition,
            relativePrintAreaPosition: {
              xPercent: relPosition.xPercent,
              yPercent: relPosition.yPercent,
            },
          },
        }));
      }

      setCurrentView(view);
    },
    [currentView, designStates],
  );

  // Atstatome visų vaizdų dizaino būsenas į pradinę
  const resetDesignState = useCallback(() => {
    positionRatiosRef.current = {
      front: { x: 0, y: 0, xPercent: 50, yPercent: 50 },
      back: { x: 0, y: 0, xPercent: 50, yPercent: 50 },
      "left-sleeve": { x: 0, y: 0, xPercent: 50, yPercent: 50 },
      "right-sleeve": { x: 0, y: 0, xPercent: 50, yPercent: 50 },
    };

    setDesignStates({
      front: { ...initialState, printArea: "front" },
      back: { ...initialState, printArea: "back" },
      "left-sleeve": { ...initialState, printArea: "left-sleeve" },
      "right-sleeve": { ...initialState, printArea: "right-sleeve" },
    });
  }, []);

  // Gauti visų dizaino būsenų objektą (naudojama siuntimui)
  // Naudojame ref, kad funkcija būtų stabili (nesikeistų nuoroda)
  const getAllDesignStates = useCallback(() => {
    return designStatesRef.current;
  }, []);

  // Effect'as, kad išvalytų pirmojo rendarinimo žymę
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, []);

  return {
    designState,
    designStates,
    currentView,
    updateDesignState,
    setCurrentView: setView,
    resetDesignState,
    getAllDesignStates,
  };
}
