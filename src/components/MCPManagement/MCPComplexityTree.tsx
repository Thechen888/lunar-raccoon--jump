import { ChevronRight, ChevronDown, Check, Settings, Globe, Plus, Edit, Trash2, AlertTriangle, Layers } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MCPProviderConfig, MCPServiceConfig } from "./MCPProviderConfig";
import { EditProviderDialog } from "./EditProviderDialog";
import { EditRegionDialog } from "./EditRegionDialog";
import { EditComplexityDialog } from "./EditComplexityDialog";
import { toast } from "sonner";

export interface MCPService {
  id: string;
  name: string;
  description: string;
  url: string;
  headers?: string;
  status: "active" | "inactive";
  createdAt: string;
  tools?: any[];
  prompts?: any[];
}

export interface MCPComplexity {
  id: string;
  name: string;
  description?: string;
  service?: MCPServiceConfig;
}

export interface MCPRegion {
  id: string;
  name: string;
  complexities: MCPComplexity[];
  service?: MCPServiceConfig; // 二层模式下，区域上可以配置服务
}

export interface MCPProvider {
  id: string;
  name: string;
  layer: number; // 1, 2, or 3
  regions: MCPRegion[];
  service?: MCPServiceConfig; // 一层模式下，提供商上直接配置服务
}

interface MCPComplexityTreeProps {
  providers: MCPProvider[];
  onProvidersChange: (providers: MCPProvider[]) => void;
}

