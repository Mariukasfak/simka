import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import type { Design, PrintAreaPosition } from "@/lib/types";

interface DesignCollectionState {
  designs: Record<PrintAreaPosition, Design[]>;
  activeDesignId: string | null;
  currentArea: PrintAreaPosition;
  previews: Record<PrintAreaPosition, string | null>;
}

export function useDesignCollection() {
  const [state, setState] = useState<DesignCollectionState>({
    designs: {
      front: [],
      back: [],
      "left-sleeve": [],
      "right-sleeve": [],
    },
    activeDesignId: null,
    currentArea: "front",
    previews: {
      front: null,
      back: null,
      "left-sleeve": null,
      "right-sleeve": null,
    },
  });

  const addDesign = useCallback((imageUrl: string, area: PrintAreaPosition) => {
    const newDesign: Design = {
      id: nanoid(),
      imageUrl,
      position: { x: 0, y: 0 },
      scale: 1,
      opacity: 1,
      rotation: 0,
      printArea: area,
      confirmed: false,
    };

    setState((prev) => ({
      ...prev,
      designs: {
        ...prev.designs,
        [area]: [...prev.designs[area], newDesign],
      },
      activeDesignId: newDesign.id,
    }));
  }, []);

  const updateDesign = useCallback(
    (designId: string, updates: Partial<Design>) => {
      setState((prev) => {
        const area = Object.entries(prev.designs).find(([_, designs]) =>
          designs.some((d) => d.id === designId),
        )?.[0] as PrintAreaPosition;

        if (!area) return prev;

        return {
          ...prev,
          designs: {
            ...prev.designs,
            [area]: prev.designs[area].map((design) =>
              design.id === designId ? { ...design, ...updates } : design,
            ),
          },
        };
      });
    },
    [],
  );

  const removeDesign = useCallback((designId: string) => {
    setState((prev) => {
      const newDesigns = { ...prev.designs };
      Object.keys(newDesigns).forEach((area) => {
        newDesigns[area as PrintAreaPosition] = newDesigns[
          area as PrintAreaPosition
        ].filter((d) => d.id !== designId);
      });

      return {
        ...prev,
        designs: newDesigns,
        activeDesignId:
          prev.activeDesignId === designId ? null : prev.activeDesignId,
      };
    });
  }, []);

  const cloneDesign = useCallback((designId: string) => {
    setState((prev) => {
      const area = Object.entries(prev.designs).find(([_, designs]) =>
        designs.some((d) => d.id === designId),
      )?.[0] as PrintAreaPosition;

      if (!area) return prev;

      const designToClone = prev.designs[area].find((d) => d.id === designId);
      if (!designToClone) return prev;

      const clonedDesign: Design = {
        ...designToClone,
        id: nanoid(),
        position: {
          x: designToClone.position.x + 20,
          y: designToClone.position.y + 20,
        },
        confirmed: false,
      };

      return {
        ...prev,
        designs: {
          ...prev.designs,
          [area]: [...prev.designs[area], clonedDesign],
        },
        activeDesignId: clonedDesign.id,
      };
    });
  }, []);

  const setCurrentArea = useCallback((area: PrintAreaPosition) => {
    setState((prev) => ({
      ...prev,
      currentArea: area,
      activeDesignId: null,
    }));
  }, []);

  const updatePreview = useCallback(
    (area: PrintAreaPosition, preview: string | null) => {
      setState((prev) => ({
        ...prev,
        previews: {
          ...prev.previews,
          [area]: preview,
        },
      }));
    },
    [],
  );

  const confirmAllDesigns = useCallback(() => {
    setState((prev) => {
      const newDesigns = { ...prev.designs };
      Object.keys(newDesigns).forEach((area) => {
        newDesigns[area as PrintAreaPosition] = newDesigns[
          area as PrintAreaPosition
        ].map((design) => ({ ...design, confirmed: true }));
      });
      return { ...prev, designs: newDesigns };
    });
  }, []);

  const resetAll = useCallback(() => {
    setState({
      designs: {
        front: [],
        back: [],
        "left-sleeve": [],
        "right-sleeve": [],
      },
      activeDesignId: null,
      currentArea: "front",
      previews: {
        front: null,
        back: null,
        "left-sleeve": null,
        "right-sleeve": null,
      },
    });
  }, []);

  const getAreaStatus = useCallback(
    (area: PrintAreaPosition) => {
      const areaDesigns = state.designs[area];
      return {
        hasDesigns: areaDesigns.length > 0,
        designsCount: areaDesigns.length,
        hasPreview: !!state.previews[area],
        allConfirmed: areaDesigns.every((d) => d.confirmed),
      };
    },
    [state.designs, state.previews],
  );

  const getTotalDesignsCount = useCallback(() => {
    return Object.values(state.designs).reduce(
      (total, designs) => total + designs.length,
      0,
    );
  }, [state.designs]);

  return {
    designs: state.designs,
    currentAreaDesigns: state.designs[state.currentArea],
    activeDesignId: state.activeDesignId,
    currentArea: state.currentArea,
    previews: state.previews,
    setActiveDesignId: (id: string | null) =>
      setState((prev) => ({ ...prev, activeDesignId: id })),
    setCurrentArea,
    addDesign,
    updateDesign,
    removeDesign,
    cloneDesign,
    updatePreview,
    confirmAllDesigns,
    resetAll,
    getAreaStatus,
    getTotalDesignsCount,
  };
}
