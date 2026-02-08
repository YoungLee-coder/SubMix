// 节点列表卡片组件

"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Edit, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Server, 
  Network, 
  Shield, 
  AlertCircle 
} from "lucide-react";
import type { ParsedProxy } from '@/types/proxy';
import { 
  getDisplayProtocolType, 
  getProtocolIconBackground 
} from '@/lib/protocol-utils';

interface NodeListCardProps {
  proxies: ParsedProxy[];
  onEdit: (proxy: ParsedProxy) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}

export function NodeListCard({ 
  proxies, 
  onEdit, 
  onDelete, 
  onMove 
}: NodeListCardProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 检查滚动状态
  const checkScrollState = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setIsScrolled(scrollTop > 10);
    setCanScrollDown(scrollHeight - scrollTop - clientHeight > 10);
  };

  // 监听滚动事件
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollState();
    container.addEventListener('scroll', checkScrollState);
    
    return () => {
      container.removeEventListener('scroll', checkScrollState);
    };
  }, [proxies.length]);

  return (
    <Card className="h-[560px] flex flex-col">
      <CardHeader className="flex-shrink-0 pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            节点列表
          </div>
          <Badge variant="secondary">
            {proxies.length} 个节点
          </Badge>
        </CardTitle>
        <CardDescription>
          管理服务节点，支持编辑和排序
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 pb-2">
        {proxies.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
            <div>
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无节点</p>
              <p className="text-sm">请在左侧添加连接串</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* 节点列表容器 - 固定高度，让第3个节点半隐藏 */}
            <div className="relative flex-1">
              <div 
                ref={scrollContainerRef}
                className="h-[400px] overflow-y-auto scroll-smooth node-list-scrollbar space-y-3"
              >
                {proxies.map((proxy, index) => (
                  <NodeItem
                    key={proxy.id}
                    proxy={proxy}
                    index={index}
                    totalCount={proxies.length}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onMove={onMove}
                  />
                ))}
              </div>
              
              {/* 滑动提示遮罩（当节点数量超过2个时显示） */}
              {proxies.length > 2 && (
                <>
                  {/* 顶部渐变遮罩（滚动时显示） */}
                  <div 
                    className={`absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white/80 via-white/30 to-transparent dark:from-gray-950/80 dark:via-gray-950/30 pointer-events-none rounded-t-lg transition-opacity duration-300 ${
                      isScrolled ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  
                  {/* 底部渐变遮罩（半隐藏提示） */}
                  <div 
                    className={`absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/95 via-white/70 to-transparent dark:from-gray-950/95 dark:via-gray-950/70 pointer-events-none transition-opacity duration-300 ${
                      canScrollDown ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </>
              )}
            </div>
            
            {/* 智能滚动指示器 */}
            {proxies.length > 2 && (
              <div className="mt-2 text-center flex-shrink-0">
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50 transition-all duration-300">
                  {/* 滚动指示点 */}
                  <div className="flex items-center gap-1">
                    <div className={`w-1 h-1 rounded-full transition-all duration-300 ${
                      isScrolled ? 'bg-primary' : 'bg-current opacity-50'
                    }`} />
                    <div className={`w-1 h-1 rounded-full transition-all duration-300 ${
                      isScrolled && canScrollDown ? 'bg-primary' : 'bg-current opacity-75'
                    }`} />
                    <div className={`w-1 h-1 rounded-full transition-all duration-300 ${
                      !canScrollDown && isScrolled ? 'bg-primary' : 'bg-current'
                    }`} />
                  </div>
                  
                  {/* 状态文字 */}
                  <span className="transition-all duration-300">
                    {!isScrolled && canScrollDown 
                      ? `向下滑动查看更多 (${proxies.length - 2}+ 个节点)`
                      : isScrolled && canScrollDown 
                      ? `继续滑动查看更多节点`
                      : isScrolled && !canScrollDown
                      ? `已显示全部 ${proxies.length} 个节点`
                      : `滑动查看全部 ${proxies.length} 个节点`
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface NodeItemProps {
  proxy: ParsedProxy;
  index: number;
  totalCount: number;
  onEdit: (proxy: ParsedProxy) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}

function NodeItem({ 
  proxy, 
  index, 
  totalCount, 
  onEdit, 
  onDelete, 
  onMove 
}: NodeItemProps) {
  const displayType = getDisplayProtocolType(proxy);
  
  // 安全的图标渲染函数
  const renderProtocolIcon = () => {
    const iconClass = "h-4 w-4";
    switch (displayType) {
      case "vless": 
      case "trojan": 
        return <Shield className={iconClass} />;
      case "hysteria2": 
        return <Network className={iconClass} />;
      case "ss":
      case "ss2022": 
      default: 
        return <Server className={iconClass} />;
    }
  };

  return (
    <Card className="group border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-3 pr-2">
            
            {/* 第一行：协议类型和节点名称 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${getProtocolIconBackground(displayType)}`}>
                  {renderProtocolIcon()}
                </div>
                <Badge variant="secondary" className="text-xs font-medium">
                  {displayType.toUpperCase()}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <h4 
                  className="font-semibold text-sm truncate group-hover:text-primary transition-colors cursor-default" 
                  title={proxy.name}
                >
                  {proxy.name}
                </h4>
              </div>
            </div>
            
            {/* 第二行：服务器信息 */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground min-w-0">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Server className="h-3.5 w-3.5 flex-shrink-0" />
                <span 
                  className="font-mono font-medium truncate max-w-[120px] sm:max-w-[160px] md:max-w-[200px] lg:max-w-[240px] cursor-default" 
                  title={proxy.server}
                >
                  {proxy.server}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Network className="h-3.5 w-3.5" />
                <span className="font-medium">{proxy.port}</span>
              </div>
            </div>
            
            {/* 第三行：传输协议和安全信息 */}
            <div className="flex items-center gap-2 flex-wrap">
              {proxy.network && (
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  <Network className="h-3 w-3 mr-1" />
                  {String(proxy.network)}
                </Badge>
              )}
              {proxy.tls && (
                <Badge variant="outline" className="text-xs border-green-200 text-green-700 dark:border-green-800 dark:text-green-300 flex-shrink-0">
                  <Shield className="h-3 w-3 mr-1" />
                  TLS
                </Badge>
              )}
              {proxy.security && proxy.security !== "tls" && (
                <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300 flex-shrink-0">
                  <Shield className="h-3 w-3 mr-1" />
                  {String(proxy.security).toUpperCase()}
                </Badge>
              )}
              {proxy.flow && (
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  <Network className="h-3 w-3 mr-1" />
                  {String(proxy.flow)}
                </Badge>
              )}
            </div>
          </div>
          
          {/* 右侧操作按钮 */}
          <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
            {/* 排序按钮 */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onMove(proxy.id, "up")}
                disabled={index === 0}
                title="上移"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onMove(proxy.id, "down")}
                disabled={index === totalCount - 1}
                title="下移"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            {/* 编辑和删除按钮 */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20"
                onClick={() => onEdit(proxy)}
                title="编辑"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                    title="删除"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>删除节点</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要删除节点 &quot;{proxy.name}&quot; 吗？此操作不可撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(proxy.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
