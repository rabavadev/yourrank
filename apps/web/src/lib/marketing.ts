import { applyLegalIdentity } from "../../../leaderboard/src/pages/legal-helper.js";

const ASSET_BASE = "https://yourrank.site";
const CURRENT_YEAR = new Date().getFullYear().toString();
const NEXT_YEAR = String(new Date().getFullYear() + 1);

interface MarketingRenderOptions {
  identity?: Record<string, string | null>;
  gbpPhotoUrl?: string;
  gbpReviewUrl?: string;
}

export function marketingResponse(
  html: string,
  options: MarketingRenderOptions = {},
): Response {
  let body = html;

  body = applyLegalIdentity(body, options.identity || {});
  body = body
    .replace(/{{YEAR}}/g, CURRENT_YEAR)
    .replace(/{{NEXT_YEAR}}/g, NEXT_YEAR);
  body = body.replace(/<span id="yr"><\/span>/g, CURRENT_YEAR);

  if (options.gbpPhotoUrl) {
    body = body.replace(/{{GBP_PHOTO_URL}}/g, options.gbpPhotoUrl);
  }
  if (options.gbpReviewUrl) {
    body = body.replace(/{{GBP_REVIEW_URL}}/g, options.gbpReviewUrl);
  }

  body = rewriteMarketingUrls(body);

  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}

function rewriteMarketingUrls(html: string): string {
  return html
    .replace(/href="\/assets\//g, `href="${ASSET_BASE}/assets/`)
    .replace(/src="\/assets\//g, `src="${ASSET_BASE}/assets/`)
    .replace(/href="\/api\//g, `href="${ASSET_BASE}/api/`)
    .replace(/href="\/(demo[^"]*)"/g, `href="${ASSET_BASE}/$1"`)
    .replace(/href="\/(help\/support[^"]*)"/g, `href="${ASSET_BASE}/$1"`);
}
