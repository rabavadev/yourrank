/** @jsxImportSource preact */
// GameFrame owns every non-playing state a game can be in. Games render their
// board as children and never implement "signed out", "no credits", "disabled"
// or "failed to load" themselves — otherwise each game invents its own wording
// and the product reads as three different products.
import type { ComponentChildren } from "preact";
import { formatCredits } from "../bet.js";
import { safePath } from "../url.js";
import { AlertIcon, ClockIcon, CoinIcon, LockIcon } from "./icons.js";
import { Button } from "./Button.js";

export type GameFrameState =
  | "loading"
  | "ready"
  | "error"
  | "disabled"
  | "signed_out"
  | "no_credits";

export interface GameFrameProps {
  state: GameFrameState;
  /** Game display name, used in the copy of every state. */
  gameName?: string;
  currency?: string;
  balance?: number;
  minBet?: number;
  errorMessage?: string | null;
  onRetry?: () => void;
  /** Where "Sign in" goes — provided by the shell, which knows the slug. */
  signInHref?: string;
  /** Where "Earn credits" goes — the streamer's rewards page. */
  earnHref?: string;
  children?: ComponentChildren;
  class?: string;
}

export function GameFrame({
  state,
  gameName = "This game",
  currency = "credits",
  balance = 0,
  minBet = 1,
  errorMessage,
  onRetry,
  signInHref,
  earnHref,
  children,
  class: cls = "",
}: GameFrameProps) {
  return (
    <section class={`gx-frame gx-surface ${cls}`.trim()} aria-busy={state === "loading" ? "true" : undefined}>
      {state === "ready" ? <div class="gx-frame__body">{children}</div> : <FrameState {...{ state, gameName, currency, balance, minBet, errorMessage, onRetry, signInHref, earnHref }} />}
    </section>
  );
}

function FrameState({
  state,
  gameName,
  currency,
  balance,
  minBet,
  errorMessage,
  onRetry,
  signInHref,
  earnHref,
}: Required<Pick<GameFrameProps, "state" | "gameName" | "currency" | "balance" | "minBet">> &
  Pick<GameFrameProps, "errorMessage" | "onRetry" | "signInHref" | "earnHref">) {
  if (state === "loading") {
    // A skeleton in the board's own shape — a centred spinner would collapse
    // the frame and shift everything below it once the game mounts.
    return (
      <div class="gx-skeleton" aria-hidden="true">
        <div class="gx-skeleton__row gx-skeleton__board" />
        <div class="gx-skeleton__row" />
        <div class="gx-skeleton__row" />
      </div>
    );
  }

  if (state === "disabled") {
    return (
      <StateBlock
        icon={<ClockIcon />}
        title={`${gameName} is turned off`}
        body="The streamer has disabled this game on their site. Check back later or try another one."
      />
    );
  }

  if (state === "signed_out") {
    return (
      <StateBlock
        icon={<LockIcon />}
        title="Sign in to play"
        body={`Your ${currency} are tied to your account. Sign in to place a bet — it takes a few seconds and it's free.`}
        action={
          signInHref ? (
            <a class="gx-btn gx-btn--primary" href={safePath(signInHref, "/")}>
              Sign in
            </a>
          ) : null
        }
      />
    );
  }

  if (state === "no_credits") {
    return (
      <StateBlock
        icon={<CoinIcon size={20} />}
        title={`You have no ${currency} to play with`}
        body={`You need at least ${formatCredits(minBet)} ${currency} to place a bet — you have ${formatCredits(balance)}. Earn more by redeeming the streamer's free channel-point rewards.`}
        action={
          earnHref ? (
            <a class="gx-btn gx-btn--primary" href={safePath(earnHref, "/")}>
              Earn {currency}
            </a>
          ) : null
        }
      />
    );
  }

  return (
    <StateBlock
      variant="error"
      icon={<AlertIcon />}
      title="We couldn't load the game"
      body={errorMessage || "Something went wrong on our side. Your credits are safe."}
      action={onRetry ? <Button variant="primary" onClick={onRetry}>Try again</Button> : null}
    />
  );
}

function StateBlock({
  icon,
  title,
  body,
  action,
  variant,
}: {
  icon: ComponentChildren;
  title: string;
  body: string;
  action?: ComponentChildren;
  variant?: "error";
}) {
  return (
    <div class={`gx-state${variant ? ` gx-state--${variant}` : ""}`} role="status">
      <span class="gx-state__icon">{icon}</span>
      <h2 class="gx-state__title">{title}</h2>
      <p class="gx-state__body">{body}</p>
      {action}
    </div>
  );
}
