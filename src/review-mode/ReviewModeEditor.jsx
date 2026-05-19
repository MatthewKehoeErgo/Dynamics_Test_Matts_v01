import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { editorPlacement } from "./placementGeometry.js";
import { reviewModeAsset } from "./reviewModeAssets.js";
import { useReviewMode } from "./ReviewModeContext.jsx";

export default function ReviewModeEditor() {
  const { editor, closeEditor, saveEditor, removeComment, resolveComment, saving } = useReviewMode();
  const [authorName, setAuthorName] = useState("");
  const [authorPosition, setAuthorPosition] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    if (!editor) return;
    const c = editor.comment;
    setAuthorName(c?.authorName ?? "");
    setAuthorPosition(c?.authorPosition ?? "");
    setText(c?.text ?? "");
  }, [editor]);

  if (!editor) return null;

  const isEdit = editor.mode === "edit" && editor.comment;
  const clientX = editor.clientX ?? window.innerWidth / 2;
  const clientY = editor.clientY ?? window.innerHeight / 2;
  const layout = editorPlacement(clientX, clientY);

  const cardClass = ["review-mode-editor-card", isEdit ? "review-mode-editor-card--edit" : ""]
    .filter(Boolean)
    .join(" ");

  const buildDraft = () => ({
    mode: editor.mode,
    comment: editor.comment,
    xRatio: editor.xRatio,
    yRatio: editor.yRatio,
    xPosition: editor.xPosition,
    yPosition: editor.yPosition,
  });

  const submitComment = () => {
    if (saving) return;
    saveEditor({
      authorName,
      authorPosition,
      text,
      draft: buildDraft(),
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    submitComment();
  };

  return createPortal(
    <div className="review-mode-editor-shell" data-review-mode-ui="true">
      <div
        className="review-mode-editor-pin"
        style={{
          left: layout.pinLeft,
          top: layout.pinTop,
          width: layout.pinSize,
          height: layout.pinSize,
        }}
      >
        <img src={reviewModeAsset("comment-placed-icon.svg")} alt="" width={layout.pinSize} height={layout.pinSize} />
      </div>
      <form
        className={cardClass}
        data-review-mode-editor="true"
        data-review-mode-ui="true"
        style={{
          left: layout.cardLeft,
          top: layout.cardTop,
          width: layout.cardWidth,
        }}
        onSubmit={onSubmit}
      >
        <div className="review-mode-editor__header">
          <button
            type="button"
            className="review-mode-editor__close"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              closeEditor();
            }}
          >
            <img src={reviewModeAsset("close-small.svg")} alt="" />
          </button>
        </div>
        <div className="review-mode-editor__body">
          <div className="review-mode-editor__fields">
            <input
              className="review-mode-editor__input"
              placeholder="Add your name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
            <input
              className="review-mode-editor__input"
              placeholder="Add your position"
              value={authorPosition}
              onChange={(e) => setAuthorPosition(e.target.value)}
            />
            <textarea
              className="review-mode-editor__textarea"
              placeholder="Add a comment"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  submitComment();
                }
              }}
            />
          </div>
        </div>
        <footer
          className={`review-mode-editor__footer${isEdit ? "" : " review-mode-editor__footer--submit-only"}`}
        >
          {isEdit ? (
            <div className="review-mode-editor__footer-actions">
              <button
                type="button"
                className="review-mode-editor__delete"
                onClick={(e) => {
                  e.stopPropagation();
                  removeComment(editor.comment.id);
                }}
              >
                Delete
              </button>
              <button
                type="button"
                className="review-mode-editor__resolve"
                onClick={(e) => {
                  e.stopPropagation();
                  resolveComment(editor.comment.id);
                }}
              >
                Resolve
              </button>
            </div>
          ) : null}
          <button
            type="button"
            className="review-mode-editor__submit"
            aria-label="Submit comment"
            disabled={saving}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              submitComment();
            }}
          >
            <img src={reviewModeAsset("submit-icon.svg")} alt="" draggable={false} />
          </button>
        </footer>
      </form>
    </div>,
    document.body
  );
}
