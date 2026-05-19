export function findScrollRoot(fromTarget) {
  if (fromTarget?.closest) {
    const el = fromTarget.closest("[data-review-mode-scroll-root]");
    if (el) return el;
  }
  return document.querySelector("[data-review-mode-scroll-root]");
}

export function isReviewModeUi(target) {
  return Boolean(
    target?.closest?.('[data-review-mode-ui="true"]') ||
      target?.closest?.("[data-review-mode-editor]")
  );
}

export function clickToRatios(clientX, clientY, scrollRoot) {
  const root = scrollRoot ?? document.documentElement;
  const rect = root.getBoundingClientRect();
  const scrollLeft = root.scrollLeft ?? 0;
  const scrollTop = root.scrollTop ?? 0;
  const contentWidth = Math.max(root.scrollWidth, rect.width, 1);
  const contentHeight = Math.max(root.scrollHeight, rect.height, 1);
  const x = clientX - rect.left + scrollLeft;
  const y = clientY - rect.top + scrollTop;
  return {
    xRatio: Math.min(1, Math.max(0, x / contentWidth)),
    yRatio: Math.min(1, Math.max(0, y / contentHeight)),
    xPosition: x,
    yPosition: y,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  };
}

export function ratiosToClientPoint(xRatio, yRatio, scrollRoot) {
  const root = scrollRoot ?? document.querySelector("[data-review-mode-scroll-root]");
  if (!root) {
    return { x: window.innerWidth * xRatio, y: window.innerHeight * yRatio };
  }
  const rect = root.getBoundingClientRect();
  const scrollLeft = root.scrollLeft ?? 0;
  const scrollTop = root.scrollTop ?? 0;
  const contentWidth = Math.max(root.scrollWidth, rect.width, 1);
  const contentHeight = Math.max(root.scrollHeight, rect.height, 1);
  return {
    x: rect.left - scrollLeft + xRatio * contentWidth,
    y: rect.top - scrollTop + yRatio * contentHeight,
  };
}

/** Estimated height for viewport clamping (card sizes itself via CSS). */
export const EDITOR_CARD_ESTIMATED_HEIGHT = 272;

export function editorPlacement(clientX, clientY, estimatedCardHeight = EDITOR_CARD_ESTIMATED_HEIGHT) {
  const pinSize = 56 * 0.7;
  const gap = 16;
  const cardWidth = Math.min(392, Math.max(240, window.innerWidth - 120));
  const cardHeight = estimatedCardHeight;
  const pad = 8;
  const placeRight = clientX < window.innerWidth / 2;
  let cardLeft = placeRight ? clientX + pinSize + gap : clientX - pinSize - gap - cardWidth;
  let cardTop = clientY - cardHeight / 2;
  cardLeft = Math.min(window.innerWidth - cardWidth - pad, Math.max(pad, cardLeft));
  cardTop = Math.min(window.innerHeight - cardHeight - pad, Math.max(pad, cardTop));
  return {
    pinSize,
    pinLeft: clientX - pinSize / 2,
    pinTop: clientY - pinSize / 2,
    cardLeft,
    cardTop,
    cardWidth,
    cardHeight,
    placeRight,
  };
}
