"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function passwordScore(value: string): number {
  if (value.length < 8) return 0;
  let s = 1;
  if (value.length >= 12) s++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) s++;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) s++;
  return Math.min(s, 4);
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = [
  "bg-gray-200",
  "bg-red-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-emerald-600",
];

function slugifyInput(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface SignupFormProps {
  plan?: string;
  ref?: string;
  next?: string;
}

export function SignupForm({
  plan = "",
  ref = "",
  next = "/dashboard",
}: SignupFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const score = passwordScore(password);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body: Record<string, string> = {
        email,
        password,
        name,
        slug,
      };
      if (plan) body.plan = plan;
      if (ref) body.ref = ref;

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      const data = (await response.json().catch(() => ({
        ok: false,
        error: "Invalid response from server",
      }))) as { ok?: boolean; error?: string; field?: string };
      if (!response.ok || !data.ok) {
        setError(data.error || "Could not create account. Please try again.");
        return;
      }
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-soft focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink">
          Your name / handle
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="nickname"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-soft focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
          placeholder="e.g. KickStream"
        />
      </div>
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-ink">
          Your page URL
        </label>
        <div className="relative mt-1">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-ink-soft">
            yourrank.site/
          </span>
          <input
            id="slug"
            name="slug"
            type="text"
            autoComplete="off"
            required
            value={slug}
            onChange={(e) => setSlug(slugifyInput(e.target.value))}
            className="block w-full rounded-lg border border-line bg-surface py-2 pl-[7.5rem] pr-3 text-ink placeholder:text-ink-soft focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
            placeholder="your-handle"
          />
        </div>
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink">
          Password
        </label>
        <div className="relative mt-1">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-lg border border-line bg-surface px-3 py-2 pr-10 text-ink placeholder:text-ink-soft focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-soft hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {password && (
          <div className="mt-2">
            <div className="flex h-1.5 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-full flex-1 rounded-full ${
                    i <= score ? STRENGTH_COLORS[score] : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-ink-soft">
              {password.length < 8
                ? "At least 8 characters"
                : STRENGTH_LABELS[score]}
            </p>
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-cobalt px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 focus:outline-none focus:ring-2 focus:ring-cobalt focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
