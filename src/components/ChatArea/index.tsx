import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { LoadingIndicator } from "./LoadingIndicator";
import { toast } from "sonner";

import { MCPSelection } from "../MCPSelector";
import { DocumentSelection } from "../DocumentSelector";

// MCP 服务数据（从 MCP 管理中读取）
const mcpProviders = [
  {
    id: "pangu",
    name: "PANGU",
    description: "华为盘古大模型",
    regions: [
      { id: "china", name: "中国" },
      { id: "europe", name: "欧洲" },
      { id: "usa", name: "美国" }
    ],
    complexityLevels: [
      { id: "simple", name: "精简", description: "基础功能，快速响应" },
      { id: "medium", name: "一般", description: "标准功能，平衡性能" },
      { id: "complex", name: "复杂", description: "高级功能，深度分析" },
      { id: "full", name: "完全", description: "完整功能，最高精度" }
    ]
  },
  {
    id: "ecohub",
    name: "EcoHub",
    description: "EcoHub 生态系统",
    regions: [
      { id: "main", name: "主节点" }
    ],
    complexityLevels: [
      { id: "simple", name: "精简", description: "基础功能" },
      { id: "medium", name: "一般", description: "标准功能" },
      { id: "complex", name: "复杂", description: "高级功能" },
      { id: "full", name: "完全", description: "完整功能" }
    ]
  }
];

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  mcpInfo?: MCPSelection[];
  docInfo?: {
    vectorDb: string;
    complexity: string;
    dbAddress: string;
  };
}

interface ChatAreaProps {
  selectedMCPs: MCPSelection[];
  selectedDoc: DocumentSelection | null;
}

export const ChatArea = ({ selectedMCPs, selectedDoc }: ChatAreaProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content: "欢迎使用智能对话平台！请选择MCP和向量数据库开始对话。",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (input: string) => {
    if (selectedMCPs.length === 0) {
      toast.error("请至少选择一个MCP配置");
      return;
    }

    if (!selectedDoc) {
      toast.error("请至少选择一个向量数据库");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      const mcpSummary = selectedMCPs.map(m => {
        const provider = mcpProviders.find(p => p.id === m.provider);
        const providerName = provider?.name || m.provider;
        const regionNames = m.regions.map(r => provider?.regions.find(reg => reg.id === r)?.name || r).join(", ");
        const complexityName = provider?.complexityLevels.find(c => c.id === m.complexity)?.name || m.complexity;
        return `${providerName} (${regionNames} - ${complexityName})`;
      }).join(" | ");
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `这是来自多个MCP的模拟回复。\n\n已选择MCP: ${mcpSummary}\n\n您的消息已结合 ${selectedDoc.vectorDb} - ${selectedDoc.dbAddress} - ${selectedDoc.complexity} 进行处理。\n\n您的问题是：${input}\n\n在实际应用中，这里会返回真实的对话内容。`,
        timestamp: new Date(),
        mcpInfo: selectedMCPs,
        docInfo: {
          vectorDb: selectedDoc.vectorDb,
          complexity: selectedDoc.complexity,
          dbAddress: selectedDoc.dbAddress
        }
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>对话区域</span>
          </CardTitle>
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {selectedMCPs.map((mcp) => {
              const provider = mcpProviders.find(p => p.id === mcp.provider);
              const providerName = provider?.name || mcp.provider;
              const regionNames = mcp.regions.map(r => provider?.regions.find(reg => reg.id === r)?.name || r).join(", ");
              const complexityName = provider?.complexityLevels.find(c => c.id === mcp.complexity)?.name || mcp.complexity;
              return (
                <Badge key={mcp.provider} variant="outline" className="text-xs">
                  {providerName} / {regionNames} / {complexityName}
                </Badge>
              );
            })}
            {selectedDoc && (
              <Badge variant="secondary" className="text-xs">
                {selectedDoc.vectorDb} / {selectedDoc.dbAddress} / {selectedDoc.complexity}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <LoadingIndicator />}
          </div>
        </ScrollArea>
        <ChatInput disabled={isLoading} onSend={handleSend} />
      </CardContent>
    </Card>
  );
};