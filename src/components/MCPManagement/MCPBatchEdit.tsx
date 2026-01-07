import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Globe, Code, Check, X } from "lucide-react";
import { toast } from "sonner";

export interface MCPService {
  id: string;
  name: string;
  description: string;
  url: string;
  headers?: string;
  status: "active" | "inactive";
  createdAt: string;
}

interface MCPBatchEditProps {
  services: MCPService[];
  onUpdateServices: (services: MCPService[]) => void;
  onClose: () => void;
}

export const MCPBatchEdit = ({ services, onUpdateServices, onClose }: MCPBatchEditProps) => {
  const [editingServices, setEditingServices] = useState<MCPService[]>(services);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<MCPService>>({});

  const handleToggleStatus = (id: string) => {
    setEditingServices(services.map(s => 
      s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s
    ));
  };

  const handleDelete = (id: string) => {
    setEditingServices(services.filter(s => s.id !== id));
    toast.success("服务已删除");
  };

  const handleStartEdit = (service: MCPService) => {
    setEditingId(service.id);
    setEditData({
      name: service.name,
      description: service.description,
      url: service.url,
      headers: service.headers
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = (id: string) => {
    if (!editData.name?.trim() || !editData.url?.trim()) {
      toast.error("名称和URL为必填项");
      return;
    }

    setEditingServices(services.map(s => 
      s.id === id ? { 
        ...s, 
        name: editData.name!.trim(),
        description: editData.description?.trim() || "",
        url: editData.url!.trim(),
        headers: editData.headers?.trim()
      } : s
    ));
    setEditingId(null);
    setEditData({});
    toast.success("服务已更新");
  };

  const handleAddNew = () => {
    const newService: MCPService = {
      id: `new-${Date.now()}`,
      name: "",
      description: "",
      url: "",
      headers: "",
      status: "active",
      createdAt: new Date().toISOString().split('T')[0]
    };
    setEditingServices([...services, newService]);
    setEditingId(newService.id);
    setEditData({ name: "", description: "", url: "", headers: "", status: "active" });
  };

  const handleSaveAll = () => {
    onUpdateServices(editingServices);
    onClose();
    toast.success("所有更改已保存");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">批量编辑MCP服务</CardTitle>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              添加服务
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">状态</TableHead>
                  <TableHead className="w-[200px]">名称</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>请求头</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editingServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <Switch
                        checked={service.status === "active"}
                        onCheckedChange={() => handleToggleStatus(service.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {editingId === service.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editData.name || ""}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            placeholder="服务名称"
                          />
                          <Textarea
                            value={editData.description || ""}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            placeholder="描述"
                            className="min-h-[60px]"
                            rows={2}
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">{service.name || "未命名"}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {service.description || "无描述"}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === service.id ? (
                        <div>
                          <Input
                            value={editData.url || ""}
                            onChange={(e) => setEditData({ ...editData, url: e.target.value })}
                            placeholder="https://api.example.com/mcp"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[300px]">
                            {service.url}
                          </code>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === service.id ? (
                        <Textarea
                          value={editData.headers || ""}
                          onChange={(e) => setEditData({ ...editData, headers: e.target.value })}
                          placeholder='{"Authorization": "Bearer token"}'
                          className="min-h-[60px]"
                          rows={2}
                        />
                      ) : (
                        <div className="flex items-start space-x-2">
                          <Code className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-1" />
                          <code className="text-xs bg-muted px-2 py-1 rounded whitespace-pre-wrap break-all max-w-[300px]">
                            {service.headers || "无"}
                          </code>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === service.id ? (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveEdit(service.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEdit(service)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(service.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {editingServices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>暂无服务，点击"添加服务"开始配置</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          取消
        </Button>
        <Button onClick={handleSaveAll}>
          保存所有更改
        </Button>
      </div>
    </div>
  );
};