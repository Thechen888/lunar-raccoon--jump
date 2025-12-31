import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, ChevronDown } from "lucide-react";
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
  const [tempSelections, setTempSelections] = useState<Record<string, { regions: string[]; complexity: string }>>({});

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
    <div className="space-y-3">
      <Accordion type="multiple" className="w-full">
        {mcpProviders.map((provider) => {
          const selectedMCP = selectedMCPs.find(s => s.provider === provider.id);
          const temp = tempSelections[provider.id] || { regions: [], complexity: provider.complexityLevels[0]?.id || "" };
          const isSelected = selectedMCP !== undefined;

          return (
            <AccordionItem key={provider.id} value={provider.id} className="border rounded-lg px-3">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center justify-between flex-1 pr-4">
                  <div className="flex items-center space-x-2">
                    {isSelected && <Check className="h-4 w-4 text-green-500" />}
                    <span className={isSelected ? "text-green-600 font-medium text-sm" : "text-sm"}>{provider.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isSelected && (
                      <Badge variant="default" className="text-xs scale-75">
                        {selectedMCP.regions.length}区域
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <div>
                    <Label className="text-xs font-medium mb-1 block">区域选择</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {provider.regions.map((region) => {
                        const isChecked = temp.regions.includes(region.id);
                        return (
                          <div
                            key={region.id}
                            className={`flex items-center justify-center space-x-1 p-2 border rounded-md cursor-pointer transition-colors text-xs ${
                              isChecked ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => handleRegionToggle(provider.id, region.id)}
                          >
                            <Checkbox checked={isChecked} className="scale-75" />
                            <span className="text-xs">{region.name}</span>
                            {isChecked && <Check className="h-3 w-3 text-primary ml-auto" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium mb-1 block">复杂度</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {provider.complexityLevels.map((level) => (
                        <div
                          key={level.id}
                          className={`p-2 border rounded-md cursor-pointer transition-colors ${
                            temp.complexity === level.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => handleComplexityChange(provider.id, level.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">{level.name}</span>
                            {temp.complexity === level.id && <Check className="h-3 w-3 text-primary" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-1">
                    {isSelected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => handleApply(provider.id)}
                          disabled={temp.regions.length === 0}
                        >
                          更新
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleRemove(provider.id)}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="flex-1 h-8 text-xs"
                        onClick={() => handleApply(provider.id)}
                        disabled={temp.regions.length === 0}
                      >
                        确认
                      </Button>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};