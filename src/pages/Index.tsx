import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText, Server, Lock, Cpu } from "lucide-react";
import { MCPSelection } from "@/components/MCPSelector";
import { ChatArea } from "@/components/ChatArea";
import { UserPermissions } from "@/components/UserPermissions";
import { MCPManagement } from "@/components/MCPManagement";
import { DocumentManagement } from "@/components/DocumentManagement";
import { ModelManagement } from "@/components/ModelManagement";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedMCPs, setSelectedMCPs] = useState<MCPSelection[]>([]);
  const [user, setUser] = useState<{ name: string; permissions: string[] }>({
    name: "Demo User",
    permissions: ["mcp:read", "docs:read", "chat:write"]
  });

  // MCP服务数据（统一管理）
  const [mcpServices, setMcpServices] = useState([
    {
      id: "mcp-1",
      name: "Pangu-中国-精简",
      description: "华为盘古大模型服务-中国区域-精简模式",
      url: "https://api.pangu.example.com/v1",
      headers: '{"Authorization": "Bearer pangu-token"}',
      status: "active",
      createdAt: "2024-01-10",
      tools: [
        {
          id: "tool-1",
          name: "代码生成",
          description: "根据需求生成高质量代码",
          method: "POST",
          path: "/api/code/generate",
          enabled: true,
          projectId: "proj-pangu-001"
        },
        {
          id: "tool-2",
          name: "文本分析",
          description: "分析文本内容，提取关键信息",
          method: "POST",
          path: "/api/text/analyze",
          enabled: true,
          projectId: "proj-pangu-002"
        }
      ],
      prompts: [
        {
          id: "prompt-1",
          name: "系统提示词",
          content: "你是一个专业的AI助手，擅长回答各类问题。请确保回答准确、简洁、有帮助。"
        }
      ]
    },
    {
      id: "mcp-2",
      name: "hub-欧洲-复杂",
      description: "EcoHub生态系统服务-欧洲区域-复杂模式",
      url: "https://api.ecohub.example.com/v1",
      headers: '{"Authorization": "Bearer ecohub-token", "Content-Type": "application/json"}',
      status: "active",
      createdAt: "2024-01-11",
      tools: [
        {
          id: "tool-3",
          name: "数据分析",
          description: "分析数据集，生成洞察报告",
          method: "POST",
          path: "/api/data/analyze",
          enabled: true
        },
        {
          id: "tool-4",
          name: "数据预测",
          description: "基于历史数据预测未来趋势",
          method: "GET",
          path: "/api/data/predict",
          enabled: false
        }
      ],
      prompts: [
        {
          id: "prompt-2",
          name: "数据分析提示词",
          content: "请分析以下数据，提供关键洞察和建议。数据如下：\n\n{data}"
        }
      ]
    }
  ]);

  // 将MCP服务转换为MCPSelector所需的格式（包含层级信息）
  const mcpProviders = useMemo(() => {
    return [
      {
        id: "pangu",
        name: "PANGU",
        description: "华为盘古大模型服务",
        layer: 3,
        regions: [
          { id: "pangu-china", name: "中国" },
          { id: "pangu-europe", name: "欧洲" },
          { id: "pangu-usa", name: "美国" }
        ],
        complexityLevels: [
          { id: "simple", name: "精简", description: "快速响应模式" },
          { id: "normal", name: "一般", description: "标准模式" },
          { id: "complex", name: "复杂", description: "深度分析模式" },
          { id: "complete", name: "完全", description: "全能模式" }
        ]
      },
      {
        id: "hub",
        name: "HUB",
        description: "EcoHub生态系统服务",
        layer: 2,
        regions: [
          { id: "hub-china", name: "中国" },
          { id: "hub-europe", name: "欧洲" },
          { id: "hub-usa", name: "美国" }
        ],
        complexityLevels: []
      },
      {
        id: "simple",
        name: "Simple Provider",
        description: "简单服务提供商",
        layer: 1,
        regions: [],
        complexityLevels: []
      }
    ];
  }, []);

  const { toast } = useToast();

  const handleMCPSelect = (selections: MCPSelection[]) => {
    setSelectedMCPs(selections);
    if (selections.length > 0) {
      const summary = selections.map(s => {
        const provider = mcpProviders.find(p => p.id === s.providerId);
        const regions = provider?.regions?.filter(r => s.regionIds.includes(r.id)).map(r => r.name) || [];
        const complexity = provider?.complexityLevels?.find(c => c.id === s.complexityId)?.name || "";
        return `${provider?.name || s.providerId} ${regions.length > 0 ? `(${regions.join(", ")})` : ""} ${complexity ? `-${complexity}` : ""}`;
      }).join(", ");
      toast({
        title: "MCP 已选择",
        description: summary,
      });
    }
  };

  const handleServicesChange = (newServices: typeof mcpServices) => {
    setMcpServices(newServices);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">WHES Knows</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>{user.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("permissions")}>
                权限设置
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="container mx-auto px-4 py-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-[750px]">
          <TabsTrigger value="chat">对话</TabsTrigger>
          <TabsTrigger value="mcp">MCP设置</TabsTrigger>
          <TabsTrigger value="docs">文档管理</TabsTrigger>
          <TabsTrigger value="models">模型管理</TabsTrigger>
          <TabsTrigger value="permissions">权限管理</TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <ChatArea
            selectedMCPs={selectedMCPs}
            onMCPSelect={handleMCPSelect}
            mcpProviders={mcpProviders}
          />
        </TabsContent>

        {/* MCP Management Tab */}
        <TabsContent value="mcp">
          <MCPManagement 
            onServicesChange={handleServicesChange}
            services={mcpServices}
          />
        </TabsContent>

        {/* Document Management Tab */}
        <TabsContent value="docs">
          <DocumentManagement />
        </TabsContent>

        {/* Model Management Tab */}
        <TabsContent value="models">
          <ModelManagement />
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <UserPermissions currentUser={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;