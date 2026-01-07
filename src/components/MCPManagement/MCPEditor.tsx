import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface MCPService {
  id: string;
  name: string;
  description: string;
  url: string;
  headers?: string;
  status: "active" | "inactive";
  createdAt: string;
}

interface MCPEditorProps {
  service: MCPService;
  onSave: (data: Partial<MCPService>) => void;
  onCancel: () => void;
}

export const MCPEditor = ({ service, onSave, onCancel }: MCPEditorProps) => {
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description);
  const [url, setUrl] = useState(service.url);
  const [headers, setHeaders] = useState(service.headers || "");

  const handleSave = () => {
    if (!name.trim()) {
      alert("请输入服务名称");
      return;
    }
    if (!url.trim()) {
      alert("请输入URL地址");
      return;
    }
    onSave({
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
      headers: headers.trim() || undefined
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">编辑MCP服务</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>
              服务名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：MyMCPServer"
            />
          </div>
          <div>
            <Label>描述</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述这个MCP服务的用途..."
              rows={2}
            />
          </div>
          <div>
            <Label>
              URL <span className="text-red-500">*</span>
            </Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/mcp"
            />
            <p className="text-xs text-muted-foreground mt-1">远程URL地址</p>
          </div>
          <div>
            <Label>请求头</Label>
            <Textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">HTTP 请求的自定义请求头（JSON格式）</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={handleSave}>
          保存配置
        </Button>
      </div>
    </div>
  );
};