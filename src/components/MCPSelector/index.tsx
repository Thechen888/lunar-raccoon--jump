import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Server, Check, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export type MCPSelection = {
  provider: string;
  regions: string[];
  complexity: string;
};

// MCP 服务数据（从 MCP 管理中读取）
const mcpProviders = [
  {
    id: "pangu",
    name: "PANGU",
    description: "华为盘古大模型",
    regions: [
      { id: "china", name: "中国" },
      { id: "europe", name: "欧洲" },
      { id: "usa", name: "美国" }
    ],
    complexityLevels: [
      { id: "simple", name: "精简", description: "基础功能，快速响应" },
      { id: "medium", name: "一般", description: "标准功能，平衡性能" },
      { id: "complex", name: "复杂", description: "高级功能，深度分析" },
      { id: "full", name: "完全", description: "完整功能，最高精度" }
    ]
  },
  {
    id: "ecohub",
    name: "EcoHub",
    description: "EcoHub 生态系统",
    regions: [
      { id: "main", name: "主节点" }
    ],
    complexityLevels: [
      { id: "simple", name: "精简", description: "基础功能" },
      { id: "medium", name: "一般", description: "标准功能" },
      { id: "complex", name: "复杂", description: "高级功能" },
      { id: "full", name: "完全", description: "完整功能" }
    ]
  }
];

interface MCPSelectorProps {
  onSelect: (selection: MCPSelection[]) => void;
  selectedMCPs: MCPSelection[];
}

export const MCPSelector = ({ onSelect, selectedMCPs }: MCPSelectorProps) => {
  // 为每个提供商存储临时选择状态
  const [tempSelections, setTempSelections] = useState<Record<string, { regions: string[]; complexity: string }>>({});

  // 初始化临时选择状态
  useEffect(() => {
    const initialSelections: Record<string, { regions: string[]; complexity: string }> = {};
    mcpProviders.forEach(provider => {
      const selectedMCP = selectedMCPs.find(s => s.provider === provider.id);
      initialSelections[provider.id] = {
        regions: selectedMCP?.regions || [],
        complexity: selectedMCP?.complexity || provider.complexityLevels[0]?.id || ""
      };
    });
    setTempSelections(initialSelections);
  }, [selectedMCPs]);

  const handleRegionToggle = (providerId: string, regionId: string) => {
    setTempSelections(prev => {
      const current = prev[providerId] || { regions: [], complexity: "" };
      const newRegions = current.regions.includes(regionId)
        ? current.regions.length > 1 ? current.regions.filter((r) => r !== regionId) : current.regions
        : [...current.regions, regionId];
      return { ...prev, [providerId]: { ...current, regions: newRegions } };
    });
  };

  const handleComplexityChange = (providerId: string, complexity: string) => {
    setTempSelections(prev => ({
      ...prev,
      [providerId]: { ...prev[providerId], complexity }
    }));
  };

  const handleApply = (providerId: string) => {
    const temp = tempSelections[providerId];
    if (temp && temp.regions.length > 0) {
      const newSelection: MCPSelection = {
        provider: providerId,
        regions: temp.regions,
        complexity: temp.complexity
      };
      // 更新已选择的列表
      const updatedSelections = selectedMCPs.filter(s => s.provider !== providerId);
      onSelect([...updatedSelections, newSelection]);
    }
  };

  const handleRemove = (providerId: string) => {
    onSelect(selectedMCPs.filter(s => s.provider !== providerId));
  };

  const getProviderName = (providerId: string) => {
    return mcpProviders.find(p => p.id === providerId)?.name || providerId;
  };

  const getRegionName = (providerId: string, regionId: string) => {
    return mcpProviders.find(p => p.id === providerId)?.regions.find(r => r.id === regionId)?.name || regionId;
  };

  const getComplexityName = (providerId: string, complexityId: string) => {
    return mcpProviders.find(p => p.id === providerId)?.complexityLevels.find(c => c.id === complexityId)?.name || complexityId;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Server className="h-5 w-5" />
          <span>MCP 选择</span>
        </CardTitle>
        <CardDescription>选择MCP系统，可多选</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Accordion type="multiple" className="w-full">
            {mcpProviders.map((provider) => {
              const selectedMCP = selectedMCPs.find(s => s.provider === provider.id);
              const temp = tempSelections[provider.id] || { regions: [], complexity: provider.complexityLevels[0]?.id || "" };
              const isSelected = selectedMCP !== undefined;

              return (
                <AccordionItem key={provider.id} value={provider.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between flex-1 pr-4">
                      <div className="flex items-center space-x-2">
                        {isSelected && <Check className="h-4 w-4 text-green-500" />}
                        <span className={isSelected ? "text-green-600 font-medium" : ""}>{provider.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isSelected && (
                          <Badge variant="default" className="text-xs">
                            {selectedMCP.regions.length} 区域 / {getComplexityName(provider.id, selectedMCP.complexity)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {/* 区域选择 */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          区域选择（至少选择一个）
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          {provider.regions.map((region) => {
                            const isChecked = temp.regions.includes(region.id);
                            return (
                              <div
                                key={region.id}
                                className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                                  isChecked ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                }`}
                                onClick={() => handleRegionToggle(provider.id, region.id)}
                              >
                                <Checkbox checked={isChecked} />
                                <span className="font-medium">{region.name}</span>
                                {isChecked && <Check className="h-4 w-4 text-primary ml-auto" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 复杂度选择 */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          复杂度选择（单选）
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          {provider.complexityLevels.map((level) => (
                            <div
                              key={level.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                temp.complexity === level.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                              }`}
                              onClick={() => handleComplexityChange(provider.id, level.id)}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{level.name}</span>
                                {temp.complexity === level.id && <Check className="h-4 w-4 text-primary" />}
                              </div>
                              <p className="text-xs text-muted-foreground">{level.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex space-x-2">
                        {isSelected ? (
                          <>
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleApply(provider.id)}
                              disabled={temp.regions.length === 0}
                            >
                              更新选择
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => handleRemove(provider.id)}
                            >
                              清除
                            </Button>
                          </>
                        ) : (
                          <Button
                            className="flex-1"
                            onClick={() => handleApply(provider.id)}
                            disabled={temp.regions.length === 0}
                          >
                            确认选择
                          </Button>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* 已选择摘要 */}
          {selectedMCPs.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <Label className="text-sm font-medium">已选择的 MCP 配置：</Label>
              {selectedMCPs.map((selection) => (
                <div key={selection.provider} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{getProviderName(selection.provider)}</div>
                    <div className="text-xs text-muted-foreground">
                      区域: {selection.regions.map(r => getRegionName(selection.provider, r)).join(", ")} | 复杂度: {getComplexityName(selection.provider, selection.complexity)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(selection.provider)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};