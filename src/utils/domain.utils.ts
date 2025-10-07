import dns from "node:dns/promises";

export async function domainExists(domain: string): Promise<boolean> {
  try {
    const records = await dns.lookup(domain);
    return !!records;
  } catch {
    return false;
  }
}

export async function siteIsReachable(domain: string): Promise<boolean> {
  try {
    const url = domain.startsWith("http") ? domain : `https://${domain}`;
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}
