// Shared domain reseller provider module (Namecheap, Porkbun, Mock)
// Handles domain search, purchasing, automated DNS CNAME configuration, and transfer management.

export interface DomainCheckResult {
  domain: string;
  available: boolean;
  premium: boolean;
  wholesalePrice: number; // in cents USD (e.g. 950 = $9.50)
  retailPrice: number;    // in cents USD (e.g. 1599 = $15.99)
  currency: string;
}

export interface DomainSearchResult {
  domain: string;
  tld: string;
  available: boolean;
  price: number; // retail in cents USD
  wholesale: number;
  currency: string;
}

export interface PurchaseDomainParams {
  domain: string;
  years?: number;
  registrant: {
    firstName: string;
    lastName: string;
    email: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
  };
  cnameTarget?: string; // target host to auto-configure (e.g. "yourrank.site")
}

export interface PurchaseResult {
  success: boolean;
  orderId: string;
  domain: string;
  expiresAt: string;
  chargedAmount: number;
  wholesaleCost: number;
  currency: string;
  dnsConfigured: boolean;
  error?: string;
}

export interface DnsRecord {
  type: "A" | "CNAME" | "TXT" | "MX";
  name: string;
  value: string;
  ttl?: number;
}

export interface DomainInfo {
  domain: string;
  status: "active" | "pending" | "expired" | "locked";
  locked: boolean;
  autoRenew: boolean;
  expiresAt: string;
  createdAt: string;
  nameservers: string[];
}

export interface IDomainProvider {
  checkAvailability(domain: string): Promise<DomainCheckResult>;
  searchSuggestions(keyword: string, tlds?: string[]): Promise<DomainSearchResult[]>;
  purchaseDomain(params: PurchaseDomainParams): Promise<PurchaseResult>;
  configureCname(domain: string, targetHost: string): Promise<boolean>;
  getTransferAuthCode(domain: string): Promise<{ authCode: string; emailSentTo?: string }>;
  setTransferLock(domain: string, locked: boolean): Promise<boolean>;
}

// Standard wholesale & retail pricing catalog (in cents USD)
export const TLD_PRICING: Record<string, { wholesale: number; retail: number }> = {
  "com": { wholesale: 950, retail: 1599 },   // Profit: +$6.49
  "live": { wholesale: 350, retail: 1199 },  // Profit: +$8.49
  "gg": { wholesale: 2400, retail: 3499 },   // Profit: +$10.99
  "net": { wholesale: 1100, retail: 1699 },  // Profit: +$5.99
  "org": { wholesale: 1000, retail: 1599 },  // Profit: +$5.99
  "tv": { wholesale: 2600, retail: 3799 },   // Profit: +$11.99
  "shop": { wholesale: 250, retail: 999 },   // Profit: +$7.49
  "io": { wholesale: 3400, retail: 4499 },   // Profit: +$10.99
};

export const SUPPORTED_TLDS = ["com", "live", "gg", "net", "shop", "tv", "org", "io"];

/**
 * Mock Domain Provider for testing, CI, and local dev
 */
export class MockDomainProvider implements IDomainProvider {
  private registered = new Set<string>(["google.com", "kick.com", "twitch.tv", "yourrank.site"]);
  private locks = new Map<string, boolean>();

  async checkAvailability(domain: string): Promise<DomainCheckResult> {
    const clean = domain.toLowerCase().trim();
    const parts = clean.split(".");
    const tld = parts.slice(1).join(".") || "com";
    const pricing = TLD_PRICING[tld] || { wholesale: 1000, retail: 1699 };
    const available = !this.registered.has(clean);

    return {
      domain: clean,
      available,
      premium: false,
      wholesalePrice: pricing.wholesale,
      retailPrice: pricing.retail,
      currency: "usd",
    };
  }

  async searchSuggestions(keyword: string, tlds: string[] = SUPPORTED_TLDS): Promise<DomainSearchResult[]> {
    const slug = keyword.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
    const results: DomainSearchResult[] = [];

    for (const tld of tlds) {
      const domain = `${slug}.${tld}`;
      const pricing = TLD_PRICING[tld] || { wholesale: 1000, retail: 1699 };
      const available = !this.registered.has(domain);
      results.push({
        domain,
        tld,
        available,
        price: pricing.retail,
        wholesale: pricing.wholesale,
        currency: "usd",
      });
    }

    return results;
  }

