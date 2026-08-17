export interface Board {
  id: string;
  slug: string;
  name: string;
  casino: string;
  code: string;
  published: boolean;
  isDraft: boolean;
  players: number;
  template: string;
  boardOrder: number;
  userRole: string;
  ownerName: string | null;
}

export interface SitePrizes {
  currency: string;
  hidePrizeAmounts: boolean;
  prizePoolLabel: string;
  countdownLabel: string;
  payoutsLabel: string;
  wagerLabel?: string;
  prizeLabel?: string;
  wagerTotalLabel?: string;
}

export interface SiteBranding {
  name: string;
  tagline: string;
  casino: string;
  code: string;
  ctaUrl: string;
  prizePool: string;
  period: string;
  resetNote: string;
  blurb?: string;
  currency: string;
  hidePrizeAmounts: boolean;
  prizePoolLabel: string;
  countdownLabel: string;
  payoutsLabel: string;
}

export interface SiteBrandingTheme {
  hasLogo: boolean;
  accentA: string | null;
  accentB: string | null;
  template: string;
  text?: Record<string, unknown>;
  font: string;
  options?: Record<string, unknown>;
  prizes: SitePrizes;
}

export interface SitePartner {
  blurb: string;
  chips?: { title?: string; description?: string; icon?: string }[];
}

export interface SiteSectionVisibility {
  hero?: boolean;
  leaderboard?: boolean;
  top3?: boolean;
  search?: boolean;
  rules?: boolean;
  partner?: boolean;
  socials?: boolean;
  share?: boolean;
  pastWinners?: boolean;
  countdown?: boolean;
  cta?: boolean;
  payouts?: boolean;
  poweredBy?: boolean;
}

export interface SiteSiteSections {
  home: boolean;
  leaderboard: boolean;
  shop: boolean;
  games: boolean;
  me: boolean;
}

export interface SiteLegalEntry {
  terms: string;
  termsEnabled: boolean;
  privacy: string;
  privacyEnabled: boolean;
  responsible: string;
  responsibleEnabled: boolean;
  cookies: string;
  cookiesEnabled: boolean;
  refund: string;
  refundEnabled: boolean;
  contact: string;
  contactEnabled: boolean;
}

export interface SitePlayerFields {
  score: boolean;
  hands: boolean;
  netProfit: boolean;
  winRate: boolean;
  change: boolean;
}

export interface SiteSocial {
  name: string;
  handle: string;
  action: string;
  url: string;
  brand: string;
  enabled: boolean;
}

export interface SiteWhyStat {
  icon?: string;
  title?: string;
  value?: string;
}

export interface PastWinner {
  label: string;
  at: string;
  top: { name: string; prize: number }[];
}

export interface ArchiveEntry {
  id: string;
  label: string;
  createdAt?: string;
  winnerName?: string | null;
  playerCount?: number;
  at?: number;
  players?: number;
}

export interface SiteNotify {
  discord_webhook_url: boolean;
  telegram_bot_token: boolean;
  telegram_chat_id: string;
  telegram_notify: boolean;
}

export interface SiteOnboarding {
  brand: boolean;
  players: boolean;
  botConnected: boolean;
  shared: boolean;
  postback: boolean;
  isFree: boolean;
}

export interface SiteAutoReset {
  enabled: boolean;
  clear: string;
}

export interface SiteData {
  brand: SiteBranding;
  prizes: SitePrizes;
  endsAt: string | null;
  partner: SitePartner;
  whyStats: SiteWhyStat[];
  rules: string[];
  socials: SiteSocial[];
  branding: SiteBrandingTheme;
  pastWinners: PastWinner[];
  playerCount: number;
  players: Player[];
  sections: SiteSectionVisibility;
  siteSections: SiteSiteSections;
  legal: SiteLegalEntry;
  playerFields: SitePlayerFields;
}

export interface Player {
  name: string;
  wagered: number;
  prize: number;
  score: number | null;
  hands: number | null;
  net_profit: number | null;
  win_rate: number | null;
  change: number | null;
}

