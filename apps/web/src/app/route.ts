import { landingPage } from "../../../leaderboard/src/pages/landing.js";
import { marketingResponse } from "@/lib/marketing";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return marketingResponse(landingPage, { gbpPhotoUrl: "https://yourrank.site/og.png" });
}
