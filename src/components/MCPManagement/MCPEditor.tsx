import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Region {
  id: string;
  name: string;
  endpoint?: string;
}

interface ComplexityLevel {
  id: string;
  name: string;
  description: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

interface MCPType {
  id: string;
  name: string;
  description: string;
  regions: Region[];
  complexityLevels: ComplexityLevel[];
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  apiVersion?: string;
  modelName?: string;
  authType?: "bearer" | "api-key" | "basic" | "custom";
  timeout?: number;
  retryCount?: number;
  qpsLimit?: number;
  quotaLimit?: number;
  status: "active" | "inactive";
}

interface MCPEditorProps {
  mcpType: MCPType;
  onSave: (data: Partial<MCPType>) => void;
  onCancel: () => void;
}

export const MCPEditor = ({ mcpType, onSave, onCancel }: MCPEditorProps) => {
  const [name, setName] = useState(mcpType.name);
  const [description, setDescription] = useState(mcpType.description);
  const [regions, setRegions] = useState<Region[]>(mcpType.regions);
  const [complexityLevels, setComplexityLevels] = useState<ComplexityLevel[]>(mcpType.complexityLevels);
  const [apiKey, setApiKey] = useState(mcpType.apiKey || "");
  const [apiSecret, setApiSecret] = useState(mcpType.apiSecret || "");
  const [baseUrl, setBaseUrl] = useState(mcpType.baseUrl || "");
  const [apiVersion, setApiVersion] = useState(mcpType.apiVersion || "v1");
  const [modelName, setModelName] = useState(mcpType.modelName || "");
  const [authType, setAuthType] = useState<"bearer" | "api-key" | "basic" | "custom">(mcpType.authType || "bearer");
  const [timeout, setTimeout] = useState(mcpType.timeout || 30);
  const [retryCount, setRetryCount] = useState(mcpType.retryCount || 3);
  const [qpsLimit, setQpsLimit] = useState(mcpType.qpsLimit || 10);
  const [quotaLimit, setQuotaLimit] = useState(mcpType.quotaLimit || 10000);
  const [status, setStatus] = useState<"active" | "inactive">(mcpType.status || "active");
  const [showApiKey, setShowApiKey] = useState(false);

  const handleAddRegion = () => {
    setRegions([...regions, { id: `region-${Date.now()}`, name: "", endpoint: "" }]);
  };

  const handleRemoveRegion = (id: string) => {
    setRegions(regions.filter(r => r.id !== id));
  };

  const handleUpdateRegion = (id: string, field: "name" | "endpoint", value: string) => {
    setRegions(regions.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleAddComplexity = () => {
    setComplexityLevels([...complexityLevels, { 
      id: `complexity-${Date.now()}`, 
      name: "", 
      description: "",
      maxTokens: 4096,
      temperature: 0.7,
      topP: 1.0
    }]);
  };

  const handleRemoveComplexity = (id: string) => {
    setComplexityLevels(complexityLevels.filter(c => c.id !== id));
  };

  const handleUpdateComplexity = (id: string, field: string, value: any) => {
    setComplexityLevels(complexityLevels.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSave = () => {
    onSave({
      name,
      description,
      regions,
      complexityLevels,
      apiKey,
      apiSecret,
      baseUrl,
      apiVersion,
      modelName,
      authType,
      timeout,
      retryCount,
      qpsLimit,
      quotaLimit,
      status
    });
  };

  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>服务名称 <span className="text-red-500">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：PANGU" />
          </div>
          <div>
            <Label>描述</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="服务描述..." rows={2} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={status === "active"} onCheckedChange={(v) => setStatus(v ? "active" : "inactive")} />
            <Label>启用此服务</Label>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="api">API配置</TabsTrigger>
          <TabsTrigger value="connection">连接配置</TabsTrigger>
          <TabsTrigger value="regions">区域管理</TabsTrigger>
          <TabsTrigger value="complexity">复杂度管理</TabsTrigger>
          <TabsTrigger value="quota">限流配额</TabsTrigger>
        </TabsList>

        {/* API配置 */}
        <TabsContent value="api" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API认证</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Base URL <span className="text-red-500">*</span></Label>
                <Input 
                  value={baseUrl} 
                  onChange={(e) => setBaseUrl(e.target.value)} 
                  placeholder="https://api.example.com"
                />
                <p className="text-xs text-muted-foreground mt-1">API的基础地址，不包含版本路径</p>
              </div>
              
              <div>
                <Label>API版本</Label>
                <Input 
                  value={apiVersion} 
                  onChange={(e) => setApiVersion(e.target.value)} 
                  placeholder="v1"
                />
              </div>

              <div>
                <Label>模型名称 <span className="text-red-500">*</span></Label>
                <Input 
                  value={modelName} 
                  onChange={(e) => setModelName(e.target.value)} 
                  placeholder="gpt-4"
                />
                <p className="text-xs text-muted-foreground mt-1">实际调用的模型标识</p>
              </div>

              <div>
                <Label>认证方式</Label>
                <Select value={authType} onValueChange={(v: any) => setAuthType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="api-key">API Key (Header)</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="custom">自定义</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>API Key <span className="text-red-500">*</span></Label>
                <div className="flex space-x-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-***"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? "隐藏" : "显示"}
                  </Button>
                </div>
              </div>

              {authType === "basic" && (
                <div>
                  <Label>API Secret</Label>
                  <Input
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="API密钥"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 连接配置 */}
        <TabsContent value="connection" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">连接设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>超时时间（秒）</Label>
                  <Input 
                    type="number"
                    value={timeout} 
                    onChange={(e) => setTimeout(Number(e.target.value))} 
                    min={5}
                    max={300}
                  />
                  <p className="text-xs text-muted-foreground mt-1">请求超时时间</p>
                </div>
                <div>
                  <Label>重试次数</Label>
                  <Input 
                    type="number"
                    value={retryCount} 
                    onChange={(e) => setRetryCount(Number(e.target.value))} 
                    min={0}
                    max={10}
                  />
                  <p className="text-xs text-muted-foreground mt-1">失败后重试次数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 区域管理 */}
        <TabsContent value="regions" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">区域列表 ({regions.length} 个)</CardTitle>
                <Button size="sm" onClick={handleAddRegion}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加区域
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {regions.map((region) => (
                  <div key={region.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Label className="text-xs">区域名称</Label>
                        <Input
                          value={region.name}
                          onChange={(e) => handleUpdateRegion(region.id, "name", e.target.value)}
                          placeholder="中国"
                        />
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveRegion(region.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <Label className="text-xs">区域端点（可选）</Label>
                      <Input
                        value={region.endpoint || ""}
                        onChange={(e) => handleUpdateRegion(region.id, "endpoint", e.target.value)}
                        placeholder="https://api.example.com/china"
                      />
                      <p className="text-xs text-muted-foreground mt-1">如果该区域有独立的端点，请填写</p>
                    </div>
                  </div>
                ))}
                {regions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">暂无区域，点击"添加区域"创建</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 复杂度管理 */}
        <TabsContent value="complexity" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">复杂度等级 ({complexityLevels.length} 个)</CardTitle>
                <Button size="sm" onClick={handleAddComplexity}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加等级
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complexityLevels.map((level) => (
                  <div key={level.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Label className="text-xs">等级名称</Label>
                        <Input
                          value={level.name}
                          onChange={(e) => handleUpdateComplexity(level.id, "name", e.target.value)}
                          placeholder="精简"
                        />
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveComplexity(level.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <Label className="text-xs">描述</Label>
                      <Input
                        value={level.description}
                        onChange={(e) => handleUpdateComplexity(level.id, "description", e.target.value)}
                        placeholder="基础功能，快速响应"
                        className="text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Max Tokens</Label>
                        <Input
                          type="number"
                          value={level.maxTokens}
                          onChange={(e) => handleUpdateComplexity(level.id, "maxTokens", Number(e.target.value))}
                          min={1}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Temperature</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min={0}
                          max={2}
                          value={level.temperature}
                          onChange={(e) => handleUpdateComplexity(level.id, "temperature", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Top P</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min={0}
                          max={1}
                          value={level.topP}
                          onChange={(e) => handleUpdateComplexity(level.id, "topP", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {complexityLevels.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">暂无复杂度等级，点击"添加等级"创建</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 限流配额 */}
        <TabsContent value="quota" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">限流与配额</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>QPS限制（每秒请求数）</Label>
                <Input 
                  type="number"
                  value={qpsLimit} 
                  onChange={(e) => setQpsLimit(Number(e.target.value))} 
                  min={1}
                  max={1000}
                />
                <p className="text-xs text-muted-foreground mt-1">控制每秒最大请求数，避免超出API限制</p>
              </div>
              
              <div>
                <Label>配额限制（每日调用量）</Label>
                <Input 
                  type="number"
                  value={quotaLimit} 
                  onChange={(e) => setQuotaLimit(Number(e.target.value))} 
                  min={100}
                />
                <p className="text-xs text-muted-foreground mt-1">每日最大API调用次数，0表示不限制</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>取消</Button>
        <Button onClick={handleSave}>保存配置</Button>
      </div>
    </div>
  );
};