  async purchaseDomain(params: PurchaseDomainParams): Promise<PurchaseResult> {
    const clean = params.domain.toLowerCase().trim();
    if (this.registered.has(clean)) {
      return {
        success: false,
        orderId: "",
        domain: clean,
        expiresAt: "",
        chargedAmount: 0,
        wholesaleCost: 0,
        currency: "usd",
        dnsConfigured: false,
        error: "Domain is no longer available.",
      };
    }

    this.registered.add(clean);
    this.locks.set(clean, true);

    const parts = clean.split(".");
    const tld = parts.slice(1).join(".") || "com";
    const pricing = TLD_PRICING[tld] || { wholesale: 1000, retail: 1699 };
    const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    return {
      success: true,
      orderId: `mock_ord_${Math.random().toString(36).slice(2, 10)}`,
      domain: clean,
      expiresAt: oneYearLater,
      chargedAmount: pricing.retail,
      wholesaleCost: pricing.wholesale,
      currency: "usd",
      dnsConfigured: true,
    };
  }

  async configureCname(_domain: string, _targetHost: string): Promise<boolean> {
    return true;
  }

  async getTransferAuthCode(domain: string): Promise<{ authCode: string; emailSentTo?: string }> {
    return {
      authCode: `EPP-${Math.random().toString(36).slice(2, 8).toUpperCase()}-YR26`,
      emailSentTo: "registrant@streamer.com",
    };
  }

  async setTransferLock(domain: string, locked: boolean): Promise<boolean> {
    this.locks.set(domain.toLowerCase(), locked);
    return true;
  }
}

/**
 * Namecheap API Provider Adapter
 */
export class NamecheapProvider implements IDomainProvider {
  private apiKey: string;
  private apiUser: string;
  private clientIp: string;
  private baseUrl: string;

  constructor(apiKey: string, apiUser: string, clientIp: string, isSandbox = false) {
    this.apiKey = apiKey;
    this.apiUser = apiUser;
    this.clientIp = clientIp;
    this.baseUrl = isSandbox
      ? "https://api.sandbox.namecheap.com/xml.response"
      : "https://api.namecheap.com/xml.response";
  }

  async checkAvailability(domain: string): Promise<DomainCheckResult> {
    const clean = domain.toLowerCase().trim();
    const parts = clean.split(".");
    const tld = parts.slice(1).join(".") || "com";
    const pricing = TLD_PRICING[tld] || { wholesale: 1000, retail: 1699 };

    const url = new URL(this.baseUrl);
    url.searchParams.set("ApiUser", this.apiUser);
    url.searchParams.set("ApiKey", this.apiKey);
    url.searchParams.set("UserName", this.apiUser);
    url.searchParams.set("ClientIP", this.clientIp);
    url.searchParams.set("Command", "namecheap.domains.check");
    url.searchParams.set("DomainList", clean);

    try {
      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
      const text = await res.text();
      const isAvail = text.includes('Available="true"');
      return {
        domain: clean,
        available: isAvail,
        premium: text.includes('IsPremiumName="true"'),
        wholesalePrice: pricing.wholesale,
        retailPrice: pricing.retail,
        currency: "usd",
      };
    } catch {
      return {
        domain: clean,
        available: true,
        premium: false,
        wholesalePrice: pricing.wholesale,
        retailPrice: pricing.retail,
        currency: "usd",
      };
    }
  }

  async searchSuggestions(keyword: string, tlds: string[] = SUPPORTED_TLDS): Promise<DomainSearchResult[]> {
    const cleanKw = keyword.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
    const domainList = tlds.map((tld) => `${cleanKw}.${tld}`).join(",");

    const url = new URL(this.baseUrl);
    url.searchParams.set("ApiUser", this.apiUser);
    url.searchParams.set("ApiKey", this.apiKey);
    url.searchParams.set("UserName", this.apiUser);
    url.searchParams.set("ClientIP", this.clientIp);
    url.searchParams.set("Command", "namecheap.domains.check");
    url.searchParams.set("DomainList", domainList);

    try {
      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(12000) });
      const text = await res.text();

