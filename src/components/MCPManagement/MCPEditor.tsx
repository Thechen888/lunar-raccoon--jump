import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

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

  const handleAddRegion = () => {
    setRegions([...regions, { id: `region-${Date.now()}`, name: "" }]);
  };

  const handleRemoveRegion = (id: string) => {
    setRegions(regions.filter(r => r.id !== id));
  };

  const handleUpdateRegion = (id: string, name: string) => {
    setRegions(regions.map(r => r.id === id ? { ...r, name } : r));
  };

  const handleAddComplexity = () => {
    setComplexityLevels([...complexityLevels, { id: `complexity-${Date.now()}`, name: "", description: "" }]);
  };

  const handleRemoveComplexity = (id: string) => {
    setComplexityLevels(complexityLevels.filter(c => c.id !== id));
  };

  const handleUpdateComplexity = (id: string, field: "name" | "description", value: string) => {
    setComplexityLevels(complexityLevels.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSave = () => {
    onSave({
      name,
      description,
      regions,
      complexityLevels
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>服务名称</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：PANGU" />
      </div>
      <div>
        <Label>描述</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="服务描述..." />
      </div>

      <Tabs defaultValue="regions">
        <TabsList>
          <TabsTrigger value="regions">区域管理</TabsTrigger>
          <TabsTrigger value="complexity">复杂度管理</TabsTrigger>
        </TabsList>

        <TabsContent value="regions" className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>区域列表 ({regions.length} 个)</Label>
            <Button size="sm" onClick={handleAddRegion}>
              <Plus className="h-4 w-4 mr-1" />
              添加区域
            </Button>
          </div>
          <div className="space-y-2">
            {regions.map((region) => (
              <div key={region.id} className="flex items-center space-x-2">
                <Input
                  value={region.name}
                  onChange={(e) => handleUpdateRegion(region.id, e.target.value)}
                  placeholder="区域名称"
                  className="flex-1"
                />
                <Button variant="ghost" size="sm" onClick={() => handleRemoveRegion(region.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {regions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">暂无区域</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="complexity" className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>复杂度等级 ({complexityLevels.length} 个)</Label>
            <Button size="sm" onClick={handleAddComplexity}>
              <Plus className="h-4 w-4 mr-1" />
              添加等级
            </Button>
          </div>
          <div className="space-y-3">
            {complexityLevels.map((level) => (
              <div key={level.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Input
                    value={level.name}
                    onChange={(e) => handleUpdateComplexity(level.id, "name", e.target.value)}
                    placeholder="等级名称"
                    className="flex-1"
                  />
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveComplexity(level.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={level.description}
                  onChange={(e) => handleUpdateComplexity(level.id, "description", e.target.value)}
                  placeholder="描述"
                  className="text-sm"
                />
              </div>
            ))}
            {complexityLevels.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">暂无复杂度等级</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>取消</Button>
        <Button onClick={handleSave}>保存</Button>
      </div>
    </div>
  );
};