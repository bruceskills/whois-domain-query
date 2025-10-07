import { randomBytes } from "node:crypto";

export class HeaderRandomizer {
  private userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0",
  ];

  private referers = [
    "https://www.google.com/",
    "https://www.bing.com/",
    "https://duckduckgo.com/",
    "https://www.yahoo.com/",
    "https://registro.br/",
    "https://www.whois.com/",
    "https://who.is/",
    null,
  ];

  private origins = [
    "https://www.google.com",
    "https://registro.br",
    "https://www.whois.com",
    "https://who.is",
    null,
  ];

  private acceptLanguages = [
    "en-US,en;q=0.9",
    "pt-BR,pt;q=0.9,en;q=0.8",
    "en-GB,en;q=0.9",
    "es-ES,es;q=0.9,en;q=0.8",
    "fr-FR,fr;q=0.9,en;q=0.8",
  ];

  private acceptEncodings = [
    "gzip, deflate, br",
    "gzip, deflate",
    "gzip, deflate, br, zstd",
  ];

  getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  generateRandomHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "User-Agent": this.getRandomElement(this.userAgents),
      Accept: "application/rdap+json, application/json, */*",
      "Accept-Language": this.getRandomElement(this.acceptLanguages),
      "Accept-Encoding": this.getRandomElement(this.acceptEncodings),
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      DNT: Math.random() > 0.5 ? "1" : "0",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
    };

    const referer = this.getRandomElement(this.referers);
    if (referer) {
      headers.Referer = referer;
    }

    const origin = this.getRandomElement(this.origins);
    if (origin) {
      headers.Origin = origin;
    }

    headers["X-Session-Id"] = randomBytes(16).toString("hex");

    return headers;
  }
}
