import { User, Bot, MessageSquare } from "lucide-react";
import { MCPSelection } from "../MCPSelector";

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
  documents?: string[];
  docInfo?: {
    vectorDb: string;
    complexity: string;
    dbAddress: string;
  };
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const getProviderName = (providerId: string) => {
    return mcpProviders.find(p => p.id === providerId)?.name || providerId;
  };

  const getRegionName = (providerId: string, regionId: string) => {
    return mcpProviders.find(p => p.id === providerId)?.regions.find(r => r.id === regionId)?.name || regionId;
  };

  const getComplexityName = (providerId: string, complexityId: string) => {
    return mcpProviders.find(p => p.id === providerId)?.complexityLevels.find(c => c.id === complexityId)?.name || complexityId;
  };

  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex items-start space-x-2 max-w-[80%] ${
          message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
        }`}
      >
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : message.role === "assistant"
              ? "bg-secondary text-secondary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {message.role === "user" ? (
            <User className="h-4 w-4" />
          ) : message.role === "assistant" ? (
            <Bot className="h-4 w-4" />
          ) : (
            <MessageSquare className="h-4 w-4" />
          )}
        </div>
        <div
          className={`rounded-lg p-3 ${
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : message.role === "assistant"
              ? "bg-muted"
              : "bg-muted/50 border"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          {(message.mcpInfo && message.mcpInfo.length > 0) && (
            <div className="mt-2 pt-2 border-t border-current/20">
              <p className="text-xs opacity-75">
                MCP: {message.mcpInfo.map(m => `${getProviderName(m.provider)} / ${m.regions.map(r => getRegionName(m.provider, r)).join(", ")} / ${getComplexityName(m.provider, m.complexity)}`).join(" | ")}
              </p>
            </div>
          )}
          {message.docInfo && (
            <div className="mt-2 pt-2 border-t border-current/20">
              <p className="text-xs opacity-75">
                向量库: {message.docInfo.vectorDb} / {message.docInfo.dbAddress} / {message.docInfo.complexity}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};