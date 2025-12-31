import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, FileText, Settings, Server, Lock, Cpu, Layout, Sparkles } from "lucide-react";
import { MCPSelector } from "@/components/MCPSelector";
import { MCPSelection } from "@/components/MCPSelector";
import { DocumentSelector } from "@/components/DocumentSelector";
import { DocumentSelection } from "@/components/DocumentSelector";
import { ChatArea, ChatConfig } from "@/components/ChatArea";
import { UserPermissions } from "@/components/UserPermissions";
import { MCPManagement } from "@/components/MCPManagement";
import { DocumentManagement } from "@/components/DocumentManagement";
import { ModelManagement } from "@/components/ModelManagement";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedMCPs, setSelectedMCPs] = useState<MCPSelection[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentSelection | null>(null);
  const [user, setUser] = useState<{ name: string; permissions: string[] }>({
    name: "Demo User",
    permissions: ["mcp:read", "docs:read", "chat:write"]
  });

  const { toast } = useToast();

  const handleMCPSelect = (selections: MCPSelection[]) => {
    setSelectedMCPs(selections);
    if (selections.length > 0) {
      const summary = selections.map(s => {
        const providerName = s.provider === "pangu" ? "PANGU" : s.provider === "ecohub" ? "EcoHub" : s.provider;
        return `${providerName} (${s.regions.length}区域/${s.complexity})`;
      }).join(", ");
      toast({
        title: "MCP 已选择",
        description: summary,
      });
    }
  };

  const handleDocSelect = (selection: DocumentSelection | null) => {
    setSelectedDoc(selection);
    if (selection) {
      toast({
        title: "向量数据库已选择",
        description: `${selection.vectorDb} - ${selection.dbAddress} - ${selection.complexity}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-20"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  WHES Knows
                </h1>
                <p className="text-xs text-muted-foreground">智能对话平台</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <Lock className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab("permissions")}
                className="rounded-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                权限设置
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="container mx-auto px-6 py-8">
        <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg rounded-xl p-1">
          <TabsTrigger 
            value="chat" 
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            对话
          </TabsTrigger>
          <TabsTrigger 
            value="mcp"
            className="rounded-lg"
          >
            <Server className="h-4 w-4 mr-2" />
            MCP设置
          </TabsTrigger>
          <TabsTrigger 
            value="docs"
            className="rounded-lg"
          >
            <FileText className="h-4 w-4 mr-2" />
            文档管理
          </TabsTrigger>
          <TabsTrigger 
            value="models"
            className="rounded-lg"
          >
            <Cpu className="h-4 w-4 mr-2" />
            模型管理
          </TabsTrigger>
          <TabsTrigger 
            value="permissions"
            className="rounded-lg"
          >
            <Lock className="h-4 w-4 mr-2" />
            权限管理
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel - Configuration */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3">
                  <div className="flex items-center space-x-2 text-white">
                    <Layout className="h-5 w-5" />
                    <h2 className="font-semibold">配置面板</h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <ChatConfig
                    models={[
                      { id: "model-1", name: "GPT-4 主模型", provider: "OpenAI" },
                      { id: "model-2", name: "GPT-3.5 Turbo", provider: "OpenAI" }
                    ]}
                    documentCollections={[
                      { id: "tech-docs-cn", name: "技术文档-中文", type: "技术文档" },
                      { id: "business-docs-cn", name: "业务文档-中文", type: "业务文档" },
                      { id: "legal-docs-eu", name: "法律文档-欧洲", type: "法律文档" },
                      { id: "knowledge-base", name: "知识库", type: "知识库" }
                    ]}
                    onConfigChange={(config) => {
                      console.log("Chat config changed:", config);
                    }}
                  />
                  <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
                        <Server className="h-4 w-4 mr-2" />
                        MCP 服务选择
                      </h3>
                      <MCPSelector onSelect={handleMCPSelect} selectedMCPs={selectedMCPs} />
                    </div>
                    <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        向量数据库选择
                      </h3>
                      <DocumentSelector onSelect={handleDocSelect} selectedDoc={selectedDoc} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Panel - Chat Area */}
            <div className="lg:col-span-8">
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden h-[calc(100vh-250px)]">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-white">
                    <MessageSquare className="h-5 w-5" />
                    <h2 className="font-semibold">对话区域</h2>
                  </div>
                </div>
                <div className="h-[calc(100%-56px)]">
                  <ChatArea selectedMCPs={selectedMCPs} selectedDoc={selectedDoc} />
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* MCP Management Tab */}
        <TabsContent value="mcp" className="mt-8">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
              <CardTitle className="text-white flex items-center space-x-2">
                <Server className="h-6 w-6" />
                <span>MCP 服务管理</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                管理和配置您的 MCP 服务
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <MCPManagement />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Management Tab */}
        <TabsContent value="docs" className="mt-8">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
              <CardTitle className="text-white flex items-center space-x-2">
                <FileText className="h-6 w-6" />
                <span>文档管理</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                管理文档集、原文档和 QA 索引
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <DocumentManagement />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Management Tab */}
        <TabsContent value="models" className="mt-8">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
              <CardTitle className="text-white flex items-center space-x-2">
                <Cpu className="h-6 w-6" />
                <span>模型管理</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                管理和配置 AI 模型
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ModelManagement />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="mt-8">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
              <CardTitle className="text-white flex items-center space-x-2">
                <Lock className="h-6 w-6" />
                <span>权限管理</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                管理用户、角色和权限
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <UserPermissions currentUser={user} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;