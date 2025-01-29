'use client';
import { useEffect, useState, useCallback } from "react";

// eslint-disable-next-line react-hooks/exhaustive-deps
const  useInputPosition = (ref: any, threshold = 100)  => {
  const [positionClass, setPositionClass] = useState("bottom");

  const handleScroll = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const isAtBottom = window.innerHeight - rect.bottom - 120 >= threshold;
      setPositionClass(isAtBottom ? "bottom" : "top");
    }
  }, [ref, threshold]); // 'ref' is included for clarity, even though it's stable

  useEffect(() => {
    // Attach listeners
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    // Initial calculation
    handleScroll();

    // Cleanup listeners
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll]); // Only handleScroll in the dependency array

  return positionClass;
}


export default useInputPosition;