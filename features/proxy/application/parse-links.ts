import { ProxyParser } from "@/lib/proxy-parser";
import type { ProxyNode } from "@/lib/proxy-parser";

export interface ParseLinksResult {
  links: string[];
  proxies: ProxyNode[];
  invalidCount: number;
}

export function parseProxyLinks(rawLinks: string[]): ParseLinksResult {
  const links = rawLinks.map((link) => link.trim()).filter(Boolean);

  const proxies: ProxyNode[] = [];
  for (const link of links) {
    const parsed = ProxyParser.parseProxy(link);
    if (parsed) {
      proxies.push(parsed);
    }
  }

  return {
    links,
    proxies,
    invalidCount: Math.max(0, links.length - proxies.length),
  };
}