export interface SiteResponse {
  ok: boolean;
  slug: string;
  published: boolean;
  isDraft: boolean;
  plan: string;
  data: SiteData;
  socials: SiteSocial[];
  notify: SiteNotify;
  archives: ArchiveEntry[];
  boards: Board[];
  onboarding: SiteOnboarding;
  siteId: string;
  customDomain: string;
  domainStatus: string;
  updatedAt: string;
  publishedAt: string | null;
  passwordProtected?: boolean;
  autoReset?: SiteAutoReset;
}

export interface BoardsListResponse {
  ok: boolean;
  boards: Board[];
  limits: { boards: number; players: number };
  plan: string;
}

export interface GameSetting {
  game: string;
  enabled: boolean;
  minBet: number;
  maxBet: number;
  houseEdgeBps: number;
  dailyLossCap: number | null;
}

export interface GameSettingsResponse {
  ok: boolean;
  settings: GameSetting[];
}

export interface CreditRewardMapping {
  id: string;
  kick_reward_id: string;
  kick_reward_title: string;
  kick_reward_cost: number;
  credits: number;
  active: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  stock: number | null;
  active: boolean;
}

export interface SiteViewer {
  id: string;
  kick_user_id: string;
  kick_username: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  blocked: boolean;
  fraud_score: number;
  block_reason: string | null;
}

export interface Redemption {
  id: string;
  cost: number;
  status: string;
  created_at: string;
  updated_at: string;
  kick_user_id: string;
  kick_username: string;
  item_name: string;
}

export interface CreditsChannel {
  externalId: string | null;
  name: string | null;
  linkedAt: string | null;
  tokenExpiresAt: string | null;
}

export interface CreditsStatusResponse {
  ok: boolean;
  channel: CreditsChannel;
  mappings: CreditRewardMapping[];
  shopItems: ShopItem[];
  viewers: SiteViewer[];
  redemptions: Redemption[];
  usage: Record<string, number>;
  viewerAuth: {
    kick: boolean;
    discord: boolean;
    public: boolean;
  };
  limits: Record<string, number>;
}

export interface CreditsActivityEvent {
  id: string;
  createdAt: string;
  type: string;
  amount: number;
  direction: string;
  description: string;
  kickUsername: string;
  kickUserId: string;
  siteId: string;
  siteName: string;
}

export interface CreditsActivityResponse {
  ok: boolean;
  events: CreditsActivityEvent[];
  nextCursor: string | null;
}

export interface CreditsViewerHistoryBoard {
  siteId: string;
  slug: string;
  name: string;
  siteViewerId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  blocked: boolean;
  fraudScore: number;
  createdAt: string;
  kickUserId: string;
  kickUsername: string;
  redemptionsTotal: number;
  redemptionsPending: number;
}

export interface CreditsViewerHistoryResponse {
  ok: boolean;
  kickUsername: string | null;
  kickUserId: string | null;
  boards: CreditsViewerHistoryBoard[];
}

export interface TelegramStatusResponse {
  ok: boolean;
  linked: boolean;
  telegram_user_id: string | null;
  telegram_username: string | null;
}

export interface GiveawayChatroomResponse {
  ok: boolean;
  channel: string;
  chatroomId: number;
  user: string | null;
  avatar: string | null;
  isLive: boolean;
  viewers: number;
}