export const MCPComplexityTree = ({ providers, onProvidersChange }: MCPComplexityTreeProps) => {
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set(["pangu", "hub"]));
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [selectedComplexity, setSelectedComplexity] = useState<string | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configuringComplexity, setConfiguringComplexity] = useState<{
    providerId: string;
    regionId?: string;
    complexityId?: string;
    configTarget: "provider" | "region" | "complexity";
  } | null>(null);

  // 编辑对话框状态
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<MCPProvider | null>(null);
  const [providerMode, setProviderMode] = useState<"create" | "edit">("create");

  const [regionDialogOpen, setRegionDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<{ providerId: string; region: MCPRegion } | null>(null);
  const [regionMode, setRegionMode] = useState<"create" | "edit">("create");

  const [complexityDialogOpen, setComplexityDialogOpen] = useState(false);
  const [editingComplexity, setEditingComplexity] = useState<{
    providerId: string;
    regionId: string;
    complexity: MCPComplexity;
  } | null>(null);
  const [complexityMode, setComplexityMode] = useState<"create" | "edit">("create");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "provider" | "region" | "complexity";
    providerId?: string;
    regionId?: string;
    complexityId?: string;
    name: string;
  } | null>(null);

  const toggleProvider = (providerId: string) => {
    const newExpanded = new Set(expandedProviders);
    if (newExpanded.has(providerId)) {
      newExpanded.delete(providerId);
    } else {
      newExpanded.add(providerId);
    }
    setExpandedProviders(newExpanded);
  };

  const toggleRegion = (regionId: string) => {
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(regionId)) {
      newExpanded.delete(regionId);
    } else {
      newExpanded.add(regionId);
    }
    setExpandedRegions(newExpanded);
  };

  const handleSelectComplexity = (providerId: string, regionId: string, complexityId: string) => {
    setSelectedComplexity(`${providerId}-${regionId}-${complexityId}`);
  };

  // 打开配置对话框
  const handleOpenConfig = (providerId: string, configTarget: "provider" | "region" | "complexity", regionId?: string, complexityId?: string) => {
    setConfiguringComplexity({ providerId, regionId, complexityId, configTarget });
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = (config: MCPServiceConfig) => {
    if (!configuringComplexity) return;

    const newProviders = providers.map(provider => {
      if (provider.id !== configuringComplexity.providerId) return provider;
      
      if (configuringComplexity.configTarget === "provider") {
        return { ...provider, service: config };
      }
      
      if (configuringComplexity.configTarget === "region" && configuringComplexity.regionId) {
        return {
          ...provider,
          regions: provider.regions.map(region => {
            if (region.id !== configuringComplexity.regionId) return region;
            return { ...region, service: config };
          })
        };
      }
      
      if (configuringComplexity.configTarget === "complexity" && configuringComplexity.regionId && configuringComplexity.complexityId) {
        return {
          ...provider,
          regions: provider.regions.map(region => {
            if (region.id !== configuringComplexity.regionId) return region;
            return {
              ...region,
              complexities: region.complexities.map(complexity => {
                if (complexity.id !== configuringComplexity.complexityId) return complexity;
                return { ...complexity, service: config };
              })
            };
          })
        };
      }
      
      return provider;
    });

    onProvidersChange(newProviders);
    setConfigDialogOpen(false);
    setConfiguringComplexity(null);
    toast.success("服务配置已保存");
  };

  // 服务提供商操作
  const handleCreateProvider = (data: { id: string; name: string; layer: number }) => {
    const newProviders = [...providers, {
      id: data.id,
      name: data.name,
      layer: data.layer,
      regions: [],
      service: undefined
    }];
    onProvidersChange(newProviders);
    toast.success("服务提供商已添加");
  };

  const handleEditProvider = (data: { id: string; name: string; layer?: number }) => {
    if (!editingProvider) return;
    const newProviders = providers.map(p => 
      p.id === editingProvider.id ? { ...p, name: data.name } : p
    );
    onProvidersChange(newProviders);
    setEditingProvider(null);
    toast.success("服务提供商已更新");
  };

  const handleDeleteProvider = (providerId: string) => {
    const newProviders = providers.filter(p => p.id !== providerId);
    onProvidersChange(newProviders);
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
    toast.success("服务提供商已删除");
  };

  // 区域操作
  const handleCreateRegion = (data: { id: string; name: string }) => {
    if (!editingRegion) return;
    const newProviders = providers.map(provider => {
      if (provider.id !== editingRegion.providerId) return provider;
      return {
        ...provider,
        regions: [...provider.regions, {
          id: data.id,
          name: data.name,
          complexities: [],
          service: undefined
        }]
      };
    });
    onProvidersChange(newProviders);
    setEditingRegion(null);
    toast.success("区域已添加");
  };

  const handleEditRegion = (data: { id: string; name: string }) => {
    if (!editingRegion) return;
    const newProviders = providers.map(provider => {
      if (provider.id !== editingRegion.providerId) return provider;
      return {
        ...provider,
        regions: provider.regions.map(region => 
          region.id === editingRegion.region.id ? { ...region, name: data.name } : region
        )
      };
    });
    onProvidersChange(newProviders);
    setEditingRegion(null);
    toast.success("区域已更新");
  };

  const handleDeleteRegion = () => {
    if (!deleteTarget || !deleteTarget.providerId || !deleteTarget.regionId) return;
    const newProviders = providers.map(provider => {
      if (provider.id !== deleteTarget.providerId) return provider;
      return {
        ...provider,
        regions: provider.regions.filter(r => r.id !== deleteTarget.regionId)
      };
    });
    onProvidersChange(newProviders);
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
    toast.success("区域已删除");
  };

  // 复杂度操作
  const handleCreateComplexity = (data: { id: string; name: string; description?: string }) => {
    if (!editingComplexity) return;
    const newProviders = providers.map(provider => {
      if (provider.id !== editingComplexity.providerId) return provider;
      return {
        ...provider,
        regions: provider.regions.map(region => {
          if (region.id !== editingComplexity.regionId) return region;
          return {
            ...region,
            complexities: [...region.complexities, {
              id: data.id,
              name: data.name,
              description: data.description
            }]
          };
        })
      };
    });
    onProvidersChange(newProviders);
    setEditingComplexity(null);
    toast.success("复杂度级别已添加");
  };

  const handleEditComplexity = (data: { id: string; name: string; description?: string }) => {
    if (!editingComplexity) return;
    const newProviders = providers.map(provider => {
      if (provider.id !== editingComplexity.providerId) return provider;
      return {
        ...provider,
        regions: provider.regions.map(region => {
          if (region.id !== editingComplexity.regionId) return region;
          return {
            ...region,
            complexities: region.complexities.map(complexity =>
              complexity.id === editingComplexity.complexity.id 
                ? { ...complexity, name: data.name, description: data.description }
                : complexity
            )
          };
        })
      };
    });
    onProvidersChange(newProviders);
    setEditingComplexity(null);
    toast.success("复杂度级别已更新");
  };

  const handleDeleteComplexity = () => {
    if (!deleteTarget || !deleteTarget.providerId || !deleteTarget.regionId || !deleteTarget.complexityId) return;
    const newProviders = providers.map(provider => {
      if (provider.id !== deleteTarget.providerId) return provider;
      return {
        ...provider,
        regions: provider.regions.map(region => {
          if (region.id !== deleteTarget.regionId) return region;
          return {
            ...region,
            complexities: region.complexities.filter(c => c.id !== deleteTarget.complexityId)
          };
        })
      };
    });
    onProvidersChange(newProviders);
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
    toast.success("复杂度级别已删除");
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    switch (deleteTarget.type) {
      case "provider":
        handleDeleteProvider(deleteTarget.providerId!);
        break;
      case "region":
        handleDeleteRegion();
        break;
      case "complexity":
        handleDeleteComplexity();
        break;
    }
  };

  const isComplexitySelected = (providerId: string, regionId: string, complexityId: string) => {
    return selectedComplexity === `${providerId}-${regionId}-${complexityId}`;
  };

  const getLayerBadge = (layer: number) => {
    const labels = { 1: "一层", 2: "二层", 3: "三层" };
    return labels[layer as keyof typeof labels] || "三层";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">
          点击展开/折叠，使用右侧按钮进行编辑和配置
        </p>
      </div>

      {providers.map((provider) => (
        <Card key={provider.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div
                className="flex items-center space-x-2 cursor-pointer flex-1"
                onClick={() => toggleProvider(provider.id)}
              >
                {expandedProviders.has(provider.id) ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <CardTitle className="text-lg">{provider.name}</CardTitle>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Layers className="h-3 w-3" />
                  <span>{getLayerBadge(provider.layer)}</span>
                </Badge>
                {provider.service && (
                  <Badge variant="secondary" className="text-xs">已配置</Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {provider.layer === 1 && (
                  <Badge variant="outline">{provider.regions.length} 个区域（不使用）</Badge>
                )}
                {provider.layer === 2 && (
                  <Badge variant="outline">{provider.regions.length} 个区域</Badge>
                )}
                {provider.layer === 3 && (
                  <Badge variant="outline">{provider.regions.length} 个区域</Badge>
                )}
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  setEditingProvider(provider);
                  setProviderMode("edit");
                  setProviderDialogOpen(true);
                }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget({
                    type: "provider",
                    providerId: provider.id,
                    name: provider.name
                  });
                  setDeleteDialogOpen(true);
                }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenConfig(provider.id, "provider");
                  }}
                  title="配置服务"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {expandedProviders.has(provider.id) && provider.layer > 1 && (
            <CardContent className="pl-6 space-y-2">
              {provider.regions.map((region) => (
                <div key={region.id} className="border-l-2 border-border pl-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center space-x-2 cursor-pointer py-2 flex-1"
                      onClick={() => toggleRegion(region.id)}
                    >
                      {expandedRegions.has(region.id) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium text-sm">{region.name}</span>
                      {region.service && (
                        <Badge variant="secondary" className="text-xs">已配置</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {provider.layer === 2 && region.complexities.some(c => c.service) && (
                        <Badge variant="secondary" className="text-xs">
                          子层已配置
                        </Badge>
                      )}
                      {provider.layer === 3 && region.complexities.some(c => c.service) && (
                        <Badge variant="secondary" className="text-xs">
                          已配置
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditingRegion({ providerId: provider.id, region });
                        setRegionMode("edit");
                        setRegionDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setDeleteTarget({
                          type: "region",
                          providerId: provider.id,
                          regionId: region.id,
                          name: region.name
                        });
                        setDeleteDialogOpen(true);
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      {/* 二层模式下，区域上可以配置服务 */}
                      {provider.layer === 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenConfig(provider.id, "region", region.id)}
                          title="配置服务"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 三层模式显示复杂度 */}
                  {provider.layer === 3 && expandedRegions.has(region.id) && (
                    <div className="space-y-2 mt-2">
                      {region.complexities.map((complexity) => (
                        <div
                          key={complexity.id}
                          className={`p-3 border rounded-lg transition-all ${
                            isComplexitySelected(provider.id, region.id, complexity.id)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1">
                              {isComplexitySelected(provider.id, region.id, complexity.id) && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                              <span className="text-sm font-medium">{complexity.name}</span>
                              {complexity.description && (
                                <span className="text-xs text-muted-foreground">
                                  - {complexity.description}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {complexity.service && (
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <Globe className="h-3 w-3" />
                                  <code className="bg-muted px-2 py-0.5 rounded max-w-[150px] truncate">
                                    {complexity.service.url}
                                  </code>
                                </div>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingComplexity({
                                    providerId: provider.id,
                                    regionId: region.id,
                                    complexity
                                  });
                                  setComplexityMode("edit");
                                  setComplexityDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteTarget({
                                    type: "complexity",
                                    providerId: provider.id,
                                    regionId: region.id,
                                    complexityId: complexity.id,
                                    name: complexity.name
                                  });
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenConfig(provider.id, "complexity", region.id, complexity.id)}
                                title="配置服务"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* 添加复杂度按钮 */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          setEditingComplexity({
                            providerId: provider.id,
                            regionId: region.id,
                            complexity: { id: "", name: "", description: "" }
                          });
                          setComplexityMode("create");
                          setComplexityDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        添加复杂度级别
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {/* 添加区域按钮 - 只在二层和三层模式下显示 */}
              {provider.layer > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => {
                    setEditingRegion({
                      providerId: provider.id,
                      region: { id: "", name: "", complexities: [] }
                    });
                    setRegionMode("create");
                    setRegionDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加区域
                </Button>
              )}
            </CardContent>
          )}
        </Card>
      ))}

      {/* 添加服务提供商按钮 */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setEditingProvider(null);
          setProviderMode("create");
          setProviderDialogOpen(true);
        }}
      >
        <Plus className="h-4 w-4 mr-2" />
        添加服务提供商
      </Button>

      {/* 配置对话框 */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>配置服务</DialogTitle>
          </DialogHeader>
          {configuringComplexity && (
            <MCPProviderConfig
              initialData={(() => {
                const provider = providers.find(p => p.id === configuringComplexity.providerId);
                if (configuringComplexity.configTarget === "provider") {
                  return provider?.service;
                }
                if (configuringComplexity.configTarget === "region" && configuringComplexity.regionId) {
                  const region = provider?.regions.find(r => r.id === configuringComplexity.regionId);
                  return region?.service;
                }
                if (configuringComplexity.configTarget === "complexity" && configuringComplexity.regionId && configuringComplexity.complexityId) {
                  const region = provider?.regions.find(r => r.id === configuringComplexity.regionId);
                  const complexity = region?.complexities.find(c => c.id === configuringComplexity.complexityId);
                  return complexity?.service;
                }
                return undefined;
              })()}
              onSave={handleSaveConfig}
              onCancel={() => {
                setConfigDialogOpen(false);
                setConfiguringComplexity(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 服务提供商编辑对话框 */}
      <EditProviderDialog
        open={providerDialogOpen}
        onOpenChange={setProviderDialogOpen}
        provider={editingProvider}
        onSave={providerMode === "create" ? handleCreateProvider : handleEditProvider}
        mode={providerMode}
      />

      {/* 区域编辑对话框 */}
      <EditRegionDialog
        open={regionDialogOpen}
        onOpenChange={setRegionDialogOpen}
        region={editingRegion?.region || null}
        onSave={regionMode === "create" ? handleCreateRegion : handleEditRegion}
        mode={regionMode}
      />

      {/* 复杂度编辑对话框 */}
      <EditComplexityDialog
        open={complexityDialogOpen}
        onOpenChange={setComplexityDialogOpen}
        complexity={editingComplexity?.complexity || null}
        onSave={complexityMode === "create" ? handleCreateComplexity : handleEditComplexity}
        mode={complexityMode}
      />

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>确认删除</span>
            </DialogTitle>
            <DialogDescription>
              确定要删除 "{deleteTarget?.name}" 吗？此操作不可撤销。
              {deleteTarget?.type === "provider" && " 删除服务提供商将同时删除其所有区域和复杂度级别。"}
              {deleteTarget?.type === "region" && " 删除区域将同时删除其所有复杂度级别。"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};