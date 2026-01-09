import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, ChevronDown, Check, Info } from "lucide-react";
import { useState } from "react";

// 新的选择结构：provider -> regions[] -> complexity
export interface MCPSelection {
  providerId: string;
  regionIds: string[];  // 多选区域
  complexityId: string; // 单选复杂度
}

interface MCPProvider {
  id: string;
  name: string;
  description: string;
  regions?: Array<{ id: string; name: string }>;
  complexityLevels?: Array<{ id: string; name: string; description: string }>;
}

interface MCPSelectorProps {
  onSelect: (selection: MCPSelection[]) => void;
  selectedMCPs: MCPSelection[];
  providers: MCPProvider[];
}

export const MCPSelector = ({ onSelect, selectedMCPs, providers }: MCPSelectorProps) => {
  // 聚合选择逻辑：
  // selectedMCPs = [
  //   { providerId: "pangu", regionIds: ["china", "europe"], complexityId: "simple" },
  //   { providerId: "hub", regionIds: ["usa"], complexityId: "complex" }
  // ]
  // 
  // 这意味着：
  // - PANGU: China + 欧洲 -> 精简（已配置）
  // - HUB: 美国 -> 复杂（已配置）
  //
  // 在对话中会实际选中的服务：
  // - pangu-china-simple
  // - pangu-europe-simple
  // - hub-usa-complex

  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());

  const toggleProvider = (providerId: string) => {
    const newExpanded = new Set(expandedProviders);
    if (newExpanded.has(providerId)) {
      newExpanded.delete(providerId);
    } else {
      newExpanded.add(providerId);
    }
    setExpandedProviders(newExpanded);
  };

  // 检查提供商是否被选中
  const isProviderSelected = (providerId: string) => {
    return selectedMCPs.some(s => s.providerId === providerId);
  };

  // 检查区域是否被选中
  const isRegionSelected = (providerId: string, regionId: string) => {
    const selection = selectedMCPs.find(s => s.providerId === providerId);
    return selection?.regionIds.includes(regionId) || false;
  };

  // 检查复杂度是否被选中
  const isComplexitySelected = (providerId: string, complexityId: string) => {
    const selection = selectedMCPs.find(s => s.providerId === providerId);
    return selection?.complexityId === complexityId;
  };

  // 处理提供商选择（单选）
  const handleToggleProvider = (providerId: string) => {
    const newSelections = [...selectedMCPs];
    const index = newSelections.findIndex(s => s.providerId === providerId);
    
    if (index >= 0) {
      newSelections.splice(index, 1);
    } else {
      newSelections.push({
        providerId,
        regionIds: [],
        complexityId: ""
      });
    }
    
    onSelect(newSelections);
  };

  // 处理区域选择（多选）
  const handleToggleRegion = (providerId: string, regionId: string) => {
    const newSelections = selectedMCPs.map(s => {
      if (s.providerId !== providerId) return s;
      
      const newRegionIds = s.regionIds.includes(regionId)
        ? s.regionIds.filter(id => id !== regionId)
        : [...s.regionIds, regionId];
      
      return { ...s, regionIds: newRegionIds };
    });
    
    onSelect(newSelections);
  };

  // 处理复杂度选择（单选）
  const handleToggleComplexity = (providerId: string, complexityId: string) => {
    const newSelections = selectedMCPs.map(s => {
      if (s.providerId !== providerId) return s;
      return { ...s, complexityId: complexityId === s.complexityId ? "" : complexityId };
    });
    
    onSelect(newSelections);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium">选择 MCP 服务</span>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          <span>服务商单选，区域多选，复杂度单选</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {providers.map((provider) => {
          const providerSelected = isProviderSelected(provider.id);
          const providerSelection = selectedMCPs.find(s => s.providerId === provider.id);
          
          return (
            <div
              key={provider.id}
              className="border rounded-lg overflow-hidden"
            >
              {/* 第一层：服务提供商（单选） */}
              <div
                className={`p-3 cursor-pointer transition-colors flex items-center justify-between ${
                  providerSelected ? "bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => {
                  handleToggleProvider(provider.id);
                  if (!expandedProviders.has(provider.id)) {
                    toggleProvider(provider.id);
                  }
                }}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Checkbox 
                    checked={providerSelected}
                    onCheckedChange={() => {
                      handleToggleProvider(provider.id);
                      if (!expandedProviders.has(provider.id)) {
                        toggleProvider(provider.id);
                      }
                    }}
                    className="mt-0.5"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <span className={`text-sm font-medium ${providerSelected ? "text-primary" : ""}`}>
                      {provider.name}
                    </span>
                    {providerSelected && <Check className="h-3 w-3 text-primary" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{provider.description}</span>
                </div>
                {expandedProviders.has(provider.id) ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-2" />
                )}
              </div>

              {/* 第二层：区域（多选） */}
              {expandedProviders.has(provider.id) && (
                <div className="border-t bg-muted/20 p-2 space-y-1">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-2">
                    <span>区域（多选）:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {provider.regions?.map((region) => {
                      const regionSelected = isRegionSelected(provider.id, region.id);
                      return (
                        <div
                          key={region.id}
                          className={`p-2 rounded cursor-pointer transition-colors text-xs ${
                            regionSelected ? "bg-primary/10 border border-primary/30" : "border border-transparent hover:border-border"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRegion(provider.id, region.id);
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              checked={regionSelected}
                              onCheckedChange={() => handleToggleRegion(provider.id, region.id)}
                              className="h-3 w-3"
                            />
                            <span>{region.name}</span>
                            {regionSelected && <Check className="h-3 w-3 text-primary" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 第三层：复杂度（单选） */}
              {expandedProviders.has(provider.id) && (
                <div className="border-t bg-muted/20 p-2">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-2">
                    <span>复杂度（单选）:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {provider.complexityLevels?.map((level) => {
                      const levelSelected = isComplexitySelected(provider.id, level.id);
                      return (
                        <div
                          key={level.id}
                          className={`p-2 rounded cursor-pointer transition-colors text-xs ${
                            levelSelected ? "bg-primary/10 border border-primary/30" : "border border-transparent hover:border-border"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplexity(provider.id, level.id);
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              checked={levelSelected}
                              onCheckedChange={() => handleToggleComplexity(provider.id, level.id)}
                              className="h-3 w-3"
                            />
                            <span>{level.name}</span>
                            {levelSelected && <Check className="h-3 w-3 text-primary" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 已选摘要 */}
      {selectedMCPs.length > 0 && (
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">已选择:</p>
          <div className="space-y-2">
            {selectedMCPs.map((selection) => {
              const provider = providers.find(p => p.id === selection.providerId);
              const selectedRegions = provider?.regions?.filter(r => selection.regionIds.includes(r.id)) || [];
              const selectedComplexity = provider?.complexityLevels?.find(c => c.id === selection.complexityId);
              
              // 计算实际选中的服务数量
              const selectedServicesCount = selection.regionIds.length;
              
              return (
                <div key={selection.providerId} className="bg-primary/5 p-2 rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{provider?.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedComplexity?.name}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedRegions.map((region) => (
                      <Badge key={region.id} variant="secondary" className="text-xs">
                        {region.name}
                      </Badge>
                    ))}
                  </div>
                  {selectedServicesCount > 1 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      共 {selectedServicesCount} 个区域使用 {selectedComplexity?.name} 模式
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};