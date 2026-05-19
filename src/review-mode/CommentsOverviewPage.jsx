import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listComments } from "./commentsRepository.js";
import { getScreenLabel } from "./pageIdentity.js";
import { getVersionById, PROTOTYPE_VERSIONS } from "./prototypeVersions.js";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function CommentsOverviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const versionId = searchParams.get("version") || PROTOTYPE_VERSIONS[0].id;
  const version = getVersionById(versionId);

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screenFilter, setScreenFilter] = useState("all");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("unresolved");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    document.documentElement.classList.add("comments-overview-route");
    return () => document.documentElement.classList.remove("comments-overview-route");
  }, []);

  useEffect(() => {
    setLoading(true);
    listComments({ version: versionId })
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [versionId]);

  const screens = useMemo(() => {
    const keys = [...new Set(comments.map((c) => c.pageKey).filter(Boolean))];
    return keys.sort();
  }, [comments]);

  const sessions = useMemo(() => {
    const ids = [...new Set(comments.map((c) => c.sessionId).filter(Boolean))];
    return ids.sort();
  }, [comments]);

  const filtered = useMemo(() => {
    return comments.filter((c) => {
      if (screenFilter !== "all" && c.pageKey !== screenFilter) return false;
      if (sessionFilter !== "all" && c.sessionId !== sessionFilter) return false;
      if (statusFilter === "unresolved" && c.status === "resolved") return false;
      if (statusFilter === "resolved" && c.status !== "resolved") return false;
      return true;
    });
  }, [comments, screenFilter, sessionFilter, statusFilter]);

  const selected = filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (filtered.length && !filtered.some((c) => c.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const viewContext = (comment) => {
    navigate("/", {
      state: {
        focusCommentId: comment.id,
        pageKey: comment.pageKey,
      },
    });
  };

  return (
    <div className="review-mode-overview">
      <button type="button" className="review-mode-overview__back" onClick={() => navigate("/")}>
        ← Back to the prototype
      </button>
      <h1 className="review-mode-overview__title">Comments overview</h1>
      <p className="review-mode-overview__intro">
        Comments are scoped to one prototype version at a time. Use version control in Review Mode to switch
        versions. Filters apply only within the selected version.
      </p>

      <div className="review-mode-overview__layout">
        <section className="review-mode-overview__card">
          <h2 className="review-mode-overview__card-title">
            Comments — {version.label}
          </h2>
          <div className="review-mode-overview__filters">
            <div className="review-mode-overview__filter">
              <label htmlFor="rm-screen">Screen / page</label>
              <select id="rm-screen" value={screenFilter} onChange={(e) => setScreenFilter(e.target.value)}>
                <option value="all">All screens</option>
                {screens.map((k) => (
                  <option key={k} value={k}>
                    {getScreenLabel(k)}
                  </option>
                ))}
              </select>
            </div>
            <div className="review-mode-overview__filter">
              <label htmlFor="rm-session">Session</label>
              <select id="rm-session" value={sessionFilter} onChange={(e) => setSessionFilter(e.target.value)}>
                <option value="all">All sessions</option>
                {sessions.map((id) => (
                  <option key={id} value={id}>
                    {String(id).slice(0, 8)}…
                  </option>
                ))}
              </select>
            </div>
            <div className="review-mode-overview__filter">
              <label htmlFor="rm-version">Prototype version</label>
              <select id="rm-version" value={versionId} disabled>
                <option value={versionId}>{version.label}</option>
              </select>
            </div>
            <div className="review-mode-overview__filter">
              <label>Status</label>
              <div className="review-mode-overview__status-toggle">
                <button
                  type="button"
                  className={`review-mode-overview__status-btn${statusFilter === "unresolved" ? " is-active" : ""}`}
                  onClick={() => setStatusFilter("unresolved")}
                >
                  Unresolved
                </button>
                <button
                  type="button"
                  className={`review-mode-overview__status-btn${statusFilter === "resolved" ? " is-active" : ""}`}
                  onClick={() => setStatusFilter("resolved")}
                >
                  Resolved
                </button>
              </div>
            </div>
          </div>

          <div className="review-mode-overview__table-wrap">
            {loading ? (
              <p className="review-mode-overview__empty">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="review-mode-overview__empty">No comments match these filters.</p>
            ) : (
              <table className="review-mode-overview__table">
                <thead>
                  <tr>
                    <th>Comment</th>
                    <th>Screen</th>
                    <th>Version</th>
                    <th>Status</th>
                    <th>Resolved</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      className={selected?.id === c.id ? "is-selected" : ""}
                      onClick={() => setSelectedId(c.id)}
                    >
                      <td>{c.text?.slice(0, 80) || "—"}</td>
                      <td>{getScreenLabel(c.pageKey)}</td>
                      <td>{version.label}</td>
                      <td>
                        <span
                          className={
                            c.status === "resolved" ? "" : "review-mode-overview__status-unresolved"
                          }
                        >
                          {c.status === "resolved" ? "Resolved" : "Unresolved"}
                        </span>
                      </td>
                      <td>{formatDate(c.resolvedAt)}</td>
                      <td>{formatDate(c.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="review-mode-overview__link"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewContext(c);
                          }}
                        >
                          View context
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <aside className="review-mode-overview__card">
          {selected ? (
            <>
              <h3 className="review-mode-overview__context-title">{selected.text}</h3>
              <dl className="review-mode-overview__meta">
                <dt>Screen</dt>
                <dd>{getScreenLabel(selected.pageKey)}</dd>
                <dt>Version</dt>
                <dd>{version.label}</dd>
                <dt>Status</dt>
                <dd>{selected.status === "resolved" ? "Resolved" : "Unresolved"}</dd>
                <dt>Resolved</dt>
                <dd>{formatDate(selected.resolvedAt)}</dd>
                <dt>Created</dt>
                <dd>{formatDate(selected.createdAt)}</dd>
                <dt>Session</dt>
                <dd>{selected.sessionId}</dd>
                {selected.authorName ? (
                  <>
                    <dt>Name</dt>
                    <dd>{selected.authorName}</dd>
                  </>
                ) : null}
                {selected.authorPosition ? (
                  <>
                    <dt>Position</dt>
                    <dd>{selected.authorPosition}</dd>
                  </>
                ) : null}
              </dl>
              <div className="review-mode-overview__preview">
                {selected.previewUrl ? (
                  <>
                    <img src={selected.previewUrl} alt="Screen preview" />
                    <span
                      className="review-mode-overview__preview-pin"
                      style={{
                        left: `${(selected.xRatio ?? 0.5) * 100}%`,
                        top: `${(selected.yRatio ?? 0.5) * 100}%`,
                      }}
                    />
                  </>
                ) : (
                  <p className="review-mode-overview__empty">No preview image</p>
                )}
              </div>
            </>
          ) : (
            <p className="review-mode-overview__empty">Select a comment to see details.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
