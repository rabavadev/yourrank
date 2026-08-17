export interface BoardViewDecision {
  allowed: boolean;
  shouldBump: boolean;
  visitorHash: string | null;
  referer: string;
  setCookies: string[];
}

interface BoardViewInput {
  request: Request;
  siteId: string;
  slug: string;
  hashToken: (value: string) => Promise<string>;
  createVisitorId?: () => string;
}

export async function decideBoardView({
  request,
  siteId,
  slug,
  hashToken,
  createVisitorId = () => crypto.randomUUID(),
}: BoardViewInput): Promise<BoardViewDecision> {
  const cookies = request.headers.get("cookie") || "";
  let vid = "";
  let consent = "";
  for (const c of cookies.split(";")) {
    const [key, value] = c.trim().split("=");
    if (key === "yr_vid") vid = decodeURIComponent(value || "");
    if (key === "yr_consent") consent = decodeURIComponent(value || "");
  }

  if (consent !== "all") {
    return {
      allowed: false,
      shouldBump: false,
      visitorHash: null,
      referer: "",
      setCookies: [],
    };
  }

  const setCookies: string[] = [];
  if (!vid) {
    vid = createVisitorId();
    setCookies.push(`yr_vid=${vid}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`);
  }

  const visitorHash = await hashToken(`${vid}:${siteId}`);
  const viewCookieName = `__v_${slug}`;
  const alreadyViewed = new RegExp(`(?:^|;\\s*)${viewCookieName}=`).test(cookies);
  if (alreadyViewed) {
    return {
      allowed: true,
      shouldBump: false,
      visitorHash,
      referer: "",
      setCookies,
    };
  }

  setCookies.push(`${viewCookieName}=1; Path=/${slug}; Max-Age=86400; SameSite=Lax; Secure`);
  return {
    allowed: true,
    shouldBump: true,
    visitorHash,
    referer: request.headers.get("referer") || "",
    setCookies,
  };
}
