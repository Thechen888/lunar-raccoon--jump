import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface MCPCreateData {
  name: string;
  description: string;
  url: string;
  headers: string;
}

interface MCPCreateFormProps {
  onSave: (data: MCPCreateData) => void;
  onCancel: () => void;
}

export const MCPCreateForm = ({ onSave, onCancel }: MCPCreateFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");

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
      headers: headers.trim()
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">创建MCP服务</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>
              名称 <span className="text-red-500">*</span>
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
          创建服务
        </Button>
      </div>
    </div>
  );
};