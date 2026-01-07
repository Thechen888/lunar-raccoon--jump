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
  tools?: any[];
  prompts?: any[];
}

interface MCPBatchEditProps {
  services: MCPService[];
  onUpdateServices: (services: MCPService[]) => void;
  onClose: () => void;
}

// 导入时的简化格式
interface ImportService {
  name: string;
  description: string;
  url: string;
  headers?: string;
}

interface ImportFormat {
  services: ImportService[];
}

export const MCPBatchEdit = ({ services, onUpdateServices, onClose }: MCPBatchEditProps) => {
  // 转换为导入格式（删除 id、status、createdAt、tools、prompts）
  const convertToImportFormat = (services: MCPService[]): ImportFormat => {
    return {
      services: services.map(s => ({
        name: s.name,
        description: s.description,
        url: s.url,
        headers: s.headers
      }))
    };
  };

  const [jsonText, setJsonText] = useState(() => JSON.stringify(convertToImportFormat(services), null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const validateAndParse = (text: string): ImportFormat | null => {
    try {
      const parsed = JSON.parse(text);
      if (!parsed.services || !Array.isArray(parsed.services)) {
        throw new Error("JSON 必须包含 services 数组");
      }
      if (parsed.services.length === 0) {
        throw new Error("服务列表不能为空");
      }
      // 验证每个服务的基本字段
      parsed.services.forEach((service: ImportService, index: number) => {
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
      // 转换回完整格式，保留所有原有字段（包括 tools 和 prompts）
      const updatedServices: MCPService[] = parsed.services.map((s, index) => {
        const existingService = services.find(service => service.name === s.name && service.url === s.url);
        
        if (existingService) {
          // 如果找到匹配的现有服务，更新配置字段，保留其他所有字段
          return {
            ...existingService,
            name: s.name,
            description: s.description,
            url: s.url,
            headers: s.headers
          };
        } else {
          // 如果是新服务，创建完整的配置对象
          return {
            id: `mcp-${Date.now()}-${index}`,
            name: s.name,
            description: s.description,
            url: s.url,
            headers: s.headers,
            status: "active",
            createdAt: new Date().toISOString().split('T')[0],
            tools: [],
            prompts: []
          };
        }
      });

      onUpdateServices(updatedServices);
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

  const exampleJson: ImportFormat = {
    services: [
      {
        name: "MyMCPServer1",
        description: "第一个MCP服务",
        url: "https://api.example.com/mcp1",
        headers: "{\"Authorization\": \"Bearer token1\"}"
      },
      {
        name: "MyMCPServer2",
        description: "第二个MCP服务",
        url: "https://api.example.com/mcp2"
      }
    ]
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
                <li>每个服务必须包含 name、url 字段</li>
                <li>编辑现有服务时，会保留该服务的 tools 和 prompts 等数据</li>
                <li>删除服务会从列表中移除该服务</li>
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