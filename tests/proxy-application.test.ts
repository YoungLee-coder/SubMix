import { describe, expect, it } from "vitest";
import { parseProxyLinks } from "@/features/proxy/application/parse-links";
import { generateProxyConfig } from "@/features/proxy/application/generate-config";
import { publishSubscription } from "@/features/proxy/application/publish-subscription";

describe("proxy application services", () => {
  it("parses links, generates yaml, and publishes subscription", () => {
    const parsed = parseProxyLinks([
      "trojan://password@example.com:443#demo-node",
      "invalid://bad-link",
    ]);

    expect(parsed.links.length).toBe(2);
    expect(parsed.proxies.length).toBe(1);
    expect(parsed.invalidCount).toBe(1);

    const generated = generateProxyConfig({
      proxies: parsed.proxies,
      configType: "simple",
      ruleMode: "whitelist",
    });

    expect(generated.proxyCount).toBe(1);
    expect(generated.yaml).toContain("proxies:");
    expect(generated.yaml).toContain("demo-node");

    const published = publishSubscription(generated.yaml);
    expect(published.success).toBe(true);
    expect(published.id).toBeTruthy();
    expect(published.expiresAt).toBeTruthy();
    expect(published.expiresInMinutes).toBe(30);
  });
});
