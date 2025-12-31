import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { LoadingIndicator } from "./LoadingIndicator";
import { ChatConfig, ChatMode } from "./ChatConfig";
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

interface ChatAreaProps {
  selectedMCPs: MCPSelection[];
  selectedDoc: DocumentSelection | null;
}

export const ChatArea = ({ selectedMCPs, selectedDoc }: ChatAreaProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content: "欢迎使用智能对话平台！请配置对话模式开始对话。",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 对话配置
  const [chatConfig, setChatConfig] = useState<{
    mode: ChatMode;
    modelId: string;
    documentCollectionId?: string;
  }>({
    mode: "llm",
    modelId: "model-1",
    documentCollectionId: undefined
  });

  // 可用模型（从模型管理获取）
  const availableModels = [
    { id: "model-1", name: "GPT-4 主模型", provider: "OpenAI" },
    { id: "model-2", name: "GPT-3.5 Turbo", provider: "OpenAI" }
  ];

  // 可用文档集（从文档管理获取）
  const availableDocumentCollections = [
    { id: "tech-docs-cn", name: "技术文档-中文", type: "技术文档" },
    { id: "business-docs-cn", name: "业务文档-中文", type: "业务文档" },
    { id: "legal-docs-eu", name: "法律文档-欧洲", type: "法律文档" },
    { id: "knowledge-base", name: "知识库", type: "知识库" }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (input: string) => {
    if (chatConfig.mode === "llm") {
      // LLM 模式：直接使用模型
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        timestamp: new Date(),
        chatMode: chatConfig.mode,
        modelInfo: availableModels.find(m => m.id === chatConfig.modelId)
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      setTimeout(() => {
        const model = availableModels.find(m => m.id === chatConfig.modelId);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `这是来自 ${model?.name} 的回复。\n\n您的消息已通过 LLM 模式处理。\n\n您的问题是：${input}\n\n在实际应用中，这里会返回真实的对话内容。`,
          timestamp: new Date(),
          chatMode: chatConfig.mode,
          modelInfo: model
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1500);
    } else if (chatConfig.mode === "knowledge") {
      // 知识库模式：基于文档集检索
      if (!chatConfig.documentCollectionId) {
        toast.error("请先选择文档集");
        return;
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        timestamp: new Date(),
        chatMode: chatConfig.mode,
        modelInfo: availableModels.find(m => m.id === chatConfig.modelId),
        documentCollectionInfo: availableDocumentCollections.find(c => c.id === chatConfig.documentCollectionId)
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      setTimeout(() => {
        const model = availableModels.find(m => m.id === chatConfig.modelId);
        const collection = availableDocumentCollections.find(c => c.id === chatConfig.documentCollectionId);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `这是基于文档集 "${collection?.name}" 的增强回复。\n\n检索到的相关文档已用于生成答案。\n\n您的问题是：${input}\n\n在实际应用中，这里会先从文档集中检索相关内容，然后由 ${model?.name} 生成最终答案。`,
          timestamp: new Date(),
          chatMode: chatConfig.mode,
          modelInfo: model,
          documentCollectionInfo: collection
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages Area */}
      <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && <LoadingIndicator />}
        </div>
      </ScrollArea>

      {/* Chat Config Info Bar */}
      <div className="border-t bg-slate-50 dark:bg-slate-800/50 px-6 py-3 flex items-center space-x-2 flex-wrap gap-y-2">
        {chatConfig.mode === "llm" && (
          <>
            <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              LLM 模式
            </Badge>
            {availableModels.find(m => m.id === chatConfig.modelId) && (
              <Badge variant="secondary" className="text-xs">
                {availableModels.find(m => m.id === chatConfig.modelId)?.name}
              </Badge>
            )}
          </>
        )}
        {chatConfig.mode === "knowledge" && (
          <>
            <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              知识库模式
            </Badge>
            {availableDocumentCollections.find(c => c.id === chatConfig.documentCollectionId) && (
              <Badge variant="secondary" className="text-xs">
                {availableDocumentCollections.find(c => c.id === chatConfig.documentCollectionId)?.name}
              </Badge>
            )}
            {availableModels.find(m => m.id === chatConfig.modelId) && (
              <Badge variant="outline" className="text-xs">
                {availableModels.find(m => m.id === chatConfig.modelId)?.name}
              </Badge>
            )}
          </>
        )}
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

      {/* Chat Input */}
      <ChatInput disabled={isLoading} onSend={handleSend} />
    </div>
  );
};

export { ChatConfig };