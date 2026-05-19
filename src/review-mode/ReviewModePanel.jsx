import { reviewModeAsset } from "./reviewModeAssets.js";
import { useReviewMode } from "./ReviewModeContext.jsx";
import { useDraggablePanel } from "./useDraggablePanel.js";

export default function ReviewModePanel() {
  const {
    panelOpen,
    closePanel,
    commentMode,
    toggleCommentMode,
    openOverview,
    currentVersion,
    versions,
    switchVersion,
    isOverviewRoute,
  } = useReviewMode();

  const { panelRef, panelStyle, handleProps } = useDraggablePanel(panelOpen);

  if (!panelOpen || isOverviewRoute) return null;

  return (
    <aside
      ref={panelRef}
      id="review-mode-panel"
      className="review-mode-panel"
      style={panelStyle}
      aria-label="Draggable review mode panel"
      data-review-mode-ui="true"
    >
      <div className="review-mode-panel__handle" {...handleProps}>
        <span className="review-mode-panel__title">Review Mode</span>
        <img
          className="review-mode-panel__grip"
          src={reviewModeAsset("drag-pan.svg")}
          alt=""
        />
        <button
          type="button"
          className="review-mode-panel__close"
          aria-label="Close review mode panel"
          onClick={(e) => {
            e.stopPropagation();
            closePanel();
          }}
        >
          <img src={reviewModeAsset("close-small.svg")} alt="" />
        </button>
      </div>

      <div className="review-mode-panel__content">
        <div className="review-mode-panel__actions">
          <button
            type="button"
            className={`review-mode-panel__action review-mode-panel__comment-btn${commentMode ? " is-active" : ""}`}
            onClick={toggleCommentMode}
          >
            <img
              className="review-mode-panel__comment-icon"
              src={reviewModeAsset("add-comment-icon-button.svg")}
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
            />
            Add a comment
          </button>
          <button
            type="button"
            className="review-mode-panel__action"
            onClick={openOverview}
          >
            <span className="review-mode-panel__overview-icon" aria-hidden="true">
              table_chart
            </span>
            View all comments
          </button>
        </div>

        <details className="review-mode-panel__dropdown">
          <summary className="review-mode-panel__summary">
            {currentVersion.label}
            <span className="review-mode-panel__caret" aria-hidden="true">
              ▾
            </span>
          </summary>
          <ul className="review-mode-panel__version-list">
            {versions.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  className="review-mode-panel__version-link"
                  onClick={() => switchVersion(v.id)}
                >
                  {v.label}
                </button>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </aside>
  );
}
