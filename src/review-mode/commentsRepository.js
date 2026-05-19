const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const COMMENTS_TABLE = import.meta.env.VITE_SUPABASE_COMMENTS_TABLE || "Comments";
const SESSIONS_TABLE = import.meta.env.VITE_SUPABASE_SESSIONS_TABLE || "Sessions";
const PREVIEW_BUCKET = import.meta.env.VITE_SUPABASE_PREVIEW_BUCKET || "comment-previews";

const META_PREFIX = "<!--rm-meta:";

function headers(extra = {}) {
  return {
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

function rowToComment(row) {
  let authorName = row.author_name ?? "";
  let authorPosition = row.author_position ?? "";
  let text = row.text ?? "";

  if (!authorName && text.startsWith(META_PREFIX)) {
    const end = text.indexOf("-->");
    if (end > -1) {
      try {
        const meta = JSON.parse(text.slice(META_PREFIX.length, end));
        authorName = meta.name ?? "";
        authorPosition = meta.position ?? "";
        text = text.slice(end + 3).trimStart();
      } catch {
        /* keep raw text */
      }
    }
  }

  return {
    id: row.id,
    text,
    pageKey: row.page_url,
    version: row.version,
    sessionId: row.session_id,
    xRatio: row.x_ratio,
    yRatio: row.y_ratio,
    xPosition: row.x_position,
    yPosition: row.y_position,
    viewportWidth: row.viewport_width,
    viewportHeight: row.viewport_height,
    status: row.status ?? "unresolved",
    resolvedAt: row.resolved_at,
    previewUrl: row.preview_image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    authorName,
    authorPosition,
  };
}

function buildPayload(fields, includeAuthor = true) {
  let text = fields.text ?? "";
  const body = {
    text,
    page_url: fields.pageKey,
    version: fields.version,
    session_id: fields.sessionId,
    x_ratio: fields.xRatio,
    y_ratio: fields.yRatio,
    x_position: fields.xPosition ?? null,
    y_position: fields.yPosition ?? null,
    viewport_width: fields.viewportWidth ?? null,
    viewport_height: fields.viewportHeight ?? null,
    status: fields.status ?? "unresolved",
    resolved_at: fields.resolvedAt ?? null,
    preview_image_url: fields.previewUrl ?? null,
    updated_at: fields.updatedAt ?? new Date().toISOString(),
  };

  if (includeAuthor) {
    if (fields.authorName) body.author_name = fields.authorName;
    if (fields.authorPosition) body.author_position = fields.authorPosition;
  } else if (fields.authorName) {
    const meta = JSON.stringify({
      name: fields.authorName,
      position: fields.authorPosition ?? "",
    });
    body.text = `${META_PREFIX}${meta}-->${text}`;
  }

  return body;
}

async function request(path, options = {}) {
  if (!SUPABASE_URL || !ANON_KEY) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local");
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, options);
  if (!res.ok) {
    const errBody = await res.text();
    let message = errBody || res.statusText;
    try {
      const parsed = JSON.parse(errBody);
      message = parsed.message || parsed.error || message;
      if (parsed.code) message = `${parsed.code}: ${message}`;
    } catch {
      /* use raw body */
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function listComments({ version, pageKey } = {}) {
  const params = new URLSearchParams({ select: "*", order: "created_at.desc" });
  if (version) params.set("version", `eq.${version}`);
  if (pageKey) params.set("page_url", `eq.${pageKey}`);
  const rows = await request(`${COMMENTS_TABLE}?${params}`, { headers: headers() });
  return (rows ?? []).map(rowToComment);
}

export async function createComment(fields) {
  let body = buildPayload({ ...fields, status: "unresolved" }, true);
  try {
    const rows = await request(`${COMMENTS_TABLE}`, {
      method: "POST",
      headers: headers({ Prefer: "return=representation" }),
      body: JSON.stringify(body),
    });
    return rowToComment(rows[0]);
  } catch (firstErr) {
    body = buildPayload({ ...fields, status: "unresolved" }, false);
    const rows = await request(`${COMMENTS_TABLE}`, {
      method: "POST",
      headers: headers({ Prefer: "return=representation" }),
      body: JSON.stringify(body),
    });
    return rowToComment(rows[0]);
  }
}

export async function updateComment(id, fields) {
  const tryPatch = async (includeAuthor) => {
    const body = buildPayload({ ...fields, text: fields.text ?? fields.comment?.text ?? "" }, includeAuthor);
    if (fields.previewUrl !== undefined) body.preview_image_url = fields.previewUrl;
    if (fields.status !== undefined) body.status = fields.status;
    if (fields.resolvedAt !== undefined) body.resolved_at = fields.resolvedAt;
    const rows = await request(`${COMMENTS_TABLE}?id=eq.${id}`, {
      method: "PATCH",
      headers: headers({ Prefer: "return=representation" }),
      body: JSON.stringify(body),
    });
    return rowToComment(rows[0]);
  };
  try {
    return await tryPatch(true);
  } catch {
    return tryPatch(false);
  }
}

export async function deleteComment(id) {
  await request(`${COMMENTS_TABLE}?id=eq.${id}`, {
    method: "DELETE",
    headers: headers(),
  });
}

export async function createSessionRow(name) {
  if (!name) return null;
  try {
    const rows = await request(`${SESSIONS_TABLE}`, {
      method: "POST",
      headers: headers({ Prefer: "return=representation" }),
      body: JSON.stringify({ Name: name }),
    });
    return rows?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function uploadPreview(commentId, blob) {
  if (!PREVIEW_BUCKET) return null;
  const path = `comment-${commentId}-${Date.now()}.jpg`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${PREVIEW_BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      "Content-Type": "image/jpeg",
      "x-upsert": "true",
    },
    body: blob,
  });
  if (!res.ok) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${PREVIEW_BUCKET}/${path}`;
}

export async function captureAndUploadPreview(commentId) {
  try {
    const { toJpeg } = await import("html-to-image");
    const root = document.querySelector(".dynamics-app") ?? document.getElementById("root");
    if (!root) return null;
    const dataUrl = await toJpeg(root, {
      quality: 0.7,
      pixelRatio: 0.5,
      filter: (node) => !node.closest?.('[data-review-mode-ui="true"]'),
    });
    const blob = await (await fetch(dataUrl)).blob();
    return uploadPreview(commentId, blob);
  } catch {
    return null;
  }
}
