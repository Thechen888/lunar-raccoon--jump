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
import { Search, Globe, Zap, Code, MessageSquare, Trash2, Edit, Plus } from "lucide-react";
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
    initialData?.tools || []
  );
  const [prompts, setPrompts] = useState<MCPServiceConfig["prompts"]>(
    initialData?.prompts || []
  );

  // 工具搜索
  const [toolSearchTerm, setToolSearchTerm] = useState("");
  
  // 添加工具表单
  const [isAddToolOpen, setIsAddToolOpen] = useState(false);
  const [newTool, setNewTool] = useState({
    name: "",
    description: "",
    method: "POST",
    path: ""
  });

  // 编辑工具
  const [editingTool, setEditingTool] = useState<number | null>(null);

  // 添加提示表单
  const [isAddPromptOpen, setIsAddPromptOpen] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    name: "",
    content: ""
  });

  // 编辑提示
  const [editingPrompt, setEditingPrompt] = useState<number | null>(null);

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

  // 工具管理
  const handleAddTool = () => {
    if (!newTool.name.trim() || !newTool.path.trim()) {
      toast.error("请填写工具名称和路径");
      return;
    }
    
    const tool = {
      id: `tool-${Date.now()}`,
      name: newTool.name.trim(),
      description: newTool.description.trim(),
      method: newTool.method,
      path: newTool.path.trim(),
      enabled: true
    };
    
    setTools([...(tools || []), tool]);
    setNewTool({ name: "", description: "", method: "POST", path: "" });
    setIsAddToolOpen(false);
    toast.success("工具已添加");
  };

  const handleEditTool = (index: number) => {
    const tool = tools?.[index];
    if (tool) {
      setEditingTool(index);
      setNewTool({
        name: tool.name,
        description: tool.description,
        method: tool.method,
        path: tool.path
      });
      setIsAddToolOpen(true);
    }
  };

  const handleUpdateTool = () => {
    if (editingTool !== null && tools) {
      const updatedTools = [...tools];
      updatedTools[editingTool] = {
        ...updatedTools[editingTool],
        name: newTool.name.trim(),
        description: newTool.description.trim(),
        method: newTool.method,
        path: newTool.path.trim()
      };
      setTools(updatedTools);
      setEditingTool(null);
      setNewTool({ name: "", description: "", method: "POST", path: "" });
      setIsAddToolOpen(false);
      toast.success("工具已更新");
    }
  };

  const handleDeleteTool = (index: number) => {
    if (tools) {
      setTools(tools.filter((_, i) => i !== index));
      toast.success("工具已删除");
    }
  };

  const handleToggleTool = (index: number) => {
    if (tools) {
      const updatedTools = [...tools];
      updatedTools[index].enabled = !updatedTools[index].enabled;
      setTools(updatedTools);
    }
  };

  // 提示管理
  const handleAddPrompt = () => {
    if (!newPrompt.name.trim() || !newPrompt.content.trim()) {
      toast.error("请填写提示名称和内容");
      return;
    }
    
    const prompt = {
      id: `prompt-${Date.now()}`,
      name: newPrompt.name.trim(),
      content: newPrompt.content.trim()
    };
    
    setPrompts([...(prompts || []), prompt]);
    setNewPrompt({ name: "", content: "" });
    setIsAddPromptOpen(false);
    toast.success("提示已添加");
  };

  const handleEditPrompt = (index: number) => {
    const prompt = prompts?.[index];
    if (prompt) {
      setEditingPrompt(index);
      setNewPrompt({
        name: prompt.name,
        content: prompt.content
      });
      setIsAddPromptOpen(true);
    }
  };

  const handleUpdatePrompt = () => {
    if (editingPrompt !== null && prompts) {
      const updatedPrompts = [...prompts];
      updatedPrompts[editingPrompt] = {
        ...updatedPrompts[editingPrompt],
        name: newPrompt.name.trim(),
        content: newPrompt.content.trim()
      };
      setPrompts(updatedPrompts);
      setEditingPrompt(null);
      setNewPrompt({ name: "", content: "" });
      setIsAddPromptOpen(false);
      toast.success("提示已更新");
    }
  };

  const handleDeletePrompt = (index: number) => {
    if (prompts) {
      setPrompts(prompts.filter((_, i) => i !== index));
      toast.success("提示已删除");
    }
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
          <TabsTrigger value="tools">工具</TabsTrigger>
          <TabsTrigger value="prompts">提示</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">配置服务</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>
                  服务名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：PANGU-中国-精简"
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
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">工具管理</CardTitle>
                <Button size="sm" onClick={() => {
                  setIsAddToolOpen(true);
                  setEditingTool(null);
                  setNewTool({ name: "", description: "", method: "POST", path: "" });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加工具
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索工具..."
                  value={toolSearchTerm}
                  onChange={(e) => setToolSearchTerm(e.target.value)}
                  className="pl-9"
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
                    {filteredTools.map((tool, index) => (
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
                                onCheckedChange={() => handleToggleTool(index)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTool(index)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTool(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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

          {/* 添加/编辑工具对话框 */}
          {isAddToolOpen && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingTool !== null ? "编辑工具" : "添加工具"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>名称 <span className="text-red-500">*</span></Label>
                  <Input
                    value={newTool.name}
                    onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                    placeholder="例如：代码生成"
                  />
                </div>
                <div>
                  <Label>描述</Label>
                  <Textarea
                    value={newTool.description}
                    onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                    placeholder="描述这个工具的用途..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Method <span className="text-red-500">*</span></Label>
                  <div className="flex space-x-2 mt-1">
                    {["GET", "POST", "PUT", "DELETE"].map((method) => (
                      <Button
                        key={method}
                        type="button"
                        variant={newTool.method === method ? "default" : "outline"}
                        onClick={() => setNewTool({ ...newTool, method })}
                        size="sm"
                      >
                        {method}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Path <span className="text-red-500">*</span></Label>
                  <Input
                    value={newTool.path}
                    onChange={(e) => setNewTool({ ...newTool, path: e.target.value })}
                    placeholder="/api/code/generate"
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" onClick={() => {
                    setIsAddToolOpen(false);
                    setEditingTool(null);
                    setNewTool({ name: "", description: "", method: "POST", path: "" });
                  }}>
                    取消
                  </Button>
                  <Button onClick={editingTool !== null ? handleUpdateTool : handleAddTool}>
                    {editingTool !== null ? "更新" : "添加"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="prompts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">提示管理</CardTitle>
                <Button size="sm" onClick={() => {
                  setIsAddPromptOpen(true);
                  setEditingPrompt(null);
                  setNewPrompt({ name: "", content: "" });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加提示
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(!prompts || prompts.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无提示
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {prompts.map((prompt, index) => (
                      <Card key={prompt.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2 flex-1">
                              <MessageSquare className="h-4 w-4 text-primary" />
                              <span className="font-medium">{prompt.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPrompt(index)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePrompt(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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

          {/* 添加/编辑提示对话框 */}
          {isAddPromptOpen && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingPrompt !== null ? "编辑提示" : "添加提示"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>名称 <span className="text-red-500">*</span></Label>
                  <Input
                    value={newPrompt.name}
                    onChange={(e) => setNewPrompt({ ...newPrompt, name: e.target.value })}
                    placeholder="例如：系统提示词"
                  />
                </div>
                <div>
                  <Label>内容 <span className="text-red-500">*</span></Label>
                  <Textarea
                    value={newPrompt.content}
                    onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
                    placeholder="输入提示内容..."
                    rows={6}
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" onClick={() => {
                    setIsAddPromptOpen(false);
                    setEditingPrompt(null);
                    setNewPrompt({ name: "", content: "" });
                  }}>
                    取消
                  </Button>
                  <Button onClick={editingPrompt !== null ? handleUpdatePrompt : handleAddPrompt}>
                    {editingPrompt !== null ? "更新" : "添加"}
                  </Button>
                </div>
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