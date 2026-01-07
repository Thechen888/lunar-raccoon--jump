import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Trash2, Globe, Code } from "lucide-react";
import { ToolList } from "./ToolList";
import { PromptList } from "./PromptList";

export interface Tool {
  id: string;
  name: string;
  description: string;
  method: string;
  path: string;
  enabled: boolean;
  details: string;
}

export interface Prompt {
  id: string;
  name: string;
  content: string;
}

export interface MCPService {
  id: string;
  name: string;
  description: string;
  url: string;
  headers?: string;
  status: "active" | "inactive";
  createdAt: string;
  tools?: Tool[];
  prompts?: Prompt[];
}

interface MCPDetailDialogProps {
  service: MCPService;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (service: MCPService) => void;
  onDelete: (id: string) => void;
  onToggleTool: (toolId: string) => void;
}

export const MCPDetailDialog = ({ 
  service, 
  open, 
  onOpenChange, 
  onEdit, 
  onDelete,
  onToggleTool 
}: MCPDetailDialogProps) => {
  const [activeTab, setActiveTab] = useState("info");

  const handleToggleTool = (toolId: string) => {
    onToggleTool(toolId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{service.name}</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(service)}
              >
                <Settings className="h-4 w-4 mr-1" />
                编辑
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDelete(service.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="flex-shrink-0">
            <TabsTrigger value="info">基本信息</TabsTrigger>
            <TabsTrigger value="tools">工具</TabsTrigger>
            <TabsTrigger value="prompts">提示</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-y-auto mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">状态</label>
                  <div className="mt-1">
                    <Badge variant={service.status === "active" ? "default" : "secondary"}>
                      {service.status === "active" ? "启用" : "禁用"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">创建时间</label>
                  <div className="mt-1">{service.createdAt}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">描述</label>
                <p className="mt-1 text-sm">{service.description || "无描述"}</p>
              </div>

              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground">URL</label>
                  <code className="block mt-1 text-sm bg-muted px-3 py-2 rounded">
                    {service.url}
                  </code>
                </div>
              </div>

              {service.headers && (
                <div className="flex items-start space-x-2">
                  <Code className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground">请求头</label>
                    <code className="block mt-1 text-sm bg-muted px-3 py-2 rounded whitespace-pre-wrap">
                      {service.headers}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tools" className="flex-1 flex flex-col overflow-hidden mt-4">
            <div className="space-y-2 mb-4 flex-shrink-0">
              <p className="text-sm text-muted-foreground">
                工具列表自动从服务端拉取，无法手动添加
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <ToolList 
                tools={service.tools || []} 
                onToggleTool={handleToggleTool}
              />
            </div>
          </TabsContent>

          <TabsContent value="prompts" className="flex-1 overflow-y-auto mt-4">
            <div className="space-y-2 mb-4">
              <p className="text-sm text-muted-foreground">
                提示内容自动从服务端拉取，无法手动添加
              </p>
            </div>
            <PromptList prompts={service.prompts || []} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};