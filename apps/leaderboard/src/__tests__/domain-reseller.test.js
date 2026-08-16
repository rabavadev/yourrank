import { describe, it, expect } from "bun:test";
import {
  MockDomainProvider,
  TLD_PRICING,
} from "../../../../shared/domain-provider.js";

describe("Domain Reseller Provider Layer", () => {
  const provider = new MockDomainProvider();

  it("checks availability accurately", async () => {
    const available = await provider.checkAvailability("mykickstreamer.com");
    expect(available.available).toBe(true);
    expect(available.retailPrice).toBe(TLD_PRICING.com.retail);
    expect(available.wholesalePrice).toBe(TLD_PRICING.com.wholesale);

    const taken = await provider.checkAvailability("google.com");
    expect(taken.available).toBe(false);
  });

  it("returns search suggestions across supported TLDs with pricing markup", async () => {
    const suggestions = await provider.searchSuggestions("streampoints", ["com", "live", "gg"]);
    expect(suggestions.length).toBe(3);
    expect(suggestions[0].domain).toBe("streampoints.com");
    expect(suggestions[0].price).toBe(TLD_PRICING.com.retail);
    expect(suggestions[1].domain).toBe("streampoints.live");
    expect(suggestions[2].domain).toBe("streampoints.gg");
  });

  it("purchases domain and prevents double registration", async () => {
    const res = await provider.purchaseDomain({
      domain: "streamerhq.live",
      registrant: {
        firstName: "Test",
        lastName: "Streamer",
        email: "test@streamer.com",
      },
    });

    expect(res.success).toBe(true);
    expect(res.orderId).toContain("mock_ord_");
    expect(res.chargedAmount).toBe(TLD_PRICING.live.retail);

    const res2 = await provider.purchaseDomain({
      domain: "streamerhq.live",
      registrant: {
        firstName: "Test",
        lastName: "Streamer",
        email: "test@streamer.com",
      },
    });
    expect(res2.success).toBe(false);
    expect(res2.error).toContain("no longer available");
  });

  it("retrieves EPP transfer auth code", async () => {
    const codeData = await provider.getTransferAuthCode("streamerhq.live");
    expect(codeData.authCode).toContain("EPP-");
  });

  it("toggles registrar transfer lock", async () => {
    const locked = await provider.setTransferLock("streamerhq.live", false);
    expect(locked).toBe(true);
  });
});
