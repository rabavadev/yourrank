"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

function OverviewIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 1 0 9 9c0-1.1-.9-2-2-2h-1.5a2.5 2.5 0 0 1-2.5-2.5V6a3 3 0 0 0-3-3z" /><circle cx="7.5" cy="10.5" r=".5" /><circle cx="10.5" cy="7.5" r=".5" /><circle cx="7.5" cy="15.5" r=".5" />
    </svg>
  );
}

function GamesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 11h4M8 9v4" /><path d="M15 12h.01M18 10h.01" /><path d="M17.3 5H6.7A4.7 4.7 0 0 0 2 9.7v4.6A4.7 4.7 0 0 0 6.7 19h10.6a4.7 4.7 0 0 0 4.7-4.7V9.7A4.7 4.7 0 0 0 17.3 5z" />
    </svg>
  );
}

function GiveawayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12v10H4V12" /><path d="M2 7h20v5H2z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l2-5h14l2 5" /><path d="M5 13v7h14v-7M9 20v-5h6v5" /><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    </svg>
  );
}

function ViewersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-9.5 14.5L8 14l-6 4 2-18 16 2z" />
    </svg>
  );
}

function BoardsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4M12 18h.01" />
    </svg>
  );
}

const GROUPS: NavGroup[] = [
  { label: "OVERVIEW", items: [{ href: "/dashboard", label: "Overview", icon: <OverviewIcon /> }] },
  {
    label: "EDITOR",
    items: [
      { href: "/dashboard/editor/setup", label: "Site details", icon: <OverviewIcon /> },
      { href: "/dashboard/editor/players", label: "Racers & scores", icon: <UsersIcon /> },
      { href: "/dashboard/editor/design", label: "Theme & overlays", icon: <PaletteIcon /> },
      { href: "/dashboard/editor/share", label: "Overlay & share", icon: <ShopIcon /> },
      { href: "/dashboard/editor/history", label: "Past winners", icon: <GiveawayIcon /> },
      { href: "/dashboard/games", label: "Mini-games", icon: <GamesIcon /> },
    ],
  },
  {
    label: "COMMUNITY & REWARDS",
    items: [
      { href: "/dashboard/giveaways", label: "Live giveaways", icon: <GiveawayIcon /> },
      { href: "/dashboard/rewards", label: "Rewards & shop", icon: <ShopIcon /> },
      { href: "/dashboard/audience/viewers", label: "Viewer points", icon: <ViewersIcon /> },
    ],
  },
  { label: "TELEGRAM", items: [{ href: "/dashboard/telegram", label: "Telegram bot", icon: <TelegramIcon /> }] },
  {
    label: "SETTINGS & SITES",
    items: [
      { href: "/dashboard/boards", label: "Sites", icon: <BoardsIcon /> },
      { href: "/dashboard/settings", label: "Account & billing", icon: <SettingsIcon /> },
      { href: "https://yourrank.site/help/support", label: "Help & support", icon: <HelpIcon /> },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href.startsWith("https://")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface DashboardNavProps {
  user?: { display_name?: string | null; email: string; plan: string } | null;
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const displayName = user?.display_name || user?.email.split("@")[0] || "—";
  const initial = displayName === "—" ? "…" : displayName[0].toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[272px] flex-col bg-navy text-white">
      <div className="flex h-[76px] items-center border-b border-white/10 px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Your<span className="text-cobalt">Rank</span>
        </Link>
      </div>

      <nav aria-label="Dashboard" className="flex-1 overflow-y-auto px-3 py-4">
        {GROUPS.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="px-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const external = item.href.startsWith("https://");
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-navy-raised text-white"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className={active ? "text-cobalt" : "text-white/50"} aria-hidden="true">
                        {item.icon}
                      </span>
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cobalt text-sm font-semibold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{displayName}</p>
            <p className="truncate text-xs text-white/50">{user?.plan.toUpperCase()}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
