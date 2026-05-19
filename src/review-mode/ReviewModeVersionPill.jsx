import { useReviewMode } from "./ReviewModeContext.jsx";

export default function ReviewModeVersionPill() {
  const { currentVersion, isOverviewRoute } = useReviewMode();
  if (isOverviewRoute) return null;
  return <div className="review-mode-version-pill">{currentVersion.label}</div>;
}
