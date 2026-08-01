"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { NotebookOnboarding } from "@/components/onboarding/notebook-onboarding";

interface WipeOrigin {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OnboardingContextValue {
  openNotebookOnboarding: (origin?: DOMRect | null) => void;
}

const OnboardingContext = createContext<OnboardingContextValue>({
  openNotebookOnboarding: () => {},
});

export function useOnboarding() {
  return useContext(OnboardingContext);
}

function toWipeOrigin(rect: DOMRect | null | undefined): WipeOrigin | null {
  if (!rect) return null;
  return {
    x: Number.isFinite(rect.x) ? rect.x : 0,
    y: Number.isFinite(rect.y) ? rect.y : 0,
    width: Number.isFinite(rect.width) ? rect.width : 0,
    height: Number.isFinite(rect.height) ? rect.height : 0,
  };
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<WipeOrigin | null>(null);

  const openNotebookOnboarding = useCallback((origin?: DOMRect | null) => {
    setOrigin(toWipeOrigin(origin));
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setOrigin(null);
  }, []);

  return (
    <OnboardingContext.Provider value={{ openNotebookOnboarding }}>
      {children}
      <NotebookOnboarding open={open} onClose={handleClose} origin={origin} />
    </OnboardingContext.Provider>
  );
}
