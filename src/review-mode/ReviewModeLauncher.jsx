import { useReviewMode } from "./ReviewModeContext.jsx";

export default function ReviewModeLauncher() {
  const { panelOpen, openPanel, isOverviewRoute } = useReviewMode();

  if (panelOpen || isOverviewRoute) return null;

  return (
    <button
      type="button"
      className="review-mode-launcher"
      aria-controls="review-mode-panel"
      aria-expanded={false}
      data-review-mode-ui="true"
      onClick={openPanel}
    >
      Review Mode
    </button>
  );
}
