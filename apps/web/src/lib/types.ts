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

export interface SiteBranding {
  name: string;
  casino: string;
  code: string;
  ctaUrl: string;
  prizePool: string;
  period: string;
  tagline: string;
  resetNote: string;
  blurb: string;
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

export interface SiteData {
  brand: SiteBranding;
  players: Player[];
  playerCount: number;
}

export interface SiteResponse {
  ok: boolean;
  slug: string;
  published: boolean;
  isDraft: boolean;
  plan: string;
  data: SiteData;
  siteId: string;
  customDomain: string;
  domainStatus: string;
  updatedAt: string;
  publishedAt: string | null;
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
  stock: number;
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

export interface CreditsStatusResponse {
  ok: boolean;
  channel: {
    externalId: string | null;
    name: string | null;
    linkedAt: string | null;
  };
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
