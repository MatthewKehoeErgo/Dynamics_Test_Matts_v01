import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import App from "./App.jsx";
import ReviewModeEditor from "./review-mode/ReviewModeEditor.jsx";
import ReviewModeLauncher from "./review-mode/ReviewModeLauncher.jsx";
import ReviewModeLayer from "./review-mode/ReviewModeLayer.jsx";
import ReviewModePanel from "./review-mode/ReviewModePanel.jsx";
import ReviewModeProvider from "./review-mode/ReviewModeProvider.jsx";
import ReviewModeVersionPill from "./review-mode/ReviewModeVersionPill.jsx";

export default function PrototypeShell() {
  const location = useLocation();
  const focusRequest = useMemo(() => {
    const state = location.state;
    if (!state?.focusCommentId) return null;
    return { commentId: state.focusCommentId, pageKey: state.pageKey };
  }, [location.state]);

  const [focusHandled, setFocusHandled] = useState(false);

  useEffect(() => {
    setFocusHandled(false);
  }, [location.key]);

  return (
    <ReviewModeProvider
      focusRequest={focusRequest && !focusHandled ? focusRequest : null}
      onFocusHandled={() => setFocusHandled(true)}
    >
      <App />
      <ReviewModeLauncher />
      <ReviewModePanel />
      <ReviewModeLayer />
      <ReviewModeEditor />
      <ReviewModeVersionPill />
    </ReviewModeProvider>
  );
}
