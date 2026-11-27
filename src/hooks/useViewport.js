import { useState, useEffect } from "react";

export function useViewport() {
  const getState = () => {
    if (typeof window === "undefined") {
      return {
        isMobile: false,
        isTablet: false,
        isCompact: false,
        isTouch: false,
      };
    }
    const width = window.innerWidth;
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;
    const isCompact = width < 1024;
    const isTouch =
      window.matchMedia?.("(pointer: coarse)")?.matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;
    return { isMobile, isTablet, isCompact, isTouch };
  };

  const [viewport, setViewport] = useState(getState);

  useEffect(() => {
    const update = () => setViewport(getState());

    const mqlMobile = window.matchMedia("(max-width: 639px)");
    const mqlCompact = window.matchMedia("(max-width: 1023px)");
    const mqlCoarse = window.matchMedia("(pointer: coarse)");

    mqlMobile.addEventListener("change", update);
    mqlCompact.addEventListener("change", update);
    mqlCoarse.addEventListener("change", update);
    window.addEventListener("resize", update);

    return () => {
      mqlMobile.removeEventListener("change", update);
      mqlCompact.removeEventListener("change", update);
      mqlCoarse.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return viewport;
}