export interface StatsSummary {
  views: number;
  copies: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface StatsVisitors {
  new: number;
  returning: number;
  sessions: number;
}

export interface StatsDay {
  day: string;
  views: number;
  copies: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface StatsResponse {
  ok: boolean;
  stats: {
    today: StatsSummary;
    last7: StatsSummary;
    last30: StatsSummary;
    visitors: StatsVisitors;
    scrollDepth: Record<string, number>;
    days: StatsDay[];
  };
}

export interface HeatmapResponse {
  ok: boolean;
  heatmap: number[][];
  referrers: { domain: string; count: number }[];
}

export interface ReferralsResponse {
  ok: boolean;
  code: string;
  link: string;
  count: number;
  totalDays: number;
  savedUsd: number;
}

export interface ConversionRow {
  event: string;
  amount: string | null;
  currency: string | null;
  click_ref: string | null;
  at: string;
  offer: string | null;
}

export interface ConversionsResponse {
  ok: boolean;
  conversions: ConversionRow[];
}

export interface TelegramMe {
  id: string;
  display_name: string | null;
  telegram_user_id: string | null;
  plan: string;
  created_at: string;
}

export interface TelegramBot {
  id: string;
  username: string;
  token_hint: string;
  status: string;
  welcome_message: string | null;
  created_at: string;
  updated_at: string;
  last_command_sync_at: string | null;
}

export interface TelegramBotCommand {
  id: string;
  command: string;
  response: string;
  is_enabled: boolean;
  buttons: { label: string; url: string }[];
}

export interface TelegramOffer {
  id: string;
  label: string;
  casino: string;
  promo_code: string;
  bonus_text: string;
  referral_url: string;
  is_active: boolean;
  clicks: number;
  unique_clicks: number;
  conversions: number;
  reported_revenue: { currency: string; amount: number }[];
  slug: string;
  last_activity_at: string | null;
  ctr: number;
  cr: number;
}

export interface TelegramBroadcast {
  id: string;
  bot_id: string;
  body: string;
  media_url: string | null;
  buttons: { label: string; url: string }[];
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  segment: string | null;
  total_count: number;
  sent_count: number;
  fail_count: number;
  bot_username: string;
}

export interface TelegramSubscriberStats {
  total: number;
  active: number;
  new_7d: number;
  new_30d: number;
}

export interface TelegramDailyStat {
  day: string;
  new_subscribers: number;
  commands: number;
  offers: number;
  clicks: number;
  conversions: number;
}

export interface AdminOverview {
  users: number;
  pro: number;
  leads: number;
  revenue: number;
}

export interface AdminUser {
  id: string;
  email: string;
  plan: string;
  plan_expires_at: number | null;
  status: string;
  is_admin: boolean;
  totp_enabled: boolean;
  totp_locked_until: string | null;
  suspension_reason: string | null;
  created_at: number;
  board_count: number;
  slug: string | null;
  player_count: number;
}

export interface AdminUsersResponse {
  ok: boolean;
  users: AdminUser[];
  page: number;
  pageSize: number;
  total: number;
  filters: { q: string; status: string; plan: string };
}

export interface Admin2FAStatus {
  enabled: boolean;
  verified: boolean;
  fresh: boolean;
  locked: boolean;
  recoveryCodesRemaining: number;
}

export interface AdminLead {
  id: string;
  handle: string;
  casino: string;
  contact: string;
  note: string;
  created_at: number;
}

export interface AdminLeadsResponse {
  ok: boolean;
  leads: AdminLead[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminPayment {
  id: string;
  user_id: string;
  provider: string;
  amount_usd: number;
  currency: string;
  invoice_id: string;
  tx_ref: string;
  status: string;
  created_at: number;
  email: string;
}

export interface AdminPaymentsResponse {
  ok: boolean;
  payments: AdminPayment[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminSupportMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  reply: string | null;
  created_at: number;
  replied_at: number | null;
}

export interface AdminSupportResponse {
  ok: boolean;
  messages: AdminSupportMessage[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminAuditEvent {
  id: string;
  created_at: number;
  action: string;
  entity_id: string;
  details: Record<string, unknown>;
  actor_email: string | null;
}

export interface AdminAuditResponse {
  ok: boolean;
  events: AdminAuditEvent[];
  page: number;
  pageSize: number;
  total: number;
}

export interface FeatureFlag {
  key: string;
  name: string;
  description: string | null;
  defaultValue: boolean;
}

export interface AdminFeaturesResponse {
  ok: boolean;
  flags: FeatureFlag[];
}

export interface PlatformIdentity {
  company_name: string;
  company_country: string;
  company_number: string;
  support_email: string;
  affiliate_disclosure: string;
  updated_at: string;
  complete: boolean;
}

export interface AdminIdentityResponse {
  ok: boolean;
  identity: PlatformIdentity;
}

export interface TwoFactorStatus {
  ok: boolean;
  enabled: boolean;
  verified: boolean;
  fresh: boolean;
  locked: boolean;
  recoveryCodesRemaining: number;
}

export interface TwoFactorEnableResponse {
  ok: boolean;
  uri: string;
  secret: string;
  pending?: boolean;
}

export interface TwoFactorVerifyResponse {
  ok: boolean;
  verified: boolean;
  recoveryCodes?: string[];
}


