import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in · YourRank",
  description: "Sign in to your YourRank streamer suite.",
  robots: "noindex, nofollow",
};

interface LoginPageProps {
  searchParams?: Promise<{ next?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextValue = params?.next;
  const next = Array.isArray(nextValue) ? nextValue[0] : nextValue;
  return (
    <main className="flex min-h-screen bg-canvas">
      <aside className="hidden w-1/2 flex-col justify-between bg-navy p-12 text-white lg:flex">
        <div className="text-2xl font-bold">
          Your<span className="text-cobalt">Rank</span>
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold leading-tight">
            Your streamer suite, hosted and handled.
          </h2>
          <p className="text-white/80">
            Leaderboards, Telegram bot, and viewer rewards &amp; shop — all from
            one dashboard. No code, no redeploys.
          </p>
          <ul className="space-y-2 text-sm text-white/70">
            <li>— Branded leaderboards for your community</li>
            <li>— Tracked offers and broadcasts in Telegram</li>
            <li>— Viewer credits powered by Kick channel points</li>
          </ul>
        </div>
        <div className="text-sm text-white/50">
          © {new Date().getFullYear()} YourRank
        </div>
      </aside>

      <section className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <a href="/" className="text-xl font-bold text-ink lg:hidden">
            Your<span className="text-cobalt">Rank</span>
          </a>
          <h1 className="mt-8 text-2xl font-bold text-ink lg:mt-0">Sign in</h1>
          <p className="mt-2 text-sm text-ink-soft">Welcome back.</p>

          <div className="mt-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
            <LoginForm next={next} />
          </div>

          <p className="mt-6 text-center text-sm text-ink-soft">
            No account?{" "}
            <a href="/signup" className="font-medium text-cobalt hover:underline">
              Create one
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
