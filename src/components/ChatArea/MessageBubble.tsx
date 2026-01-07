import { User, Bot, MessageSquare, Brain, Database, FileText } from "lucide-react";
import { ChatMode } from "./ChatConfig";

interface MCPProvider {
  id: string;
  name: string;
  description: string;
  regions: Array<{ id: string; name: string }>;
  complexityLevels: Array<{ id: string; name: string; description: string }>;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  mcpInfo?: any[];
  documents?: string[];
  docInfo?: {
    vectorDb: string;
    complexity: string;
    dbAddress: string;
  };
  chatMode?: ChatMode;
  modelInfo?: {
    modelId: string;
    modelName: string;
    provider: string;
  };
  documentCollectionInfo?: {
    id: string;
    name: string;
    type: string;
  };
}

interface MessageBubbleProps {
  message: Message;
  mcpProviders: MCPProvider[];
}

export const MessageBubble = ({ message, mcpProviders }: MessageBubbleProps) => {
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
          
          {/* 对话模式信息 */}
          {message.chatMode && (
            <div className="mt-2 pt-2 border-t border-current/20">
              <p className="text-xs opacity-75 flex items-center space-x-1">
                {message.chatMode === "llm" ? (
                  <Brain className="h-3 w-3" />
                ) : (
                  <Database className="h-3 w-3" />
                )}
                <span>
                  {message.chatMode === "llm" ? "LLM模式" : "知识库模式"}
                  {message.modelInfo && ` - ${message.modelInfo.name}`}
                </span>
              </p>
            </div>
          )}

          {/* 文档集信息 */}
          {message.documentCollectionInfo && (
            <div className="mt-2 pt-2 border-t border-current/20">
              <p className="text-xs opacity-75 flex items-center space-x-1">
                <FileText className="h-3 w-3" />
                <span>文档集: {message.documentCollectionInfo.name} ({message.documentCollectionInfo.type})</span>
              </p>
            </div>
          )}

          {/* MCP 信息 */}
          {message.mcpInfo && message.mcpInfo.length > 0 && (
            <div className="mt-2 pt-2 border-t border-current/20">
              <p className="text-xs opacity-75">
                MCP: {message.mcpInfo.map(m => `${getProviderName(m.provider)} / ${m.regions.map(r => getRegionName(m.provider, r)).join(", ")} / ${getComplexityName(m.provider, m.complexity)}`).join(" | ")}
              </p>
            </div>
          )}

          {/* 向量库信息 */}
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