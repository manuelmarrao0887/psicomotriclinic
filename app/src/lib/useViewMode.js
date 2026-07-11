import { useEffect, useState } from "react";

const KEY = "psm.view.override"; // "mobile" | "desktop" | null (auto)
const MQ = "(max-width: 899.98px)";

function readOverride() {
  if (typeof localStorage === "undefined") return null;
  const v = localStorage.getItem(KEY);
  return v === "mobile" || v === "desktop" ? v : null;
}

export function useViewMode() {
  const [override, setOverrideState] = useState(readOverride);
  const [autoMobile, setAutoMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MQ).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(MQ);
    const h = (e) => setAutoMobile(e.matches);
    mq.addEventListener?.("change", h) ?? mq.addListener(h);
    return () => mq.removeEventListener?.("change", h) ?? mq.removeListener(h);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (e.key === KEY) setOverrideState(readOverride());
    };
    window.addEventListener("storage", h);
    window.addEventListener("psm-view-changed", () => setOverrideState(readOverride()));
    return () => {
      window.removeEventListener("storage", h);
    };
  }, []);

  const isMobile = override ? override === "mobile" : autoMobile;

  const setOverride = (mode) => {
    if (mode === null || mode === undefined) {
      localStorage.removeItem(KEY);
    } else {
      localStorage.setItem(KEY, mode);
    }
    setOverrideState(mode || null);
    window.dispatchEvent(new Event("psm-view-changed"));
  };

  return { isMobile, override, setOverride, autoMobile };
}
