import { useMemo } from "react";

const STORAGE_KEY = "review-mode-session-id";

function createSessionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `rm-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function useSessionId() {
  return useMemo(() => {
    try {
      let id = sessionStorage.getItem(STORAGE_KEY);
      if (!id) {
        id = createSessionId();
        sessionStorage.setItem(STORAGE_KEY, id);
      }
      return id;
    } catch {
      return createSessionId();
    }
  }, []);
}
