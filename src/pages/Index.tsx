import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText, Server, Lock, Cpu } from "lucide-react";
import { MCPSelection } from "@/components/MCPSelector";
import { DocumentSelection } from "@/components/DocumentSelector";
import { ChatArea } from "@/components/ChatArea";
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
      const providerName = selection.provider === "pinecone" ? "Pinecone" : 
                           selection.provider === "milvus" ? "Milvus" : selection.provider;
      toast({
        title: "向量数据库已选择",
        description: `${providerName} - ${selection.complexity}`,
      });
    }
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
            selectedDoc={selectedDoc}
            onMCPSelect={handleMCPSelect}
            onDocSelect={handleDocSelect}
          />
        </TabsContent>

        {/* MCP Management Tab */}
        <TabsContent value="mcp">
          <MCPManagement />
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