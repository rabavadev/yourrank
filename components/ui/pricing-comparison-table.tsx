import React, { useState } from 'react';
import { Check, X, Info, ChevronRight, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
export type FeatureStatus = 
  | { type: 'text'; value: string; subValue?: string }
  | { type: 'check' }
  | { type: 'cross' }
  | { type: 'addon' }
  | { type: 'limited'; text?: string };

export interface FeatureRow {
  name: string;
  tooltip?: string;
  hasInfo?: boolean;
  free: FeatureStatus;
  starter?: FeatureStatus;
  pro: FeatureStatus;
  agency: FeatureStatus;
}

export interface PricingSection {
  title: string;
  description?: string;
  features: FeatureRow[];
}

// --- Data ---
export const DEFAULT_PRICING_DATA: PricingSection[] = [
  {
    title: "Leaderboard & Live Contests",
    description: "Core competition and leaderboard engine",
    features: [
      {
        name: "Active leaderboards",
        free: { type: 'text', value: "1 board" },
        starter: { type: 'text', value: "1 board" },
        pro: { type: 'text', value: "Up to 3 boards" },
        agency: { type: 'text', value: "Up to 99 boards" },
      },
      {
        name: "Players & scores per board",
        free: { type: 'text', value: "Up to 10" },
        starter: { type: 'text', value: "Up to 25" },
        pro: { type: 'text', value: "Up to 9,999" },
        agency: { type: 'text', value: "Up to 9,999" },
      },
      {
        name: "Live countdown & auto-sort",
        free: { type: 'check' },
        starter: { type: 'check' },
        pro: { type: 'check' },
        agency: { type: 'check' },
      },
      {
        name: "Custom domain (cname)",
        hasInfo: true,
        tooltip: "Connect your own custom domain or subdomain with auto-SSL",
        free: { type: 'cross' },
        starter: { type: 'cross' },
        pro: { type: 'check' },
        agency: { type: 'check' },
      },
      {
        name: "OBS streaming overlay widget",
        hasInfo: true,
        tooltip: "Transparent responsive browser source overlay for OBS/Streamlabs",
        free: { type: 'cross' },
        starter: { type: 'cross' },
        pro: { type: 'check' },
        agency: { type: 'check' },
      },
      {
        name: "YourRank branding badge",
        free: { type: 'text', value: "Required" },
        starter: { type: 'text', value: "Removed" },
        pro: { type: 'text', value: "Removed" },
        agency: { type: 'text', value: "White-label" },
      },
    ]
  },
  {
    title: "Telegram Community Bots",
    description: "Automated community engagement & verification bots",
    features: [
      {
        name: "Connected Telegram bots",
        free: { type: 'text', value: "1 bot" },
        starter: { type: 'text', value: "1 bot" },
        pro: { type: 'text', value: "Up to 3 bots" },
        agency: { type: 'text', value: "Up to 25 bots" },
      },
      {
        name: "Tracked sponsor offers",
        free: { type: 'text', value: "Up to 3" },
        starter: { type: 'text', value: "Up to 3" },
        pro: { type: 'text', value: "Up to 50" },
        agency: { type: 'text', value: "Up to 999" },
      },
      {
        name: "Custom chat commands",
        hasInfo: true,
        tooltip: "Configure dynamic trigger commands (/leaderboard, /points, /rules)",
        free: { type: 'check' },
        starter: { type: 'check' },
        pro: { type: 'check' },
        agency: { type: 'check' },
      },
      {
        name: "Automated broadcasts & alerts",
        free: { type: 'cross' },
        starter: { type: 'cross' },
        pro: { type: 'check' },
        agency: { type: 'check' },
      },
    ]
  },
  {
    title: "Viewer Rewards & Shop",
    description: "Channel points sync, redemption store & viewer ledger",
    features: [
      {
        name: "Credit rules & point multipliers",
        free: { type: 'text', value: "Up to 3" },
        starter: { type: 'text', value: "Up to 3" },
        pro: { type: 'text', value: "Up to 50" },
        agency: { type: 'text', value: "Up to 999" },
      },
      {
        name: "Shop catalog items",
        free: { type: 'text', value: "Up to 5" },
        starter: { type: 'text', value: "Up to 5" },
        pro: { type: 'text', value: "Up to 100" },
        agency: { type: 'text', value: "Up to 999" },
      },
      {
        name: "Kick & Discord authentication",
        free: { type: 'check' },
        starter: { type: 'check' },
        pro: { type: 'check' },
        agency: { type: 'check' },
      },
      {
        name: "Automated fulfillment & inventory tracking",
        free: { type: 'cross' },
        starter: { type: 'check' },
        pro: { type: 'check' },
        agency: { type: 'check' },
      },
    ]
  },
  {
    title: "Analytics, Security & APIs",
    description: "Postback tracking, signed webhooks and export capabilities",
    features: [
      {
        name: "Analytics data retention",
        free: { type: 'text', value: "7 days" },
        starter: { type: 'text', value: "30 days" },
        pro: { type: 'text', value: "Unlimited" },
        agency: { type: 'text', value: "Unlimited" },
      },
      {
        name: "Signed Score & Postback API",
        hasInfo: true,
        tooltip: "Cryptographically signed HMAC signatures for secure score updates",
        free: { type: 'cross' },
        starter: { type: 'cross' },
        pro: { type: 'check' },
        agency: { type: 'check' },
      },
      {
        name: "Discord & Telegram Webhooks",
        free: { type: 'cross' },
        starter: { type: 'cross' },
        pro: { type: 'check' },
        agency: { type: 'check' },
      },
      {
        name: "CSV Player & Score Import/Export",
        free: { type: 'cross' },
        starter: { type: 'check' },
        pro: { type: 'check' },
        agency: { type: 'check' },
      },
      {
        name: "Support level",
        free: { type: 'text', value: "Community" },
        starter: { type: 'text', value: "Standard" },
        pro: { type: 'text', value: "Priority 24/7" },
        agency: { type: 'text', value: "Dedicated Manager" },
      },
    ]
  }
];

// --- Status Cell Component ---
export const StatusCell = ({ status }: { status: FeatureStatus }) => {
  switch (status.type) {
    case 'check':
      return (
        <div className="flex justify-center items-center w-full h-full">
          <div className="rounded-full bg-emerald-500/10 border border-emerald-500/30 p-1 flex items-center justify-center">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
          </div>
        </div>
      );
    case 'cross':
      return (
        <div className="flex justify-center items-center w-full h-full">
          <div className="rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400 dark:text-gray-500" strokeWidth={2.5} />
          </div>
        </div>
      );
    case 'text':
      return (
        <div className="flex flex-col items-center justify-center text-center text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
          <span>{status.value}</span>
          {status.subValue && <span className="text-gray-400 text-xs mt-0.5 font-normal">{status.subValue}</span>}
        </div>
      );
    case 'addon':
      return (
        <div className="flex items-center justify-center gap-1.5 text-xs md:text-sm text-blue-600 font-medium bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
          <span>Add-on</span>
          <Info className="w-3.5 h-3.5 text-blue-500" />
        </div>
      );
    case 'limited':
      return (
        <div className="flex items-center justify-center gap-1.5 text-xs md:text-sm text-amber-600 font-medium bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
          <span>{status.text || "Limited"}</span>
          <Info className="w-3.5 h-3.5 text-amber-500" />
        </div>
      );
    default:
      return null;
  }
};

export const HeaderButton = ({ 
  label, 
  href = "/signup",
  variant = 'outline' 
}: { 
  label: string; 
  href?: string;
  variant?: 'outline' | 'solid' | 'ghost' | 'accent' 
}) => {
  return (
    <a 
      href={href}
      className={cn(
        "group inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 no-underline cursor-pointer",
        variant === 'solid' && "bg-gray-900 text-white hover:bg-gray-800 shadow-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100",
        variant === 'accent' && "bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-500/20",
        variant === 'outline' && "bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800 dark:hover:bg-gray-800",
        variant === 'ghost' && "bg-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      )}
    >
      {label}
      <ChevronRight className={cn(
        "w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5",
        (variant === 'solid' || variant === 'accent') ? "text-white/80" : "text-gray-400"
      )} />
    </a>
  );
};

export interface PricingComparisonTableProps {
  sections?: PricingSection[];
  className?: string;
}

export function PricingComparisonTable({
  sections = DEFAULT_PRICING_DATA,
  className
}: PricingComparisonTableProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <div className={cn("w-full font-sans text-gray-900 dark:text-gray-100 p-4 md:p-8 overflow-x-auto", className)}>
      <div className="min-w-[760px] max-w-6xl mx-auto">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 pb-4 mb-6 shadow-xs">
           <div className="grid grid-cols-[240px_1fr_1fr_1fr_1fr] gap-3 items-end">
              <div className="pb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Features matrix</span>
                <h3 className="text-lg md:text-xl font-bold tracking-tight text-gray-900 dark:text-white">Compare Plans</h3>
              </div>
              
              <div className="flex flex-col items-center gap-2 pb-2 text-center">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Free</span>
                <span className="text-xs text-gray-500 font-mono">$0 forever</span>
                <HeaderButton label="Start Free" href="/signup?plan=free" variant="outline" />
              </div>

              <div className="flex flex-col items-center gap-2 pb-2 text-center">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Starter</span>
                <span className="text-xs text-gray-500 font-mono">$12 / 30d</span>
                <HeaderButton label="Choose Starter" href="/signup?plan=starter" variant="outline" />
              </div>
              
              <div className="flex flex-col items-center gap-2 pb-2 text-center bg-blue-50/60 dark:bg-blue-950/30 p-2 rounded-xl border border-blue-200 dark:border-blue-800/60">
                <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">Popular</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">Pro</span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold">$29 / 30d</span>
                <HeaderButton label="Go Pro" href="/signup?plan=pro" variant="accent" />
              </div>
              
              <div className="flex flex-col items-center gap-2 pb-2 text-center">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Agency</span>
                <span className="text-xs text-gray-500 font-mono">$79 / 30d</span>
                <HeaderButton label="Contact" href="/help/support?area=billing" variant="outline" />
              </div>
           </div>
        </div>

        {/* Content Sections */}
        <div className="flex flex-col gap-8">
          {sections.map((section) => {
            const isCollapsed = collapsedSections[section.title];
            return (
              <div key={section.title} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-900/60 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors mb-3 text-left border border-gray-200/70 dark:border-gray-800"
                >
                  <div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">{section.title}</h4>
                    {section.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{section.description}</p>
                    )}
                  </div>
                  <div className="p-1 rounded-md text-gray-500">
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </button>
                
                {!isCollapsed && (
                  <div className="flex flex-col rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 divide-y divide-gray-100 dark:divide-gray-850">
                    {section.features.map((feature, fIndex) => (
                      <div 
                        key={feature.name} 
                        className={cn(
                          "grid grid-cols-[240px_1fr_1fr_1fr_1fr] gap-3 py-3.5 px-4 items-center transition-colors hover:bg-blue-50/30 dark:hover:bg-blue-950/20",
                          fIndex % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-gray-50/50 dark:bg-gray-900/40"
                        )}
                      >
                        <div className="flex items-center gap-2 pr-2">
                          <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300 font-medium">{feature.name}</span>
                          {feature.hasInfo && (
                            <div className="group relative">
                              <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500 cursor-help transition-colors" />
                              <div className="absolute left-6 top-1/2 -translate-y-1/2 w-48 p-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 pointer-events-none border border-gray-700">
                                {feature.tooltip || `Details for ${feature.name}`}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-center">
                          <StatusCell status={feature.free} />
                        </div>

                        <div className="flex justify-center">
                          <StatusCell status={feature.starter || { type: 'cross' }} />
                        </div>
                        
                        <div className="flex justify-center font-medium">
                          <StatusCell status={feature.pro} />
                        </div>
                        
                        <div className="flex justify-center">
                          <StatusCell status={feature.agency} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Lifetime & Custom CTA */}
        <div className="mt-12 bg-linear-to-br from-gray-900 via-gray-900 to-blue-950 rounded-2xl p-8 md:p-10 text-center text-white border border-gray-800 shadow-xl">
          <span className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
            One-time payment
          </span>
          <h3 className="text-2xl md:text-3xl font-bold mb-3">Lifetime Pro Available</h3>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto text-sm md:text-base">
            Get every single Pro feature forever with a single one-time payment of $149. No monthly bills, no crypto gas renewal friction.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a 
              href="/signup?plan=lifetime" 
              className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/30 no-underline cursor-pointer"
            >
              Get Lifetime Pro ($149)
            </a>
            <a 
              href="/help/support?area=billing" 
              className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-full font-semibold transition-all no-underline cursor-pointer"
            >
              Contact Sales
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PricingComparisonTable;
