import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import fs from "node:fs";
import path from "node:path";
import { HeaderRandomizer } from "@/utils/header-randomizer.utils";
import type { Entity, RDAPClientConfig, RDAPResponse } from "@/types";

export class RDAPClient {
  private axiosInstance: AxiosInstance;
  private headerRandomizer: HeaderRandomizer;
  private config: RDAPClientConfig;
  private readonly cachePath: string;

  constructor(config: RDAPClientConfig = {}) {
    this.config = {
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      randomizeHeaders: config.randomizeHeaders !== false,
      proxy: config.proxy,
    };

    this.headerRandomizer = new HeaderRandomizer();
    this.axiosInstance = this.createAxiosInstance();
    this.cachePath = path.resolve(".rdap-tld-cache.json");
  }

  private createAxiosInstance(): AxiosInstance {
    const axiosConfig: AxiosRequestConfig = {
      timeout: this.config.timeout,
      validateStatus: (status) => status < 500,
    };
    if (this.config.proxy) axiosConfig.proxy = this.config.proxy;
    return axios.create(axiosConfig);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retries: number = this.config.retries!,
  ): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${i + 1} failed:`, error);
        if (i < retries) {
          const delayMs = this.config.retryDelay! * 2 ** i;
          console.log(`Retrying in ${delayMs}ms...`);
          await this.delay(delayMs);
        }
      }
    }
    throw lastError;
  }

  /**
   * Loads the local TLD cache (dns.json from IANA)
   */
  private async loadTLDCache(): Promise<any> {
    if (fs.existsSync(this.cachePath)) {
      const stats = fs.statSync(this.cachePath);
      const ageHours = (Date.now() - stats.mtimeMs) / 1000 / 3600;
      if (ageHours < 24) {
        return JSON.parse(fs.readFileSync(this.cachePath, "utf-8"));
      }
    }

    const bootstrapUrl = "https://data.iana.org/rdap/dns.json";
    console.log("🌐 Updating RDAP bootstrap dataset from IANA...");
    const { data } = await axios.get(bootstrapUrl, { timeout: 10000 });

    fs.writeFileSync(this.cachePath, JSON.stringify(data, null, 2));
    return data;
  }

  /**
   * Resolves the appropriate RDAP server for the domain.
   */
  private async resolveRDAPServer(domain: string): Promise<string> {
    const tld = domain.split(".").pop()?.toLowerCase();
    if (!tld) throw new Error("Invalid domain");

    const data = await this.loadTLDCache();

    const service = data.services.find((s: any[]) =>
      s[0].some(
        (item: string) => item.replace(/^\./, "").toLowerCase() === tld,
      ),
    );

    if (!service) {
      console.warn(`⚠️ No RDAP server found for .${tld}, using fallback IANA`);
      return `https://rdap.iana.org/domain/${domain}`;
    }

    const rdapBase = service[1][0];
    return `${rdapBase.replace(/\/$/, "")}/domain/${domain}`;
  }

  /**
   * Automatically query RDAP for any domain (.br, .com, .org, etc.)
   */
  async queryDomain(domain: string, rdapUrl?: string): Promise<RDAPResponse> {
    const url = rdapUrl || (await this.resolveRDAPServer(domain));

    return this.executeWithRetry(async () => {
      const headers = this.config.randomizeHeaders
        ? this.headerRandomizer.generateRandomHeaders()
        : {
            "User-Agent": "RDAP-Client/1.0",
            Accept: "application/rdap+json, application/json",
          };

      console.log("\n🔍 Querying:", url);
      console.log(`\n📋 Headers: ${JSON.stringify(headers, null, 2)}\n`);

      const response: AxiosResponse<RDAPResponse> =
        await this.axiosInstance.get(url, { headers });

      if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.data;
    });
  }

  parseVCard(entity: Entity): Record<string, any> {
    const result: Record<string, any> = {};
    if (entity.vcardArray?.[1]) {
      for (const item of entity.vcardArray[1]) {
        const [type, ...values] = item;
        switch (type) {
          case "fn":
            result.fullName = values[2];
            break;
          case "org":
            result.organization = values[2];
            break;
          case "email":
            result.email = values[2];
            break;
          case "tel":
            result.phone = values[2];
            break;
          case "adr":
            if (values[2] && Array.isArray(values[2])) {
              result.address = {
                street: values[2][2],
                city: values[2][3],
                state: values[2][4],
                postalCode: values[2][5],
                country: values[2][6],
              };
            }
            break;
        }
      }
    }
    return result;
  }

  formatResponse(data: RDAPResponse): string {
    const formatted: any = {
      domain: data.ldhName,
      handle: data.handle,
      status: data.status,
      events: {},
      nameservers: [],
      contacts: {},
      secureDNS: data.secureDNS,
    };

    if (data.events) {
      for (const event of data.events) {
        formatted.events[event.eventAction] = new Date(
          event.eventDate,
        ).toISOString();
      }
    }

    if (data.nameservers) {
      formatted.nameservers = data.nameservers.map((ns) => ({
        name: ns.ldhName,
        ips: ns.ipAddresses,
      }));
    }

    if (data.entities) {
      for (const entity of data.entities) {
        const contact = this.parseVCard(entity);
        if (entity.roles) {
          for (const role of entity.roles) {
            formatted.contacts[role] = {
              ...contact,
              handle: entity.handle,
            };
          }
        }
      }
    }

    return JSON.stringify(formatted, null, 2);
  }
}
