import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageSquare, Settings2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { LoadingIndicator } from "./LoadingIndicator";
import { ChatConfig } from "./ChatConfig";
import { MCPSelector, MCPSelection } from "../MCPSelector";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  mcpInfo?: string[];
  modelInfo?: {
    modelId: string;
    modelName: string;
    provider: string;
  };
  documentCollectionInfo?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
}

interface DocumentCollection {
  id: string;
  name: string;
  type: string;
}

interface MCPProvider {
  id: string;
  name: string;
  description: string;
  regions?: Array<{ id: string; name: string }>;
  complexityLevels?: Array<{ id: string; name: string; description: string }>;
}

interface ChatAreaProps {
  selectedMCPs: MCPSelection[];
  onMCPSelect: (selection: MCPSelection[]) => void;
  mcpProviders: MCPProvider[];
}

const defaultConfig = {
  modelId: "model-1",
  documentCollectionIds: undefined
};

export const ChatArea = ({ selectedMCPs, onMCPSelect, mcpProviders }: ChatAreaProps) => {
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

  // 从 localStorage 加载配置，如果没有则使用默认配置
  const [chatConfig, setChatConfig] = useState<{
    modelId: string;
    documentCollectionIds?: string[];
  }>(() => {
    try {
      const saved = localStorage.getItem('chatConfig');
      return saved ? JSON.parse(saved) : defaultConfig;
    } catch {
      return defaultConfig;
    }
  });

  // 当配置变化时保存到 localStorage
  useEffect(() => {
    localStorage.setItem('chatConfig', JSON.stringify(chatConfig));
  }, [chatConfig]);

  // 清空配置
  const handleClearConfig = () => {
    setChatConfig(defaultConfig);
    toast.success("配置已清空");
  };

  // 可用模型（从模型管理获取）
  const availableModels: ModelConfig[] = [
    { id: "model-1", name: "GPT-4 主模型", provider: "OpenAI" },
    { id: "model-2", name: "GPT-3.5 Turbo", provider: "OpenAI" }
  ];

  // 可用文档集（从文档管理获取）
  const availableDocumentCollections: DocumentCollection[] = [
    { id: "tech-docs-cn", name: "技术文档-中文", type: "技术文档" },
    { id: "business-docs-cn", name: "业务文档-中文", type: "业务文档" },
    { id: "legal-docs-eu", name: "法律文档-欧洲", type: "法律文档" },
    { id: "knowledge-base", name: "知识库", type: "知识库" }
  ];

  const handleSend = async (input: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      modelInfo: availableModels.find(m => m.id === chatConfig.modelId),
      mcpInfo: selectedMCPs.map(s => `${s.providerId}-${s.regionIds.join('+')}-${s.complexityId}`)
    };

    // 如果选择了文档集，添加文档集信息
    if (chatConfig.documentCollectionIds && chatConfig.documentCollectionIds.length > 0) {
      const collections = availableDocumentCollections.filter(c => chatConfig.documentCollectionIds?.includes(c.id));
      userMessage.documentCollectionInfo = collections;
    }

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      const model = availableModels.find(m => m.id === chatConfig.modelId);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `这是来自 ${model?.name} 的回复。\n\n您的问题是：${input}`,
        timestamp: new Date(),
        modelInfo: model,
        mcpInfo: selectedMCPs.map(s => `${s.providerId}-${s.regionIds.join('+')}-${s.complexityId}`)
      };

      // 如果选择了文档集，添加文档集信息到回复
      if (chatConfig.documentCollectionIds && chatConfig.documentCollectionIds.length > 0) {
        const collections = availableDocumentCollections.filter(c => chatConfig.documentCollectionIds?.includes(c.id));
        assistantMessage.documentCollectionInfo = collections;
        assistantMessage.content += `\n\n检索到的相关文档已用于生成答案。`;
      }

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const getProviderName = (providerId: string) => {
    return mcpProviders.find(p => p.id === providerId)?.name || providerId;
  };

  // 获取选中的文档集
  const selectedCollections = chatConfig.documentCollectionIds 
    ? availableDocumentCollections.filter(c => chatConfig.documentCollectionIds.includes(c.id))
    : [];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      {/* 左侧配置面板 - 使用折叠面板 */}
      <div className="lg:w-96 flex-shrink-0 space-y-4">
        <Card className="h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
          <CardHeader className="flex-shrink-0 pb-3">
            <CardTitle className="flex items-center text-base">
              <Settings2 className="h-4 w-4 mr-2" />
              配置面板
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-4 pb-4">
              <Accordion type="multiple" defaultValue={["chat-config", "mcp-config"]} className="space-y-3">
                {/* 对话配置 */}
                <AccordionItem value="chat-config" className="border rounded-lg">
                  <AccordionTrigger className="py-3 px-4 hover:no-underline">
                    <span className="text-sm font-medium">对话配置</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 px-4">
                    <ChatConfig
                      models={availableModels}
                      documentCollections={availableDocumentCollections}
                      onConfigChange={setChatConfig}
                      currentConfig={chatConfig}
                      onClear={handleClearConfig}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* MCP 选择 */}
                <AccordionItem value="mcp-config" className="border rounded-lg">
                  <AccordionTrigger className="py-3 px-4 hover:no-underline">
                    <span className="text-sm font-medium">MCP 选择</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 px-4">
                    <MCPSelector
                      onSelect={onMCPSelect}
                      selectedMCPs={selectedMCPs}
                      providers={mcpProviders}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* 右侧对话框 */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-base">
              <MessageSquare className="h-4 w-4" />
              <span>对话区域</span>
            </CardTitle>
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              {availableModels.find(m => m.id === chatConfig.modelId) && (
                <Badge variant="secondary" className="text-xs">
                  {availableModels.find(m => m.id === chatConfig.modelId)?.name}
                </Badge>
              )}
              {selectedCollections.map((collection) => (
                <Badge key={collection.id} variant="outline" className="text-xs">
                  {collection.name}
                </Badge>
              ))}
              {selectedMCPs.map((selection) => {
                const provider = mcpProviders.find(p => p.id === selection.providerId);
                const selectedRegions = provider?.regions?.filter(r => selection.regionIds.includes(r.id)) || [];
                const selectedComplexity = provider?.complexityLevels?.find(c => c.id === selection.complexityId);
                return (
                  <Badge key={selection.providerId} variant="outline" className="text-xs">
                    {provider?.name} {selectedRegions.map(r => r.name).join('+')} {selectedComplexity?.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble 
                  key={message.id} 
                  message={message}
                  mcpProviders={mcpProviders}
                />
              ))}
              {isLoading && <LoadingIndicator />}
            </div>
          </ScrollArea>
          <ChatInput disabled={isLoading} onSend={handleSend} />
        </CardContent>
      </Card>
    </div>
  );
};