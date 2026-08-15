export async function requestPublicationChange({
  published,
  siteId = null,
  expectedUpdatedAt = null,
  csrfToken = "",
  fetchImpl = fetch,
} = {}) {
  const body = siteId ? { siteId } : {};
  if (!published) {
    body.published = false;
    if (expectedUpdatedAt) body.expectedUpdatedAt = expectedUpdatedAt;
  }
  const response = await fetchImpl(published ? "/api/site/finish" : "/api/site", {
    method: published ? "POST" : "PUT",
    credentials: "include",
    headers: { "content-type": "application/json", "x-csrf-token": csrfToken },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    throw new Error(data.error || (published ? "Could not publish this site." : "Could not unpublish this site."));
  }
  return data;
}
