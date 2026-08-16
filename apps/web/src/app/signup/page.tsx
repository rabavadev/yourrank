import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Create account · YourRank",
  description: "Create a free YourRank streamer suite account.",
  robots: "noindex, nofollow",
};

interface SignupPageProps {
  searchParams?: Promise<{
    next?: string | string[];
    plan?: string | string[];
    ref?: string | string[];
  }>;
}

function firstString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen bg-canvas">
      <aside className="hidden w-1/2 flex-col justify-between bg-navy p-12 text-white lg:flex">
        <div className="text-2xl font-bold">
          Your<span className="text-cobalt">Rank</span>
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold leading-tight">
            Your streamer suite, ready in seconds.
          </h2>
          <p className="text-white/80">
            One email, one password, and your page is ready. The first board is a
            draft sample — you can rename the URL, edit everything, and publish
            when you are ready.
          </p>
          <ul className="space-y-2 text-sm text-white/70">
            <li>— Free to set up</li>
            <li>— Upgrade when you are ready</li>
            <li>— Leaderboards, Telegram, and rewards in one account</li>
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
          <h1 className="mt-8 text-2xl font-bold text-ink lg:mt-0">
            Create account
          </h1>
          <p className="mt-2 text-sm text-ink-soft">Free. Takes 30 seconds.</p>

          <div className="mt-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
            <SignupForm
              next={firstString(params?.next)}
              plan={firstString(params?.plan)}
              ref={firstString(params?.ref)}
            />
          </div>

          <p className="mt-6 text-center text-sm text-ink-soft">
            Already have one?{" "}
            <a href="/login" className="font-medium text-cobalt hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
