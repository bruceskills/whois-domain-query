export interface RDAPClientConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  randomizeHeaders?: boolean;
  proxy?: {
    host: string;
    port: number;
    auth?: {
      username: string;
      password: string;
    };
  };
}

export interface RDAPResponse {
  objectClassName: string;
  handle?: string;
  ldhName?: string;
  status?: string[];
  entities?: Entity[];
  events?: Event[];
  links?: Link[];
  notices?: Notice[];
  nameservers?: Nameserver[];
  secureDNS?: SecureDNS;
  publicIds?: PublicId[];
  [key: string]: any;
}

export interface Entity {
  objectClassName: string;
  handle?: string;
  roles?: string[];
  vcardArray?: any[];
  entities?: Entity[];
  [key: string]: any;
}

interface Event {
  eventAction: string;
  eventDate: string;
}

interface Link {
  rel: string;
  href: string;
  type?: string;
}

interface Notice {
  title?: string;
  description?: string[];
  links?: Link[];
}

export interface Nameserver {
  objectClassName: string;
  ldhName: string;
  ipAddresses?: {
    v4?: string[];
    v6?: string[];
  };
}

interface SecureDNS {
  zoneSigned?: boolean;
  delegationSigned?: boolean;
  dsData?: any[];
}

interface PublicId {
  type: string;
  identifier: string;
}
