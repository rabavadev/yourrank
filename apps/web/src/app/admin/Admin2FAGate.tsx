"use client";

import { useActionState, useEffect, useState } from "react";
import { admin2faEnable, admin2faVerify, type Admin2FAResult } from "./actions";
import { Card } from "../dashboard/_components/Card";

function useQrDataUrl(uri: string | undefined): string | null {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!uri || typeof window === "undefined") return;
    const qr = (window as unknown as Record<string, unknown>).QRCode as { toDataURL?: (text: string, size: number) => string } | undefined;
    if (qr?.toDataURL) {
      setDataUrl(qr.toDataURL(uri, 200));
      return;
    }
    const script = document.createElement("script");
    script.src = "/qrcode.js";
    script.async = true;
    script.onload = () => {
      const loaded = (window as unknown as Record<string, unknown>).QRCode as { toDataURL?: (text: string, size: number) => string } | undefined;
      if (loaded?.toDataURL) setDataUrl(loaded.toDataURL(uri, 200));
    };
    script.onerror = () => setDataUrl(null);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [uri]);
  return dataUrl;
}

interface Admin2FAGateProps {
  enabled: boolean;
  locked: boolean;
}

export function Admin2FAGate({ enabled, locked }: Admin2FAGateProps) {
  const [setup, setSetup] = useActionState<Admin2FAResult, FormData>(admin2faEnable, { ok: false });
  const [verifyState, verifyAction, verifyPending] = useActionState<Admin2FAResult, FormData>(admin2faVerify, { ok: false });
  const qrDataUrl = useQrDataUrl(setup?.ok ? setup.uri : undefined);

  if (locked) {
    return (
      <Card className="mt-6">
        <p className="text-sm text-red-600">Two-factor authentication is temporarily locked due to too many failed attempts. Try again later.</p>
      </Card>
    );
  }

  if (!enabled) {
    return (
      <Card className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Set up 2FA</h2>
        <p className="mt-2 text-sm text-ink-soft">Scan the QR code with your authenticator app, then enter the 6-digit code.</p>
        <form action={setSetup} className="mt-4">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90"
          >
            Generate setup code
          </button>
        </form>
        {setup?.ok && setup.uri && (
          <div className="mt-6 space-y-4">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="2FA QR code" className="h-48 w-48 rounded-lg border border-line" />
            ) : (
              <p className="text-sm text-ink-soft">Loading QR code…</p>
            )}
            <p className="text-xs text-ink-soft break-all">Secret: {setup.secret}</p>
            <form action={verifyAction} className="space-y-3">
              <input
                name="code"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                placeholder="123456"
                className="block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt md:max-w-xs"
              />
              <button
                type="submit"
                disabled={verifyPending}
                className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50"
              >
                {verifyPending ? "Verifying…" : "Verify"}
              </button>
            </form>
          </div>
        )}
        {setup?.error && <p className="mt-3 text-sm text-red-600">{setup.error}</p>}
        {verifyState?.error && <p className="mt-3 text-sm text-red-600">{verifyState.error}</p>}
        {verifyState?.ok && verifyState.recoveryCodes && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <p className="font-medium">2FA enabled. Save these recovery codes:</p>
            <ul className="mt-2 grid grid-cols-2 gap-1 font-mono text-xs">
              {verifyState.recoveryCodes.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Verify 2FA</h2>
      <p className="mt-2 text-sm text-ink-soft">Enter your current 6-digit code to continue.</p>
      <form action={verifyAction} className="mt-4 space-y-3">
        <input
          name="code"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
          placeholder="123456"
          className="block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt md:max-w-xs"
        />
        <button
          type="submit"
          disabled={verifyPending}
          className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50"
        >
          {verifyPending ? "Verifying…" : "Verify"}
        </button>
      </form>
      {verifyState?.error && <p className="mt-3 text-sm text-red-600">{verifyState.error}</p>}
      {verifyState?.ok && <p className="mt-3 text-sm text-emerald-700">Verified. Reloading…</p>}
    </Card>
  );
}
