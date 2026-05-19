import { createContext, useContext } from "react";

export const ReviewModeContext = createContext(null);

export function useReviewMode() {
  const ctx = useContext(ReviewModeContext);
  if (!ctx) {
    throw new Error("useReviewMode must be used within ReviewModeProvider");
  }
  return ctx;
}
