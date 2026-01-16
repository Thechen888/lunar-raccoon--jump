import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Search, Globe, Zap, Code, MessageSquare, Lock } from "lucide-react";
import { toast } from "sonner";

export interface MCPServiceConfig {
  name: string;
  description: string;
  url: string;
  headers?: string;
  tools?: Array<{
    id: string;
    name: string;
    description: string;
    method: string;
    path: string;
    enabled: boolean;
  }>;
  prompts?: Array<{
    id: string;
    name: string;
    content: string;
  }>;
}

interface MCPProviderConfigProps {
  initialData?: MCPServiceConfig;
  onSave: (data: MCPServiceConfig) => void;
  onCancel: () => void;
}

export const MCPProviderConfig = ({ initialData, onSave, onCancel }: MCPProviderConfigProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [headers, setHeaders] = useState(initialData?.headers || "");
  
  const [tools, setTools] = useState<MCPServiceConfig["tools"]>(
    initialData?.tools || [
      {
        id: "tool-1",
        name: "代码生成",
        description: "根据需求生成高质量代码",
        method: "POST",
        path: "/api/code/generate",
        enabled: true
      },
      {
        id: "tool-2",
        name: "文本分析",
        description: "分析文本内容，提取关键信息",
        method: "POST",
        path: "/api/text/analyze",
        enabled: true
      },
      {
        id: "tool-3",
        name: "数据查询",
        description: "查询数据库中的数据",
        method: "GET",
        path: "/api/data/query",
        enabled: false
      }
    ]
  );
  const [prompts, setPrompts] = useState<MCPServiceConfig["prompts"]>(
    initialData?.prompts || [
      {
        id: "prompt-1",
        name: "系统提示词",
        content: "你是一个专业的AI助手，擅长回答各类问题。请确保回答准确、简洁、有帮助。"
      },
      {
        id: "prompt-2",
        name: "代码生成提示",
        content: "请根据以下需求生成代码，确保代码质量高、可读性强、注释完整。"
      },
      {
        id: "prompt-3",
        name: "数据分析提示",
        content: "请分析以下数据，提供关键洞察和建议。数据如下：\n\n{data}"
      }
    ]
  );

  // 工具搜索
  const [toolSearchTerm, setToolSearchTerm] = useState("");

  // 检查基本信息是否完成
  const basicInfoComplete = !!(name.trim() && url.trim());

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("请输入服务名称");
      return;
    }
    if (!url.trim()) {
      toast.error("请输入URL地址");
      return;
    }
    onSave({
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
      headers: headers.trim() || undefined,
      tools,
      prompts
    });
  };

  const handleToggleTool = (toolId: string) => {
    setTools(tools?.map(tool => 
      tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
    ));
  };

  const filteredTools = tools?.filter(tool => 
    tool.name.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
    tool.path.toLowerCase().includes(toolSearchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger 
            value="tools" 
            disabled={!basicInfoComplete}
            title={!basicInfoComplete ? "请先完成基本信息配置" : ""}
          >
            工具 {!basicInfoComplete && <Lock className="h-3 w-3 ml-1" />}
          </TabsTrigger>
          <TabsTrigger 
            value="prompts" 
            disabled={!basicInfoComplete}
            title={!basicInfoComplete ? "请先完成基本信息配置" : ""}
          >
            提示 {!basicInfoComplete && <Lock className="h-3 w-3 ml-1" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">配置服务</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  服务名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：PANGU-中国-精简"
                  className="focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述这个MCP服务的用途..."
                  rows={2}
                  className="focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/mcp"
                  className="focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <p className="text-xs text-muted-foreground mt-1">远程URL地址</p>
              </div>
              <div className="space-y-2">
                <Label>请求头</Label>
                <Textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                  rows={4}
                  className="focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <p className="text-xs text-muted-foreground mt-1">HTTP 请求的自定义请求头（JSON格式）</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          {!basicInfoComplete ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">请先完成基本信息配置</p>
                <p className="text-sm text-muted-foreground mt-2">填写服务名称和URL后即可配置工具</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">工具管理</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 搜索框 */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索工具..."
                    value={toolSearchTerm}
                    onChange={(e) => setToolSearchTerm(e.target.value)}
                    className="pl-9 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>

                {/* 工具列表 */}
                {filteredTools.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {tools?.length === 0 ? "暂无工具" : "未找到匹配的工具"}
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {filteredTools.map((tool) => (
                        <Card key={tool.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Zap className="h-4 w-4 text-primary" />
                                  <span className="font-medium">{tool.name}</span>
                                  <Badge 
                                    variant={
                                      tool.method === "GET" ? "default" :
                                      tool.method === "POST" ? "secondary" :
                                      tool.method === "PUT" ? "outline" :
                                      tool.method === "DELETE" ? "destructive" :
                                      "outline"
                                    }
                                    className="text-xs"
                                  >
                                    {tool.method}
                                  </Badge>
                                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                    <Globe className="h-3 w-3" />
                                    <code className="bg-muted px-2 py-0.5 rounded">
                                      {tool.path}
                                    </code>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{tool.description}</p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Switch
                                  checked={tool.enabled}
                                  onCheckedChange={() => handleToggleTool(tool.id)}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="prompts" className="space-y-4">
          {!basicInfoComplete ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">请先完成基本信息配置</p>
                <p className="text-sm text-muted-foreground mt-2">填写服务名称和URL后即可配置提示</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">提示管理</CardTitle>
              </CardHeader>
              <CardContent>
                {(!prompts || prompts.length === 0) ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无提示
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {prompts.map((prompt) => (
                        <Card key={prompt.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2 flex-1">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                <span className="font-medium">{prompt.name}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded">
                              {prompt.content}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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