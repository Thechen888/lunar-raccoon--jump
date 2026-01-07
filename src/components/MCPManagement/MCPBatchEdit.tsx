import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, X } from "lucide-react";
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

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    toast.success("已复制到剪贴板");
  };

  const exampleJson = [
    {
      "id": "mcp-example-1",
      "name": "示例服务",
      "description": "这是一个示例 MCP 服务",
      "url": "https://api.example.com/v1",
      "headers": "{\"Authorization\": \"Bearer token\"}",
      "status": "active",
      "createdAt": "2024-01-01"
    }
  ];

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
            {/* 复制 */}
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              复制
            </Button>
          </div>

          {/* 使用说明 */}
          <Alert>
            <div className="text-sm space-y-1">
              <div className="font-medium">使用说明：</div>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>直接编辑 JSON 配置，保存时会自动验证格式</li>
                <li>每个服务必须包含 id、name、url 字段</li>
                <li>工具和提示无法通过此处编辑，请在详情页面中查看</li>
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