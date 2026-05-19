export function reviewModeAsset(path) {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}review-mode/${path}`;
}
