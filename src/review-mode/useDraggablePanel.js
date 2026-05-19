import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "review-mode-panel-position";
const DEFAULT_MARGIN = 24;

function loadPosition() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

export function useDraggablePanel(panelOpen) {
  const panelRef = useRef(null);
  const dragRef = useRef({ active: false, offsetX: 0, offsetY: 0 });
  const [position, setPosition] = useState(() => loadPosition());

  const anchorDefault = useCallback(() => {
    if (position) return position;
    return {
      right: DEFAULT_MARGIN,
      bottom: DEFAULT_MARGIN,
      left: "auto",
      top: "auto",
    };
  }, [position]);

  useEffect(() => {
    if (!panelOpen || position) return;
    setPosition({
      right: DEFAULT_MARGIN,
      bottom: DEFAULT_MARGIN,
      left: "auto",
      top: "auto",
    });
  }, [panelOpen, position]);

  const onPointerDown = useCallback((e) => {
    if (e.button !== 0) return;
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragRef.current = {
      active: true,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    const panel = panelRef.current;
    const w = panel?.offsetWidth ?? 280;
    const h = panel?.offsetHeight ?? 200;
    const left = Math.min(
      window.innerWidth - w - DEFAULT_MARGIN,
      Math.max(DEFAULT_MARGIN, e.clientX - dragRef.current.offsetX)
    );
    const top = Math.min(
      window.innerHeight - h - DEFAULT_MARGIN,
      Math.max(DEFAULT_MARGIN, e.clientY - dragRef.current.offsetY)
    );
    const next = { left, top, right: "auto", bottom: "auto" };
    setPosition(next);
  }, []);

  const onPointerUp = useCallback((e) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setPosition((prev) => {
      if (prev) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
      return prev;
    });
  }, []);

  const style = anchorDefault();

  return {
    panelRef,
    panelStyle: {
      position: "fixed",
      zIndex: "var(--review-mode-z-panel)",
      left: style.left !== "auto" ? `${style.left}px` : "auto",
      top: style.top !== "auto" ? `${style.top}px` : "auto",
      right: style.right !== "auto" ? `${style.right}px` : "auto",
      bottom: style.bottom !== "auto" ? `${style.bottom}px` : "auto",
    },
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
    },
  };
}
