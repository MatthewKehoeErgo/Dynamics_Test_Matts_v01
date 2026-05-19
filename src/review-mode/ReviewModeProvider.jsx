import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  captureAndUploadPreview,
  createComment,
  createSessionRow,
  deleteComment,
  listComments,
  updateComment,
} from "./commentsRepository.js";
import { clickToRatios, isReviewModeUi } from "./placementGeometry.js";
import { getVersionById, PROTOTYPE_VERSIONS } from "./prototypeVersions.js";
import { ReviewModeContext } from "./ReviewModeContext.jsx";
import { useSessionId } from "./useSessionId.js";

export default function ReviewModeProvider({
  children,
  focusRequest,
  onFocusHandled,
}) {
  const [pageIdentity, setPageIdentity] = useState({ pageKey: "students", screenLabel: "Students" });
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = useSessionId();

  const [panelOpen, setPanelOpen] = useState(false);
  const [commentMode, setCommentMode] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentVersionId, setCurrentVersionId] = useState("v1");
  const [editor, setEditor] = useState(null);
  const editorRef = useRef(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const currentVersion = useMemo(
    () => getVersionById(currentVersionId),
    [currentVersionId]
  );

  const isOverviewRoute = location.pathname === "/comments-overview";

  const refreshComments = useCallback(async () => {
    if (!pageIdentity?.pageKey) return;
    setLoading(true);
    try {
      const rows = await listComments({
        version: currentVersionId,
        pageKey: pageIdentity.pageKey,
      });
      setComments(rows);
    } catch (err) {
      console.error("Failed to load comments", err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [pageIdentity?.pageKey, currentVersionId]);

  useEffect(() => {
    if (isOverviewRoute) return;
    refreshComments();
  }, [isOverviewRoute, refreshComments]);

  useEffect(() => {
    const html = document.documentElement;
    if (commentMode && !isOverviewRoute) {
      html.classList.add("review-mode-placement-active");
      document.body.classList.add("review-mode-placement-active");
    } else {
      html.classList.remove("review-mode-placement-active");
      document.body.classList.remove("review-mode-placement-active");
    }
    return () => {
      html.classList.remove("review-mode-placement-active");
      document.body.classList.remove("review-mode-placement-active");
    };
  }, [commentMode, isOverviewRoute]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (editor) {
        setEditor(null);
        return;
      }
      if (commentMode) setCommentMode(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commentMode, editor]);

  useEffect(() => {
    if (!focusRequest?.commentId || isOverviewRoute) return;
    const id = Number(focusRequest.commentId);
    listComments({ version: currentVersionId })
      .then((rows) => {
        const found = rows.find((c) => c.id === id);
        if (found) {
          setEditor({ mode: "edit", comment: found, clientX: null, clientY: null });
        }
        onFocusHandled?.();
      })
      .catch(() => onFocusHandled?.());
  }, [focusRequest, isOverviewRoute, currentVersionId, onFocusHandled]);

  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const toggleCommentMode = useCallback(() => {
    setCommentMode((v) => !v);
    setEditor(null);
  }, []);

  const closeEditor = useCallback(() => setEditor(null), []);

  const handlePlacementClick = useCallback(
    (e) => {
      if (!commentMode || isOverviewRoute) return;
      if (isReviewModeUi(e.target)) return;
      const scrollRoot = e.target.closest?.("[data-review-mode-scroll-root]");
      if (!scrollRoot) return;
      const ratios = clickToRatios(e.clientX, e.clientY, scrollRoot);
      setEditor({
        mode: "create",
        comment: null,
        clientX: e.clientX,
        clientY: e.clientY,
        ...ratios,
      });
      setCommentMode(false);
    },
    [commentMode, isOverviewRoute]
  );

  useEffect(() => {
    if (!commentMode || isOverviewRoute) return;
    const onClick = (e) => handlePlacementClick(e);
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [commentMode, isOverviewRoute, handlePlacementClick]);

  const openEditorForComment = useCallback((comment, clientX, clientY) => {
    setEditor({
      mode: "edit",
      comment,
      clientX: clientX ?? window.innerWidth / 2,
      clientY: clientY ?? window.innerHeight / 2,
    });
  }, []);

  const saveEditor = useCallback(
    async ({ authorName, authorPosition, text, draft }) => {
      const ed = draft ?? editorRef.current;
      if (!ed) {
        console.warn("Review Mode: save called without editor state");
        return;
      }
      if (!pageIdentity?.pageKey) {
        window.alert("Could not save: screen context is missing. Navigate to a screen and try again.");
        return;
      }

      const bodyText = text?.trim() ?? "";
      if (!bodyText) {
        window.alert("Please enter a comment before submitting.");
        return;
      }

      const base = {
        authorName: authorName?.trim() ?? "",
        authorPosition: authorPosition?.trim() ?? "",
        text: bodyText,
        pageKey: pageIdentity.pageKey,
        version: currentVersionId,
        sessionId,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };

      setSaving(true);
      try {
        if (ed.mode === "create") {
          const created = await createComment({
            ...base,
            xRatio: ed.xRatio ?? 0.5,
            yRatio: ed.yRatio ?? 0.5,
            xPosition: ed.xPosition,
            yPosition: ed.yPosition,
          });
          setEditor(null);
          editorRef.current = null;
          await refreshComments();
          createSessionRow(base.authorName).catch(() => {});
          captureAndUploadPreview(created.id)
            .then((previewUrl) => {
              if (previewUrl) {
                return updateComment(created.id, { ...created, previewUrl, text: base.text });
              }
              return null;
            })
            .then(() => refreshComments())
            .catch(() => {});
        } else if (ed.comment) {
          await updateComment(ed.comment.id, {
            ...ed.comment,
            ...base,
          });
          setEditor(null);
          editorRef.current = null;
          await refreshComments();
        }
      } catch (err) {
        console.error("Save comment failed", err);
        const msg =
          err?.message?.includes("42501") || err?.message?.includes("row-level security")
            ? "Supabase blocked this save. Run supabase/rls_policies.sql in the SQL Editor (anon insert policy on Comments)."
            : err?.message?.includes("JWT") || err?.message?.includes("401")
              ? "Supabase API key rejected. Check VITE_SUPABASE_ANON_KEY in .env.local and restart npm run dev."
              : `Could not save comment: ${err?.message || "Unknown error"}`;
        window.alert(msg);
      } finally {
        setSaving(false);
      }
    },
    [pageIdentity, currentVersionId, sessionId, refreshComments]
  );

  const removeComment = useCallback(
    async (id) => {
      if (!window.confirm("Delete this comment?")) return;
      try {
        await deleteComment(id);
        setEditor(null);
        await refreshComments();
      } catch (err) {
        console.error(err);
        window.alert("Could not delete comment.");
      }
    },
    [refreshComments]
  );

  const resolveComment = useCallback(
    async (id) => {
      if (!window.confirm("Mark this comment as resolved?")) return;
      try {
        const c = comments.find((x) => x.id === id) ?? editor?.comment;
        if (!c) return;
        await updateComment(id, {
          ...c,
          status: "resolved",
          resolvedAt: new Date().toISOString(),
        });
        setEditor(null);
        await refreshComments();
      } catch (err) {
        console.error(err);
        window.alert("Could not resolve comment.");
      }
    },
    [comments, editor, refreshComments]
  );

  const openOverview = useCallback(() => {
    navigate(`/comments-overview?version=${currentVersionId}`);
  }, [navigate, currentVersionId]);

  const switchVersion = useCallback(
    (versionId) => {
      const v = getVersionById(versionId);
      if (v.externalUrl) {
        window.location.href = v.externalUrl;
        return;
      }
      setCurrentVersionId(v.id);
      if (v.homeHash) navigate("/");
    },
    [navigate]
  );

  const value = useMemo(
    () => ({
      panelOpen,
      openPanel,
      closePanel,
      commentMode,
      toggleCommentMode,
      comments,
      loading,
      editor,
      closeEditor,
      openEditorForComment,
      saveEditor,
      removeComment,
      resolveComment,
      currentVersion,
      currentVersionId,
      versions: PROTOTYPE_VERSIONS,
      switchVersion,
      openOverview,
      sessionId,
      pageIdentity,
      isOverviewRoute,
      setPageIdentity,
      saving,
    }),
    [
      panelOpen,
      openPanel,
      closePanel,
      commentMode,
      toggleCommentMode,
      comments,
      loading,
      editor,
      closeEditor,
      openEditorForComment,
      saveEditor,
      removeComment,
      resolveComment,
      currentVersion,
      currentVersionId,
      switchVersion,
      openOverview,
      sessionId,
      pageIdentity,
      isOverviewRoute,
      setPageIdentity,
      saving,
    ]
  );

  return (
    <ReviewModeContext.Provider value={value}>{children}</ReviewModeContext.Provider>
  );
}
