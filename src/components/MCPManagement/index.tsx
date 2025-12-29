import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { GlobalSettings } from "./GlobalSettings";
import { MCPTypeCard } from "./MCPTypeCard";
import { MCPEditor } from "./MCPEditor";

interface Region {
  id: string;
  name: string;
}

interface ComplexityLevel {
  id: string;
  name: string;
  description: string;
}

interface MCPType {
  id: string;
  name: string;
  description: string;
  regions: Region[];
  complexityLevels: ComplexityLevel[];
}

export const MCPManagement = () => {
  const [mcpTypes, setMcpTypes] = useState<MCPType[]>([
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
  ]);

  const [activeTab, setActiveTab] = useState("types");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<MCPType | null>(null);
  const [globalSettings, setGlobalSettings] = useState({
    autoReconnect: true,
    loadBalancing: true,
    logging: false
  });

  const handleAddType = () => {
    const newType: MCPType = {
      id: `mcp-${Date.now()}`,
      name: "新MCP服务",
      description: "",
      regions: [],
      complexityLevels: []
    };
    setMcpTypes([...mcpTypes, newType]);
    setIsAddDialogOpen(false);
    toast.success("MCP服务已添加");
  };

  const handleUpdateType = (updatedType: Partial<MCPType> & { id: string }) => {
    setMcpTypes(mcpTypes.map(t => t.id === updatedType.id ? { ...t, ...updatedType } : t));
    setEditingType(null);
    toast.success("MCP服务已更新");
  };

  const handleDeleteType = (id: string) => {
    setMcpTypes(mcpTypes.filter(t => t.id !== id));
    toast.success("MCP服务已删除");
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="types">MCP服务</TabsTrigger>
          <TabsTrigger value="settings">全局设置</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5" />
                    <span>MCP 服务管理</span>
                  </CardTitle>
                  <CardDescription>管理MCP服务的名称、区域和复杂度等级</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      添加服务
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>添加新MCP服务</DialogTitle>
                      <DialogDescription>创建一个新的MCP服务</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>服务名称</Label>
                        <Input placeholder="例如：Claude" />
                      </div>
                      <div>
                        <Label>描述</Label>
                        <Textarea placeholder="描述这个MCP服务的用途" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleAddType}>添加</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mcpTypes.map((mcpType) => (
                  <MCPTypeCard
                    key={mcpType.id}
                    mcpType={mcpType}
                    onEdit={setEditingType}
                    onDelete={handleDeleteType}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <GlobalSettings
            autoReconnect={globalSettings.autoReconnect}
            loadBalancing={globalSettings.loadBalancing}
            logging={globalSettings.logging}
            onAutoReconnectChange={(v) => setGlobalSettings({ ...globalSettings, autoReconnect: v })}
            onLoadBalancingChange={(v) => setGlobalSettings({ ...globalSettings, loadBalancing: v })}
            onLoggingChange={(v) => setGlobalSettings({ ...globalSettings, logging: v })}
          />
        </TabsContent>
      </Tabs>

      {editingType && (
        <Dialog open={true} onOpenChange={() => setEditingType(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>编辑 MCP 服务 - {editingType.name}</DialogTitle>
            </DialogHeader>
            <MCPEditor
              mcpType={editingType}
              onSave={handleUpdateType}
              onCancel={() => setEditingType(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};