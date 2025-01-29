'use client'
import { useState, useEffect } from "react";

type ScreenType = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const getScreenType = (width: number): ScreenType => {
    if (width >= 1536) return "2xl"; // Tailwind 2xl: ≥ 1536px
    if (width >= 1280) return "xl";  // Tailwind xl: 1280px - 1535px
    if (width >= 1024) return "lg";  // Tailwind lg: 1024px - 1279px
    if (width >= 768) return "md";   // Tailwind md: 768px - 1023px
    if (width >= 640) return "sm";   
    return "xs";                     // Tailwind sm: < 768px
  };
  
const useScreenType = (): ScreenType | null => {
  const [screenType, setScreenType] = useState<ScreenType | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateScreenType = () => setScreenType(getScreenType(window.innerWidth));

    updateScreenType();
    window.addEventListener("resize", updateScreenType);

    return () => {
      window.removeEventListener("resize", updateScreenType);
    };
  }, []);

  return screenType;
};

export default useScreenType;
