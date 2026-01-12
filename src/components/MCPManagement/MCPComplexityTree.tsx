import { ChevronRight, ChevronDown, Check, Settings, Globe, Plus, Edit, Trash2, AlertTriangle, Layers, Eye } from "lucide-react";
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
  service?: MCPServiceConfig;
}

export interface MCPProvider {
  id: string;
  name: string;
  layer: number;
  regions: MCPRegion[];
  service?: MCPServiceConfig;
}

interface MCPComplexityTreeProps {
  providers: MCPProvider[];
  onProvidersChange: (providers: MCPProvider[]) => void;
  onServiceDetail: (service: MCPService) => void;
}

export const MCPComplexityTree = ({ providers, onProvidersChange, onServiceDetail }: MCPComplexityTreeProps) => {
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

  // 将层级结构转换为服务列表
  const convertToServices = (providers: MCPProvider[]): MCPService[] => {
    const services: MCPService[] = [];
    
    providers.forEach(provider => {
      if (provider.layer === 1 && provider.service) {
        services.push({
          id: provider.id,
          name: provider.service.name,
          description: provider.service.description || "",
          url: provider.service.url,
          headers: provider.service.headers,
          status: "active",
          createdAt: "2024-01-01",
          tools: [],
          prompts: []
        });
      } else if (provider.layer === 2) {
        provider.regions.forEach(region => {
          if (region.service) {
            services.push({
              id: `${provider.id}-${region.id}`,
              name: region.service.name,
              description: region.service.description || "",
              url: region.service.url,
              headers: region.service.headers,
              status: "active",
              createdAt: "2024-01-01",
              tools: [],
              prompts: []
            });
          }
        });
      } else if (provider.layer === 3) {
        provider.regions.forEach(region => {
          region.complexities.forEach(complexity => {
            if (complexity.service) {
              services.push({
                id: `${provider.id}-${region.id}-${complexity.id}`,
                name: complexity.service.name,
                description: complexity.service.description || "",
                url: complexity.service.url,
                headers: complexity.service.headers,
                status: "active",
                createdAt: "2024-01-01",
                tools: [],
                prompts: []
              });
            }
          });
        });
      }
    });
    
    return services;
  };

  // 获取服务ID
  const getServiceId = (providerId: string, regionId?: string, complexityId?: string): string | null => {
    const services = convertToServices(providers);
    if (regionId && complexityId) {
      return services.find(s => s.id === `${providerId}-${regionId}-${complexityId}`)?.id || null;
    } else if (regionId) {
      return services.find(s => s.id === `${providerId}-${regionId}`)?.id || null;
    } else {
      return services.find(s => s.id === providerId)?.id || null;
    }
  };

  // 计算提供商的配置状态
  const getProviderConfigStatus = (provider: MCPProvider) => {
    if (provider.layer === 1) {
      // 一层：直接检查提供商的服务
      return { allConfigured: !!provider.service, unconfiguredCount: provider.service ? 0 : 1 };
    }
    
    if (provider.layer === 2) {
      // 二层：检查所有区域的服务
      let unconfiguredCount = 0;
      provider.regions.forEach(region => {
        if (!region.service) unconfiguredCount++;
      });
      return { allConfigured: unconfiguredCount === 0, unconfiguredCount };
    }
    
    if (provider.layer === 3) {
      // 三层：检查所有复杂度的服务
      let unconfiguredCount = 0;
      provider.regions.forEach(region => {
        region.complexities.forEach(complexity => {
          if (!complexity.service) unconfiguredCount++;
        });
      });
      return { allConfigured: unconfiguredCount === 0, unconfiguredCount };
    }
    
    return { allConfigured: false, unconfiguredCount: 0 };
  };

  const toggleProvider = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider || provider.layer === 1) return; // 一层不展开
    
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

      {providers.map((provider) => {
        const configStatus = getProviderConfigStatus(provider);
        const canExpand = provider.layer > 1;

        return (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center space-x-2 flex-1 ${canExpand ? "cursor-pointer" : ""}`}
                  onClick={() => toggleProvider(provider.id)}
                >
                  {canExpand ? (
                    expandedProviders.has(provider.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                  <CardTitle className="text-lg">{provider.name}</CardTitle>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Layers className="h-3 w-3" />
                    <span>{getLayerBadge(provider.layer)}</span>
                  </Badge>
                  {/* 配置状态显示在最外层 */}
                  {configStatus.allConfigured ? (
                    <Badge variant="default" className="text-xs">已配置</Badge>
                  ) : configStatus.unconfiguredCount > 0 ? (
                    <Badge variant="secondary" className="text-xs">未配置 {configStatus.unconfiguredCount}</Badge>
                  ) : null}
                </div>
                <div className="flex items-center space-x-2">
                  {/* 一层：配置了服务后显示详情按钮 */}
                  {provider.layer === 1 && provider.service && (
                    <Button variant="ghost" size="sm" onClick={() => {
                      const serviceId = getServiceId(provider.id);
                      if (serviceId) {
                        const service = convertToServices(providers).find(s => s.id === serviceId);
                        if (service) onServiceDetail(service);
                      }
                    }} title="查看详情">
                      <Eye className="h-4 w-4" />
                    </Button>
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
            
            {/* 二层和三层模式下显示区域 */}
            {canExpand && expandedProviders.has(provider.id) && (
              <CardContent className="pl-6 space-y-2">
                {provider.regions.map((region) => {
                  const regionCanExpand = provider.layer === 3;

                  return (
                    <div key={region.id} className="border-l-2 border-border pl-4">
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex items-center space-x-2 py-2 flex-1 ${regionCanExpand ? "cursor-pointer" : ""}`}
                          onClick={() => toggleRegion(region.id)}
                        >
                          {regionCanExpand ? (
                            expandedRegions.has(region.id) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                          <span className="font-medium text-sm">{region.name}</span>
                          {region.service && (
                            <Badge variant="secondary" className="text-xs">已配置</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* 二层：配置了服务后显示详情按钮 */}
                          {provider.layer === 2 && region.service && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const serviceId = getServiceId(provider.id, region.id);
                                if (serviceId) {
                                  const service = convertToServices(providers).find(s => s.id === serviceId);
                                  if (service) onServiceDetail(service);
                                }
                              }}
                              title="查看详情"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
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
                        </div>
                      </div>

                      {/* 三层模式显示复杂度 */}
                      {regionCanExpand && expandedRegions.has(region.id) && (
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
                                  {/* 三层：配置了服务后显示详情按钮 */}
                                  {complexity.service && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const serviceId = getServiceId(provider.id, region.id, complexity.id);
                                        if (serviceId) {
                                          const service = convertToServices(providers).find(s => s.id === serviceId);
                                          if (service) onServiceDetail(service);
                                        }
                                      }}
                                      title="查看详情"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
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
                  );
                })}

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
              </CardContent>
            )}
          </Card>
        );
      })}

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

      <EditProviderDialog
        open={providerDialogOpen}
        onOpenChange={setProviderDialogOpen}
        provider={editingProvider}
        onSave={providerMode === "create" ? handleCreateProvider : handleEditProvider}
        mode={providerMode}
      />

      <EditRegionDialog
        open={regionDialogOpen}
        onOpenChange={setRegionDialogOpen}
        region={editingRegion?.region || null}
        onSave={regionMode === "create" ? handleCreateRegion : handleEditRegion}
        mode={regionMode}
      />

      <EditComplexityDialog
        open={complexityDialogOpen}
        onOpenChange={setComplexityDialogOpen}
        complexity={editingComplexity?.complexity || null}
        onSave={complexityMode === "create" ? handleCreateComplexity : handleEditComplexity}
        mode={complexityMode}
      />

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