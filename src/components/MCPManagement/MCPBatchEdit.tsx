import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Trash2, Check, X, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export interface MCPService {
  id: string;
  name: string;
  description: string;
  url: string;
  headers?: string;
  status: "active" | "inactive";
  createdAt: string;
  tools?: any[];
  prompts?: any[];
}

interface MCPBatchEditProps {
  services: MCPService[];
  onUpdateServices: (services: MCPService[]) => void;
  onClose: () => void;
}

export const MCPBatchEdit = ({ services, onUpdateServices, onClose }: MCPBatchEditProps) => {
  const [jsonText, setJsonText] = useState(JSON.stringify(services, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const validateAndParse = (text: string): MCPService[] | null => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON 必须是数组格式");
      }
      if (parsed.length === 0) {
        throw new Error("服务列表不能为空");
      }
      // 验证每个服务的基本字段
      parsed.forEach((service, index) => {
        if (!service.id) throw new Error(`第 ${index + 1} 个服务缺少 id 字段`);
        if (!service.name) throw new Error(`第 ${index + 1} 个服务缺少 name 字段`);
        if (!service.url) throw new Error(`第 ${index + 1} 个服务缺少 url 字段`);
      });
      setJsonError(null);
      return parsed;
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "JSON 格式错误");
      return null;
    }
  };

  const handleSave = () => {
    const parsed = validateAndParse(jsonText);
    if (parsed) {
      onUpdateServices(parsed);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      toast.success("JSON 保存成功");
    } else {
      toast.error("JSON 格式错误，请检查");
    }
  };

  const handleFormat = () => {
    const parsed = validateAndParse(jsonText);
    if (parsed) {
      setJsonText(JSON.stringify(parsed, null, 2));
      toast.success("JSON 已格式化");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    toast.success("已复制到剪贴板");
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mcp-services-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("文件已下载");
  };

  const handleClear = () => {
    setJsonText("[]");
    setJsonError(null);
    toast.success("内容已清空");
  };

  const handleReset = () => {
    setJsonText(JSON.stringify(services, null, 2));
    setJsonError(null);
    toast.success("已重置为原始数据");
  };

  const exampleJson = [
    {
      "id": "mcp-example-1",
      "name": "示例服务",
      "description": "这是一个示例 MCP 服务",
      "url": "https://api.example.com/v1",
      "headers": "{\"Authorization\": \"Bearer token\"}",
      "status": "active",
      "createdAt": "2024-01-01",
      "tools": [],
      "prompts": []
    }
  ];

  const handleInsertExample = () => {
    const parsed = validateAndParse(jsonText);
    if (parsed) {
      const newServices = [...parsed, ...exampleJson.map((s, i) => ({
        ...s,
        id: `mcp-example-${Date.now()}-${i}`
      }))];
      setJsonText(JSON.stringify(newServices, null, 2));
      toast.success("已插入示例服务");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">批量编辑 MCP 服务（JSON 模式）</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={isSaved ? "default" : "secondary"} className="text-xs">
                {isSaved ? "已保存" : "未保存"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* JSON 编辑器 */}
          <div className="space-y-2">
            <Label>JSON 配置</Label>
            <Textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setIsSaved(false);
                validateAndParse(e.target.value);
              }}
              placeholder={JSON.stringify(exampleJson, null, 2)}
              className="font-mono text-sm min-h-[500px] resize-y"
              spellCheck={false}
            />
            
            {/* 错误提示 */}
            {jsonError && (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertDescription>
                  {jsonError}
                </AlertDescription>
              </Alert>
            )}

            {/* 成功提示 */}
            {!jsonError && jsonText && (
              <Alert className="border-green-500 text-green-700 bg-green-50">
                <Check className="h-4 w-4 text-green-700" />
                <AlertDescription className="text-green-700">
                  JSON 格式正确
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2">
            {/* 格式化和验证 */}
            <Button variant="outline" onClick={handleFormat}>
              <RefreshCw className="h-4 w-4 mr-2" />
              格式化
            </Button>

            {/* 复制 */}
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              复制
            </Button>

            {/* 下载 */}
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              下载
            </Button>

            {/* 插入示例 */}
            <Button variant="outline" onClick={handleInsertExample}>
              插入示例
            </Button>

            {/* 清空 */}
            <Button variant="outline" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-2" />
              清空
            </Button>

            {/* 重置 */}
            <Button variant="outline" onClick={handleReset}>
              重置
            </Button>
          </div>

          {/* 使用说明 */}
          <Alert>
            <div className="text-sm space-y-1">
              <div className="font-medium">使用说明：</div>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>直接编辑 JSON 配置，格式化后保存</li>
                <li>支持批量添加、删除、修改服务</li>
                <li>每个服务必须包含 id、name、url 字段</li>
                <li>保存时会自动验证 JSON 格式</li>
                <li>可以复制 JSON 内容到其他地方使用</li>
              </ul>
            </div>
          </Alert>
        </CardContent>
      </Card>

      {/* 底部操作按钮 */}
      <div className="flex space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          取消
        </Button>
        <Button onClick={handleSave} disabled={!!jsonError}>
          保存更改
        </Button>
      </div>
    </div>
  );
};