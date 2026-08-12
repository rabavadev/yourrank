export function trackedDestination(origin, slug, ctaUrl, clickRef) {
  if (ctaUrl && /^https:\/\//i.test(ctaUrl)) {
    const dest = new URL(ctaUrl);
    dest.searchParams.set("yr_click", clickRef);
    return Response.redirect(dest.toString(), 302);
  }
  return Response.redirect(`${origin}/${slug}`, 302);
}

export function deferClickWrite(ctx, write) {
  const pending = Promise.resolve()
    .then(write)
    .catch((err) => {
      console.error("[go] click tracking failed:", String(err?.message || err));
    });
  if (ctx?.waitUntil) ctx.waitUntil(pending);
  else void pending;
}
