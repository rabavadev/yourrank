import { docsPage } from "../../../../../apps/leaderboard/src/pages/docs.js";
import { marketingResponse } from "@/lib/marketing";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return marketingResponse(docsPage);
}
