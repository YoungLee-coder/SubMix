import { Button } from "@/components/ui/button";
import { Rocket, Github } from "lucide-react";
import { ProtocolSupportCard } from "@/components/proxy/ProtocolSupportCard";
import { ProxyWorkbench } from "@/components/proxy/ProxyWorkbench";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="relative text-center mb-8">
          <div className="absolute top-0 right-0">
            <Button asChild variant="outline" size="default" className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
              <a href="https://github.com/YoungLee-coder/SubMix" target="_blank" rel="noreferrer noopener">
              <Github className="h-5 w-5" />
              <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <Rocket className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              SubMix
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            企业多协议配置管理工具，支持逐个添加节点、自由编辑排序，生成统一的 YAML 配置
          </p>
        </div>

        <ProxyWorkbench />
        <ProtocolSupportCard />
      </div>
    </div>
  );
}
