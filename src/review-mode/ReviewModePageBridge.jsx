import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getPageIdentity, parsePageKeyToView } from "./pageIdentity.js";
import { useReviewMode } from "./ReviewModeContext.jsx";

export default function ReviewModePageBridge({ view, setView, ctx }) {
  const location = useLocation();
  const { setPageIdentity, openPanel } = useReviewMode();

  const pageIdentity = useMemo(() => getPageIdentity(view, ctx), [view, ctx]);

  useEffect(() => {
    setPageIdentity(pageIdentity);
  }, [pageIdentity, setPageIdentity]);

  useEffect(() => {
    const state = location.state;
    if (!state?.pageKey || !setView) return;
    const nextView = parsePageKeyToView(state.pageKey);
    setView(nextView);
    if (state.focusCommentId) {
      openPanel();
    }
  }, [location.state, setView, openPanel]);

  return null;
}