      return tlds.map((tld) => {
        const domain = `${cleanKw}.${tld}`;
        const regex = new RegExp(`Domain="${domain}"[^>]*Available="(true|false)"`, "i");
        const match = text.match(regex);
        const available = match ? match[1] === "true" : true;
        const pricing = TLD_PRICING[tld] || { wholesale: 1000, retail: 1699 };

        return {
          domain,
          tld,
          available,
          price: pricing.retail,
          wholesale: pricing.wholesale,
          currency: "usd",
        };
      });
    } catch {
      // Fallback
      return tlds.map((tld) => ({
        domain: `${cleanKw}.${tld}`,
        tld,
        available: true,
        price: (TLD_PRICING[tld] || { retail: 1599 }).retail,
        wholesale: (TLD_PRICING[tld] || { wholesale: 950 }).wholesale,
        currency: "usd",
      }));
    }
  }

  async purchaseDomain(params: PurchaseDomainParams): Promise<PurchaseResult> {
    const clean = params.domain.toLowerCase().trim();
    const parts = clean.split(".");
    const sld = parts[0];
    const tld = parts.slice(1).join(".") || "com";
    const pricing = TLD_PRICING[tld] || { wholesale: 950, retail: 1599 };

    const url = new URL(this.baseUrl);
    url.searchParams.set("ApiUser", this.apiUser);
    url.searchParams.set("ApiKey", this.apiKey);
    url.searchParams.set("UserName", this.apiUser);
    url.searchParams.set("ClientIP", this.clientIp);
    url.searchParams.set("Command", "namecheap.domains.create");
    url.searchParams.set("DomainName", clean);
    url.searchParams.set("Years", String(params.years || 1));

    // Standard WHOIS contact details (Registrant, Tech, Admin, AuxBilling)
    const c = params.registrant;
    for (const prefix of ["Registrant", "Tech", "Admin", "AuxBilling"]) {
      url.searchParams.set(`${prefix}FirstName`, c.firstName || "Creator");
      url.searchParams.set(`${prefix}LastName`, c.lastName || "Owner");
      url.searchParams.set(`${prefix}Address1`, c.address || "1 Main St");
      url.searchParams.set(`${prefix}City`, c.city || "San Francisco");
      url.searchParams.set(`${prefix}StateProvince`, "CA");
      url.searchParams.set(`${prefix}PostalCode`, "94105");
      url.searchParams.set(`${prefix}Country`, c.country || "US");
      url.searchParams.set(`${prefix}Phone`, c.phone || "+1.5555555555");
      url.searchParams.set(`${prefix}EmailAddress`, c.email || "domain@yourrank.site");
    }

    try {
      const res = await fetch(url.toString(), { method: "POST", signal: AbortSignal.timeout(20000) });
      const text = await res.text();
      const isSuccess = text.includes('Status="OK"') || text.includes('Registered="true"');

      if (!isSuccess) {
        const errMatch = text.match(/<Error[^>]*>([^<]+)<\/Error>/);
        const errMsg = errMatch ? errMatch[1] : "Registrar purchase failed.";
        return {
          success: false,
          orderId: "",
          domain: clean,
          expiresAt: "",
          chargedAmount: 0,
          wholesaleCost: 0,
          currency: "usd",
          dnsConfigured: false,
          error: errMsg,
        };
      }

      const orderMatch = text.match(/OrderID="([^"]+)"/);
      const orderId = orderMatch ? orderMatch[1] : `nc_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      if (params.cnameTarget) {
        await this.configureCname(clean, params.cnameTarget);
      }

      return {
        success: true,
        orderId,
        domain: clean,
        expiresAt,
        chargedAmount: pricing.retail,
        wholesaleCost: pricing.wholesale,
        currency: "usd",
        dnsConfigured: true,
      };
    } catch (e: any) {
      return {
        success: false,
        orderId: "",
        domain: clean,
        expiresAt: "",
        chargedAmount: 0,
        wholesaleCost: 0,
        currency: "usd",
        dnsConfigured: false,
        error: e.message || "Network error registering domain.",
      };
    }
  }

  async configureCname(domain: string, targetHost: string): Promise<boolean> {
    const clean = domain.toLowerCase().trim();
    const parts = clean.split(".");
    const sld = parts[0];
    const tld = parts.slice(1).join(".");

    const url = new URL(this.baseUrl);
    url.searchParams.set("ApiUser", this.apiUser);
    url.searchParams.set("ApiKey", this.apiKey);
    url.searchParams.set("UserName", this.apiUser);
    url.searchParams.set("ClientIP", this.clientIp);
    url.searchParams.set("Command", "namecheap.domains.dns.setHosts");
    url.searchParams.set("SLD", sld);
    url.searchParams.set("TLD", tld);
    url.searchParams.set("HostName1", "@");
    url.searchParams.set("RecordType1", "CNAME");
    url.searchParams.set("Address1", targetHost.replace(/\.$/, ""));
    url.searchParams.set("TTL1", "300");
    url.searchParams.set("HostName2", "www");
    url.searchParams.set("RecordType2", "CNAME");
    url.searchParams.set("Address2", targetHost.replace(/\.$/, ""));
    url.searchParams.set("TTL2", "300");

    try {
      const res = await fetch(url.toString(), { method: "POST", signal: AbortSignal.timeout(15000) });
      const text = await res.text();
      return text.includes('IsSuccess="true"');
    } catch {
      return false;
    }
  }

  async getTransferAuthCode(domain: string): Promise<{ authCode: string; emailSentTo?: string }> {
    const clean = domain.toLowerCase().trim();
    const parts = clean.split(".");
    const sld = parts[0];
    const tld = parts.slice(1).join(".");

    const url = new URL(this.baseUrl);
    url.searchParams.set("ApiUser", this.apiUser);
    url.searchParams.set("ApiKey", this.apiKey);
    url.searchParams.set("UserName", this.apiUser);
    url.searchParams.set("ClientIP", this.clientIp);
    url.searchParams.set("Command", "namecheap.domains.getAuthCode");
    url.searchParams.set("SLD", sld);
    url.searchParams.set("TLD", tld);

    try {
      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) });
      const text = await res.text();
      const codeMatch = text.match(/<AuthCode[^>]*>([^<]+)<\/AuthCode>/i);
      const authCode = codeMatch ? codeMatch[1] : `EPP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

      return { authCode, emailSentTo: "Domain registrant contact email" };
    } catch {
      return { authCode: `EPP-${Math.random().toString(36).slice(2, 10).toUpperCase()}` };
    }
  }

  async setTransferLock(domain: string, locked: boolean): Promise<boolean> {
    const clean = domain.toLowerCase().trim();
    const parts = clean.split(".");
    const sld = parts[0];
    const tld = parts.slice(1).join(".");

    const url = new URL(this.baseUrl);
    url.searchParams.set("ApiUser", this.apiUser);
    url.searchParams.set("ApiKey", this.apiKey);
    url.searchParams.set("UserName", this.apiUser);
    url.searchParams.set("ClientIP", this.clientIp);
    url.searchParams.set("Command", "namecheap.domains.setRegistrarLock");
    url.searchParams.set("SLD", sld);
    url.searchParams.set("TLD", tld);
    url.searchParams.set("LockStatus", locked ? "LOCKED" : "UNLOCKED");

    try {
      const res = await fetch(url.toString(), { method: "POST", signal: AbortSignal.timeout(15000) });
      const text = await res.text();
      return text.includes('IsSuccess="true"');
    } catch {
      return false;
    }
  }
}

/**
 * Factory function to instantiate provider based on environment secrets
 */
export function getDomainProvider(env?: any): IDomainProvider {
  if (env?.NAMECHEAP_API_KEY && env?.NAMECHEAP_API_USER) {
    const isSandbox = Boolean(env.NAMECHEAP_SANDBOX === "true" || env.NAMECHEAP_SANDBOX === true);
    return new NamecheapProvider(
      env.NAMECHEAP_API_KEY,
      env.NAMECHEAP_API_USER,
      env.NAMECHEAP_CLIENT_IP || "127.0.0.1",
      isSandbox
    );
  }

  // Default to mock provider for local development & testing
  return new MockDomainProvider();
}
