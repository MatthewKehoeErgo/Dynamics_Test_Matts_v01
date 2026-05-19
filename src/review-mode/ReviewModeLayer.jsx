import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ratiosToClientPoint } from "./placementGeometry.js";
import { reviewModeAsset } from "./reviewModeAssets.js";
import { useReviewMode } from "./ReviewModeContext.jsx";

function Marker({ comment, onOpen }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const update = useCallback(() => {
    const scrollRoot = document.querySelector("[data-review-mode-scroll-root]");
    const point = ratiosToClientPoint(comment.xRatio, comment.yRatio, scrollRoot);
    setPos(point);
  }, [comment.xRatio, comment.yRatio]);

  useEffect(() => {
    update();
    const scrollRoot = document.querySelector("[data-review-mode-scroll-root]");
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    scrollRoot?.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      scrollRoot?.removeEventListener("scroll", update);
    };
  }, [update]);

  return (
    <button
      type="button"
      className="review-mode-marker"
      data-review-mode-ui="true"
      style={{ left: pos.x, top: pos.y }}
      aria-label={`Comment: ${comment.text}`}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(comment, pos.x, pos.y);
      }}
    >
      <img src={reviewModeAsset("comment-placed-icon.svg")} alt="" />
    </button>
  );
}

export default function ReviewModeLayer() {
  const { comments, commentMode, openEditorForComment, isOverviewRoute, editor } = useReviewMode();

  if (isOverviewRoute) return null;

  return createPortal(
  <div className="review-mode-layer" aria-hidden={false}>
      {comments.map((c) =>
        editor?.comment?.id === c.id ? null : (
          <Marker key={c.id} comment={c} onOpen={openEditorForComment} />
        )
      )}
      {commentMode ? (
        <p id="review-mode-hint" className="review-mode-hint" data-review-mode-ui="true" role="status">
          Click anywhere to place a comment — Esc to cancel — click Add a comment again to leave mode
        </p>
      ) : null}
    </div>,
    document.body
  );
}
