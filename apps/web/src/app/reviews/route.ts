import { reviewsPage } from "../../../../../apps/leaderboard/src/pages/reviews.js";
import { marketingResponse } from "@/lib/marketing";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return marketingResponse(reviewsPage, {
    gbpPhotoUrl: "https://yourrank.site/og.png",
    gbpReviewUrl: "https://yourrank.site",
  });
}
