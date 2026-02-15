import { MihomoConfigGenerator } from "@/lib/mihomo-config";
import type { ProxyNode } from "@/lib/proxy-parser";
import type { RuleMode } from "@/types/proxy";

export type ConfigType = "simple" | "full";

export interface GenerateConfigInput {
  proxies: ProxyNode[];
  configType?: ConfigType;
  ruleMode?: RuleMode;
}

export interface GenerateConfigResult {
  yaml: string;
  proxyCount: number;
}

export function generateProxyConfig(input: GenerateConfigInput): GenerateConfigResult {
  const { proxies, configType = "full", ruleMode = "whitelist" } = input;

  const config =
    configType === "simple"
      ? MihomoConfigGenerator.generateSimpleConfig(proxies, ruleMode)
      : MihomoConfigGenerator.generateConfig(proxies, ruleMode);

  return {
    yaml: MihomoConfigGenerator.configToYaml(config),
    proxyCount: proxies.length,
  };
}
