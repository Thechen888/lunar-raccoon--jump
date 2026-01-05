import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Region {
  id: string;
  name: string;
}

interface ComplexityLevel {
  id: string;
  name: string;
  description: string;
}

interface MCPType {
  id: string;
  name: string;
  description: string;
  regions: Region[];
  complexityLevels: ComplexityLevel[];
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
  const [status, setStatus] = useState<"active" | "inactive">(mcpType.status || "active");

  const handleAddRegion = () => {
    setRegions([...regions, { id: `region-${Date.now()}`, name: "" }]);
  };

  const handleRemoveRegion = (id: string) => {
    setRegions(regions.filter(r => r.id !== id));
  };

  const handleUpdateRegion = (id: string, field: "name", value: string) => {
    setRegions(regions.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleAddComplexity = () => {
    setComplexityLevels([...complexityLevels, { 
      id: `complexity-${Date.now()}`, 
      name: "", 
      description: ""
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

      <Tabs defaultValue="regions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="regions">区域管理</TabsTrigger>
          <TabsTrigger value="complexity">复杂度管理</TabsTrigger>
        </TabsList>

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
                  </div>
                ))}
                {complexityLevels.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">暂无复杂度等级，点击"添加等级"创建</p>
                )}
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