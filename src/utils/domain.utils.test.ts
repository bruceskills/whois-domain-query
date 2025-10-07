import { describe, it, expect, vi, beforeEach } from "vitest";
import dns from "node:dns/promises";
import { domainExists, siteIsReachable } from "./domain.utils";

// --- Mocks ---
vi.mock("node:dns/promises");
global.fetch = vi.fn();

describe("domainExists", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return true if dns.lookup succeeds", async () => {
    (dns.lookup as any).mockResolvedValue({ address: "127.0.0.1", family: 4 });
    const result = await domainExists("example.com");
    expect(result).toBe(true);
  });

  it("should return false if dns.lookup fails", async () => {
    (dns.lookup as any).mockRejectedValue(new Error("Not found"));
    const result = await domainExists("nonexistent.com");
    expect(result).toBe(false);
  });
});

describe("siteIsReachable", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return true if fetch returns ok", async () => {
    (fetch as any).mockResolvedValue({ ok: true });
    const result = await siteIsReachable("example.com");
    expect(result).toBe(true);
  });

  it("should return false if fetch returns not ok", async () => {
    (fetch as any).mockResolvedValue({ ok: false });
    const result = await siteIsReachable("example.com");
    expect(result).toBe(false);
  });

  it("should return false if fetch throws an error", async () => {
    (fetch as any).mockRejectedValue(new Error("Network error"));
    const result = await siteIsReachable("example.com");
    expect(result).toBe(false);
  });
});
