import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import { MCPTypeCard } from "./MCPTypeCard";
import { MCPEditor } from "./MCPEditor";
import { MCPCreateForm, MCPCreateData } from "./MCPCreateForm";
import { MCPImportForm, MCPImportData } from "./MCPImportForm";
import { MCPBatchEdit } from "./MCPBatchEdit";
import { GlobalSettings } from "./GlobalSettings";
import { MCPDetailDialog, MCPService, Tool } from "./MCPDetailDialog";

export interface MCPService {
  id: string;
  name: string;
  description: string;
  url: string;
  headers?: string;
  status: "active" | "inactive";
  createdAt: string;
  tools?: Tool[];
  prompts?: Array<{
    id: string;
    name: string;
    content: string;
  }>;
}

interface MCPManagementProps {
  onServicesChange: (services: MCPService[]) => void;
  services: MCPService[];
}

export const MCPManagement = ({ onServicesChange, services }: MCPManagementProps) => {
  const [activeTab, setActiveTab] = useState("services");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addMode, setAddMode] = useState<"create" | "import">("create");
  const [editingService, setEditingService] = useState<MCPService | null>(null);
  const [detailService, setDetailService] = useState<MCPService | null>(null);
  const [batchEditOpen, setBatchEditOpen] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({
    autoReconnect: true,
    loadBalancing: true,
    logging: false
  });

  const handleCreateService = (data: MCPCreateData) => {
    const newService: MCPService = {
      id: `mcp-${Date.now()}`,
      name: data.name,
      description: data.description,
      url: data.url,
      headers: data.headers || undefined,
      status: "active",
      createdAt: new Date().toISOString().split('T')[0],
      tools: [],
      prompts: []
    };
    const updatedServices = [...services, newService];
    onServicesChange(updatedServices);
    setAddDialogOpen(false);
    toast.success(`MCP服务 "${data.name}" 已创建`);
  };

  const handleImportServices = (data: MCPImportData) => {
    const newServices = data.services.map((service) => ({
      id: `mcp-${Date.now()}-${Math.random()}`,
      name: service.name,
      description: service.description,
      url: service.url,
      headers: service.headers,
      status: "active" as const,
      createdAt: new Date().toISOString().split('T')[0],
      tools: [],
      prompts: []
    }));
    const updatedServices = [...services, ...newServices];
    onServicesChange(updatedServices);
    setAddDialogOpen(false);
    toast.success(`成功导入 ${newServices.length} 个MCP服务`);
  };

  const handleUpdateService = (updatedService: Partial<MCPService> & { id: string }) => {
    const updatedServices = services.map(s => s.id === updatedService.id ? { ...s, ...updatedService } : s);
    onServicesChange(updatedServices);
    setEditingService(null);
    toast.success("MCP服务已更新");
  };

  const handleDeleteService = (id: string) => {
    const updatedServices = services.filter(s => s.id !== id);
    onServicesChange(updatedServices);
    setDetailService(null);
    toast.success("MCP服务已删除");
  };

  const handleToggleServiceStatus = (id: string) => {
    const updatedServices = services.map(s => s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s);
    onServicesChange(updatedServices);
    toast.success("服务状态已更新");
  };

  const handleToggleTool = (toolId: string) => {
    if (!detailService) return;
    
    const updatedServices = services.map(service => {
      if (service.id === detailService.id && service.tools) {
        return {
          ...service,
          tools: service.tools.map(tool =>
            tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
          )
        };
      }
      return service;
    });

    onServicesChange(updatedServices);

    // 更新 detailService 状态以反映更改
    setDetailService(prev => {
      if (!prev || !prev.tools) return prev;
      return {
        ...prev,
        tools: prev.tools.map(tool =>
          tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
        )
      };
    });
  };

  const handleBatchUpdateServices = (updatedServices: MCPService[]) => {
    onServicesChange(updatedServices);
    toast.success("批量更新成功");
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="services">MCP服务</TabsTrigger>
          <TabsTrigger value="settings">全局设置</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5" />
                    <span>MCP 服务管理</span>
                  </CardTitle>
                  <CardDescription>管理MCP服务的配置</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={() => setBatchEditOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    编辑
                  </Button>
                  <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <Button onClick={() => {
                      setAddMode("create");
                      setAddDialogOpen(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加服务
                    </Button>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>添加MCP服务</DialogTitle>
                        <DialogDescription>选择创建方式</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Card 
                            className={`cursor-pointer transition-all ${addMode === "create" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"}`}
                            onClick={() => setAddMode("create")}
                          >
                            <CardContent className="p-6 text-center">
                              <div className="text-2xl mb-2">✏️</div>
                              <div className="font-medium mb-1">创建服务</div>
                              <div className="text-xs text-muted-foreground">手动配置MCP服务</div>
                            </CardContent>
                          </Card>
                          <Card 
                            className={`cursor-pointer transition-all ${addMode === "import" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"}`}
                            onClick={() => setAddMode("import")}
                          >
                            <CardContent className="p-6 text-center">
                              <div className="text-2xl mb-2">📥</div>
                              <div className="font-medium mb-1">导入服务</div>
                              <div className="text-xs text-muted-foreground">从JSON导入</div>
                            </CardContent>
                          </Card>
                        </div>

                        {addMode === "create" ? (
                          <MCPCreateForm onSave={handleCreateService} onCancel={() => setAddDialogOpen(false)} />
                        ) : (
                          <MCPImportForm onImport={handleImportServices} onCancel={() => setAddDialogOpen(false)} />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <MCPTypeCard
                    key={service.id}
                    service={service}
                    onEdit={setEditingService}
                    onDetail={setDetailService}
                    onDelete={handleDeleteService}
                    onToggleStatus={handleToggleServiceStatus}
                  />
                ))}
              </div>
              {services.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>暂无MCP服务，点击"添加服务"开始配置</p>
                </div>
              )}
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

      {/* 批量编辑对话框 */}
      {batchEditOpen && (
        <Dialog open={true} onOpenChange={setBatchEditOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <MCPBatchEdit
              services={services}
              onUpdateServices={handleBatchUpdateServices}
              onClose={() => setBatchEditOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* 编辑对话框 */}
      {editingService && (
        <Dialog open={true} onOpenChange={() => setEditingService(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>编辑 MCP 服务 - {editingService.name}</DialogTitle>
            </DialogHeader>
            <MCPEditor
              service={editingService}
              onSave={handleUpdateService}
              onCancel={() => setEditingService(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* 详情对话框 */}
      {detailService && (
        <MCPDetailDialog
          service={detailService}
          open={true}
          onOpenChange={() => setDetailService(null)}
          onEdit={setEditingService}
          onDelete={handleDeleteService}
          onToggleTool={handleToggleTool}
        />
      )}
    </div>
  );
};