import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
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
      
      // 验证每个服务的基本字段
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      setActiveTab("paste");
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">从JSON导入MCP服务</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">
                <FileText className="h-4 w-4 mr-2" />
                粘贴JSON
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                上传文件
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-4 mt-4">
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
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  点击上传JSON文件或拖拽文件到此处
                </p>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
              </div>
            </TabsContent>
          </Tabs>
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