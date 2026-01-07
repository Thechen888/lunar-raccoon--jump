import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Plus } from "lucide-react";
import { toast } from "sonner";
import { MCPTypeCard } from "./MCPTypeCard";
import { MCPEditor } from "./MCPEditor";
import { MCPCreateForm, MCPCreateData } from "./MCPCreateForm";
import { MCPImportForm, MCPImportData } from "./MCPImportForm";
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

export const MCPManagement = () => {
  const [services, setServices] = useState<MCPService[]>([
    {
      id: "mcp-1",
      name: "PANGU",
      description: "华为盘古大模型服务",
      url: "https://api.pangu.example.com/v1",
      headers: '{"Authorization": "Bearer pangu-token"}',
      status: "active",
      createdAt: "2024-01-10",
      tools: [
        {
          id: "tool-1",
          name: "代码生成",
          description: "根据需求生成高质量代码",
          enabled: true,
          details: "支持多种编程语言，包括Python、Java、JavaScript、C++等。可以根据自然语言描述生成代码片段、完整函数或类。"
        },
        {
          id: "tool-2",
          name: "文本分析",
          description: "分析文本内容，提取关键信息",
          enabled: true,
          details: "支持文本分类、情感分析、实体识别、关键词提取等功能。适用于新闻、评论、社交媒体等多种文本场景。"
        },
        {
          id: "tool-3",
          name: "图像识别",
          description: "识别图像中的物体和场景",
          enabled: false,
          details: "支持物体检测、场景分类、人脸识别等功能。可应用于安防监控、智能零售、医疗影像等领域。"
        },
        {
          id: "tool-4",
          name: "语音合成",
          description: "将文本转换为自然语音",
          enabled: true,
          details: "支持多种语言和声音风格，可以调整语速、音调等参数。适用于语音助手、有声读物、导航系统等场景。"
        }
      ],
      prompts: [
        {
          id: "prompt-1",
          name: "系统提示词",
          content: "你是一个专业的AI助手，擅长回答各类问题。请确保回答准确、简洁、有帮助。"
        },
        {
          id: "prompt-2",
          name: "代码审查提示词",
          content: "请审查以下代码，指出潜在的问题、性能瓶颈和改进建议。代码内容如下：\n\n{code}"
        }
      ]
    },
    {
      id: "mcp-2",
      name: "EcoHub",
      description: "EcoHub 生态系统服务",
      url: "https://api.ecohub.example.com/v1",
      headers: '{"Authorization": "Bearer ecohub-token", "Content-Type": "application/json"}',
      status: "active",
      createdAt: "2024-01-11",
      tools: [
        {
          id: "tool-5",
          name: "数据分析",
          description: "分析数据集，生成洞察报告",
          enabled: true,
          details: "支持数据清洗、统计分析、可视化等功能。可以处理结构化数据和非结构化数据。"
        },
        {
          id: "tool-6",
          name: "数据预测",
          description: "基于历史数据预测未来趋势",
          enabled: false,
          details: "使用机器学习算法进行时间序列预测、分类预测等。支持多种预测模型。"
        }
      ],
      prompts: [
        {
          id: "prompt-3",
          name: "数据分析提示词",
          content: "请分析以下数据，提供关键洞察和建议。数据如下：\n\n{data}"
        }
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState("services");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addMode, setAddMode] = useState<"create" | "import">("create");
  const [editingService, setEditingService] = useState<MCPService | null>(null);
  const [detailService, setDetailService] = useState<MCPService | null>(null);
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
    setServices([...services, newService]);
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
    setServices([...services, ...newServices]);
    setAddDialogOpen(false);
    toast.success(`成功导入 ${newServices.length} 个MCP服务`);
  };

  const handleUpdateService = (updatedService: Partial<MCPService> & { id: string }) => {
    setServices(services.map(s => s.id === updatedService.id ? { ...s, ...updatedService } : s));
    setEditingService(null);
    toast.success("MCP服务已更新");
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
    setDetailService(null);
    toast.success("MCP服务已删除");
  };

  const handleToggleTool = (serviceId: string, toolId: string) => {
    setServices(services.map(service => {
      if (service.id === serviceId && service.tools) {
        return {
          ...service,
          tools: service.tools.map(tool =>
            tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
          )
        };
      }
      return service;
    }));
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
                            <div className="text-xs text-muted-foreground">从JSON文件导入</div>
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