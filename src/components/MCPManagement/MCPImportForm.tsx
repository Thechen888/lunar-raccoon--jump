import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { toast } from "sonner";

export interface MCPImportData {
  services: Array<{
    name: string;
    description: string;
    url: string;
    headers?: string;
  }>;
}

interface MCPImportFormProps {
  onImport: (data: MCPImportData) => void;
  onCancel: () => void;
}

export const MCPImportForm = ({ onImport, onCancel }: MCPImportFormProps) => {
  const [jsonText, setJsonText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  const exampleJson = {
    "services": [
      {
        "name": "MyMCPServer1",
        "description": "第一个MCP服务",
        "url": "https://api.example.com/mcp1",
        "headers": "{\"Authorization\": \"Bearer token1\"}"
      },
      {
        "name": "MyMCPServer2",
        "description": "第二个MCP服务",
        "url": "https://api.example.com/mcp2"
      }
    ]
  };

  const handlePasteImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.services || !Array.isArray(parsed.services)) {
        throw new Error("JSON格式错误：缺少services数组");
      }
      
      for (const service of parsed.services) {
        if (!service.name || !service.url) {
          throw new Error("每个服务必须包含name和url字段");
        }
      }
      
      onImport(parsed);
      setJsonText("");
      setImportError(null);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "JSON解析失败");
      toast.error("JSON格式错误");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">从JSON导入MCP服务</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>JSON配置</Label>
            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={JSON.stringify(exampleJson, null, 2)}
              className="font-mono text-sm"
              rows={15}
            />
            {importError && (
              <p className="text-sm text-red-500 mt-2">{importError}</p>
            )}
            <Button 
              onClick={() => setJsonText(JSON.stringify(exampleJson, null, 2))}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              填充示例
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={handlePasteImport}>
          导入服务
        </Button>
      </div>
    </div>
  );
};