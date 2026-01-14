import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, Plus, Settings, Trash2, Layers, Server, Globe, Zap } from "lucide-react";
import { toast } from "sonner";
import { MCPProviderConfig } from "./MCPProviderConfig";
import { EditProviderDialog } from "./EditProviderDialog";
import { EditRegionDialog } from "./EditRegionDialog";
import { EditComplexityDialog } from "./EditComplexityDialog";

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

export interface MCPProvider {
  id: string;
  name: string;
  layer: number;
  regions: MCPRegion[];
  service?: MCPServiceConfig;
}

export interface MCPRegion {
  id: string;
  name: string;
  complexities?: MCPComplexity[];
  service?: MCPServiceConfig;
}

export interface MCPComplexity {
  id: string;
  name: string;
  description?: string;
  service?: MCPServiceConfig;
}

interface MCPComplexityTreeProps {
  providers: MCPProvider[];
  onProvidersChange: (providers: MCPProvider[]) => void;
}

export const MCPComplexityTree = ({ providers, onProvidersChange }: MCPComplexityTreeProps) => {
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  // 对话框状态
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [isRegionDialogOpen, setIsRegionDialogOpen] = useState(false);
  const [isComplexityDialogOpen, setIsComplexityDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingProvider, setEditingProvider] = useState<MCPProvider | null>(null);
  const [editingRegion, setEditingRegion] = useState<{ providerId: string; region: MCPRegion } | null>(null);
  const [editingComplexity, setEditingComplexity] = useState<{ providerId: string; regionId: string; complexity: MCPComplexity } | null>(null);

  // 删除确认对话框
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "provider" | "region" | "complexity"; id: string } | null>(null);

  // 配置服务对话框
  const [configServiceTarget, setConfigServiceTarget] = useState<{ providerId: string; regionId?: string; complexityId?: string } | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  // 选择复杂度删除对话框
  const [isSelectComplexityDialogOpen, setIsSelectComplexityDialogOpen] = useState(false);
  const [deleteProviderId, setDeleteProviderId] = useState<string>("");
  const [selectedComplexitiesForDelete, setSelectedComplexitiesForDelete] = useState<Set<string>>(new Set());

  // Provider 相关操作
  const handleToggleProvider = (providerId: string) => {
    const newExpanded = new Set(expandedProviders);
    if (newExpanded.has(providerId)) {
      newExpanded.delete(providerId);
    } else {
      newExpanded.add(providerId);
    }
    setExpandedProviders(newExpanded);
  };

  const handleAddProvider = () => {
    setDialogMode("create");
    setEditingProvider(null);
    setIsProviderDialogOpen(true);
  };

  const handleEditProvider = (provider: MCPProvider) => {
    setDialogMode("edit");
    setEditingProvider(provider);
    setIsProviderDialogOpen(true);
  };

  const handleDeleteProvider = (providerId: string) => {
    setDeleteConfirm({ type: "provider", id: providerId });
  };

  const handleConfirmDeleteProvider = () => {
    if (!deleteConfirm) return;
    const newProviders = providers.filter(p => p.id !== deleteConfirm.id);
    onProvidersChange(newProviders);
    setDeleteConfirm(null);
    toast.success("提供商已删除");
  };

  const handleConfigProviderService = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider?.layer === 1) {
      setConfigServiceTarget({ providerId });
      setIsConfigDialogOpen(true);
    } else {
      toast.error("仅一层模式可以在提供商上配置服务");
    }
  };

  // Region 相关操作
  const handleToggleRegion = (providerId: string, regionId: string) => {
    const key = `${providerId}-${regionId}`;
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRegions(newExpanded);
  };

  const handleAddRegion = (providerId: string) => {
    setDialogMode("create");
    setEditingRegion({ providerId, region: { id: "", name: "" } });
    setIsRegionDialogOpen(true);
  };

  const handleEditRegion = (providerId: string, region: MCPRegion) => {
    setDialogMode("edit");
    setEditingRegion({ providerId, region });
    setIsRegionDialogOpen(true);
  };

  const handleDeleteRegion = (providerId: string, regionId: string) => {
    setDeleteConfirm({ type: "region", id: `${providerId}-${regionId}` });
  };

  const handleConfirmDeleteRegion = () => {
    if (!deleteConfirm) return;
    const [providerId, regionId] = deleteConfirm.id.split('-');
    const newProviders = providers.map(p => {
      if (p.id !== providerId) return p;
      return {
        ...p,
        regions: p.regions.filter(r => r.id !== regionId)
      };
    });
    onProvidersChange(newProviders);
    setDeleteConfirm(null);
    toast.success("区域已删除");
  };

  const handleConfigRegionService = (providerId: string, regionId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider?.layer === 2) {
      setConfigServiceTarget({ providerId, regionId });
      setIsConfigDialogOpen(true);
    } else {
      toast.error("仅二层模式可以在区域上配置服务");
    }
  };

  // Complexity 相关操作
  const handleAddComplexity = (providerId: string, regionId: string) => {
    setDialogMode("create");
    setEditingComplexity({ providerId, regionId, complexity: { id: "", name: "" } });
    setIsComplexityDialogOpen(true);
  };

  const handleEditComplexity = (providerId: string, regionId: string, complexity: MCPComplexity) => {
    setDialogMode("edit");
    setEditingComplexity({ providerId, regionId, complexity });
    setIsComplexityDialogOpen(true);
  };

  const handleDeleteComplexity = (providerId: string, regionId: string, complexityId: string) => {
    setDeleteConfirm({ type: "complexity", id: `${providerId}-${regionId}-${complexityId}` });
  };

  const handleConfirmDeleteComplexity = () => {
    if (!deleteConfirm || deleteConfirm.type !== "complexity") return;
    const [providerId, regionId, complexityId] = deleteConfirm.id.split('-');
    const newProviders = providers.map(p => {
      if (p.id !== providerId) return p;
      return {
        ...p,
        regions: p.regions.map(r => {
          if (r.id !== regionId) return r;
          return {
            ...r,
            complexities: r.complexities?.filter(c => c.id !== complexityId)
          };
        })
      };
    });
    onProvidersChange(newProviders);
    setDeleteConfirm(null);
    toast.success("复杂度已删除");
  };

  const handleConfigComplexityService = (providerId: string, regionId: string, complexityId: string) => {
    setConfigServiceTarget({ providerId, regionId, complexityId });
    setIsConfigDialogOpen(true);
  };

  // Service 配置相关操作
  const handleSaveServiceConfig = (config: MCPServiceConfig) => {
    if (!configServiceTarget) return;
    const { providerId, regionId, complexityId } = configServiceTarget;
    
    const newProviders = providers.map(provider => {
      if (provider.id !== providerId) return provider;
      
      if (!regionId) {
        return { ...provider, service: config };
      }
      
      if (!complexityId) {
        return {
          ...provider,
          regions: provider.regions.map(region => 
            region.id === regionId ? { ...region, service: config } : region
          )
        };
      }
      
      return {
        ...provider,
        regions: provider.regions.map(region => 
          region.id === regionId ? {
            ...region,
            complexities: region.complexities?.map(complexity =>
              complexity.id === complexityId ? { ...complexity, service: config } : complexity
            )
          } : region
        )
      };
    });
    
    onProvidersChange(newProviders);
    setIsConfigDialogOpen(false);
    setConfigServiceTarget(null);
    toast.success("服务配置已保存");
  };

  // 统一删除复杂度
  const handleOpenSelectComplexityDialog = (providerId: string) => {
    setDeleteProviderId(providerId);
    setSelectedComplexitiesForDelete(new Set());
    setIsSelectComplexityDialogOpen(true);
  };

  const handleToggleComplexityForDelete = (complexityName: string) => {
    const newSelected = new Set(selectedComplexitiesForDelete);
    if (newSelected.has(complexityName)) {
      newSelected.delete(complexityName);
    } else {
      newSelected.add(complexityName);
    }
    setSelectedComplexitiesForDelete(newSelected);
  };

  const handleConfirmDeleteDialogOpen = () => {
    if (selectedComplexitiesForDelete.size === 0) {
      toast.error("请至少选择一个复杂度");
      return;
    }
    
    const newProviders = providers.map(provider => {
      if (provider.id !== deleteProviderId) return provider;
      
      return {
        ...provider,
        regions: provider.regions.map(region => ({
          ...region,
          complexities: region.complexities?.filter(complexity => 
            !selectedComplexitiesForDelete.has(complexity.name)
          )
        }))
      };
    });
    
    onProvidersChange(newProviders);
    setIsSelectComplexityDialogOpen(false);
    setSelectedComplexitiesForDelete(new Set());
    toast.success(`已删除 ${selectedComplexitiesForDelete.size} 个复杂度级别`);
  };

  // 保存编辑
  const handleSaveProvider = (data: { id: string; name: string; layer: number }) => {
    if (dialogMode === "create") {
      const newProvider: MCPProvider = {
        id: data.id,
        name: data.name,
        layer: data.layer,
        regions: []
      };
      onProvidersChange([...providers, newProvider]);
      toast.success("提供商已添加");
    } else {
      const newProviders = providers.map(p => 
        p.id === editingProvider?.id ? { ...p, name: data.name, layer: data.layer } : p
      );
      onProvidersChange(newProviders);
      toast.success("提供商已更新");
    }
    setIsProviderDialogOpen(false);
  };

  const handleSaveRegion = (data: { id: string; name: string }) => {
    const { providerId } = editingRegion || {};
    if (!providerId) return;

    if (dialogMode === "create") {
      const newProviders = providers.map(p => {
        if (p.id !== providerId) return p;
        return {
          ...p,
          regions: [...p.regions, { id: data.id, name: data.name }]
        };
      });
      onProvidersChange(newProviders);
      toast.success("区域已添加");
    } else {
      const newProviders = providers.map(p => {
        if (p.id !== providerId) return p;
        return {
          ...p,
          regions: p.regions.map(r => r.id === editingRegion?.region.id ? { ...r, name: data.name } : r)
        };
      });
      onProvidersChange(newProviders);
      toast.success("区域已更新");
    }
    setIsRegionDialogOpen(false);
  };

  const handleSaveComplexity = (data: { id: string; name: string; description?: string }) => {
    const { providerId, regionId } = editingComplexity || {};
    if (!providerId || !regionId) return;

    if (dialogMode === "create") {
      const newProviders = providers.map(p => {
        if (p.id !== providerId) return p;
        return {
          ...p,
          regions: p.regions.map(r => {
            if (r.id !== regionId) return r;
            return {
              ...r,
              complexities: [...(r.complexities || []), data]
            };
          })
        };
      });
      onProvidersChange(newProviders);
      toast.success("复杂度已添加");
    } else {
      const newProviders = providers.map(p => {
        if (p.id !== providerId) return p;
        return {
          ...p,
          regions: p.regions.map(r => {
            if (r.id !== regionId) return r;
            return {
              ...r,
              complexities: r.complexities?.map(c => 
                c.id === editingComplexity?.complexity.id ? { ...c, ...data } : c
              )
            };
          })
        };
      });
      onProvidersChange(newProviders);
      toast.success("复杂度已更新");
    }
    setIsComplexityDialogOpen(false);
  };

  // 获取服务配置
  const getServiceConfig = (providerId: string, regionId?: string, complexityId?: string): MCPServiceConfig | undefined => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return undefined;

    if (!regionId) {
      return provider.service;
    }

    const region = provider.regions.find(r => r.id === regionId);
    if (!region) return undefined;

    if (!complexityId) {
      return region.service;
    }

    return region.complexities?.find(c => c.id === complexityId)?.service;
  };

  // 搜索过滤
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (!searchTerm) return true;

    const regionMatches = provider.regions.some(region =>
      region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      region.complexities?.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return regionMatches;
  });

  // 获取所有唯一的复杂度名称
  const getAllComplexityNames = (providerId: string): string[] => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return [];
    
    const complexityNames = new Set<string>();
    provider.regions.forEach(region => {
      region.complexities?.forEach(c => {
        complexityNames.add(c.name);
      });
    });
    
    return Array.from(complexityNames);
  };

  return (
    <div className="space-y-6">
      {/* Provider 列表 */}
      <div className="space-y-4">
        {filteredProviders.map((provider) => {
          const hasRegions = provider.regions.length > 0;
          const hasComplexities = provider.regions.some(r => r.complexities && r.complexities.length > 0);
          const isExpanded = expandedProviders.has(provider.id);
          const hasServiceConfig = provider.service || provider.regions.some(r => r.service || r.complexities?.some(c => c.service));
          
          return (
            <Card key={provider.id} className={hasServiceConfig ? "border-primary/30" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {provider.layer === 1 ? "一层" : provider.layer === 2 ? "二层" : "三层"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span>{hasRegions ? `${provider.regions.length} 个区域` : "无区域"}</span>
                        {hasComplexities && <span>包含复杂度</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {provider.layer === 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleConfigProviderService(provider.id)}
                        title={provider.service ? "编辑服务配置" : "配置服务"}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* 三层结构：统一删除复杂度按钮 */}
                    {provider.layer === 3 && hasComplexities && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSelectComplexityDialog(provider.id);
                        }}
                        title="统一删除复杂度"
                      >
                        <Layers className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleProvider(provider.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProvider(provider)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProvider(provider.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Region 列表 */}
              {isExpanded && provider.layer > 1 && (
                <CardContent className="pt-0">
                  <div className="border-t pl-4 space-y-3">
                    {provider.regions.map((region) => {
                      const regionKey = `${provider.id}-${region.id}`;
                      const isRegionExpanded = expandedRegions.has(regionKey);
                      const hasComplexities = region.complexities && region.complexities.length > 0;
                      const hasRegionService = region.service || region.complexities?.some(c => c.service);
                      
                      return (
                        <div key={region.id} className={hasRegionService ? "py-2 pr-4 border-l-2 border-primary/30" : "py-2 pr-4"}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{region.name}</span>
                              {hasComplexities && (
                                <Badge variant="secondary" className="text-xs">
                                  {region.complexities?.length} 个复杂度
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {provider.layer === 2 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleConfigRegionService(provider.id, region.id)}
                                  title={region.service ? "编辑服务配置" : "配置服务"}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleRegion(provider.id, region.id)}
                              >
                                {isRegionExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRegion(provider.id, region)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRegion(provider.id, region.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          {/* Complexity 列表 */}
                          {isRegionExpanded && provider.layer === 3 && hasComplexities && (
                            <div className="mt-2 pl-4 space-y-2 border-l">
                              {region.complexities?.map((complexity) => {
                                const hasComplexityService = complexity.service;
                                
                                return (
                                  <div key={complexity.id} className={hasComplexityService ? "py-2 border-l-2 border-primary/30" : "py-2"}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2 flex-1">
                                        <Zap className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{complexity.name}</span>
                                        {complexity.description && (
                                          <span className="text-xs text-muted-foreground">
                                            {complexity.description}
                                          </span>
                                        )}
                                        {complexity.service && (
                                          <Badge variant="default" className="text-xs">
                                            已配置
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleConfigComplexityService(provider.id, region.id, complexity.id)}
                                          title={complexity.service ? "编辑服务配置" : "配置服务"}
                                        >
                                          <Settings className="h-4 w-4" />
                                        </Button>
                                        
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEditComplexity(provider.id, region.id, complexity)}
                                        >
                                          <Settings className="h-4 w-4" />
                                        </Button>
                                        
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteComplexity(provider.id, region.id, complexity.id)}
                                        >
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {provider.regions.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        暂无区域，点击上方按钮添加
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Provider 对话框 */}
      <EditProviderDialog
        open={isProviderDialogOpen}
        onOpenChange={setIsProviderDialogOpen}
        provider={editingProvider}
        onSave={handleSaveProvider}
        mode={dialogMode}
      />

      {/* Region 对话框 */}
      <EditRegionDialog
        open={isRegionDialogOpen}
        onOpenChange={setIsRegionDialogOpen}
        region={editingRegion?.region}
        onSave={handleSaveRegion}
        mode={dialogMode}
      />

      {/* Complexity 对话框 */}
      <EditComplexityDialog
        open={isComplexityDialogOpen}
        onOpenChange={setIsComplexityDialogOpen}
        complexity={editingComplexity?.complexity}
        onSave={handleSaveComplexity}
        mode={dialogMode}
      />

      {/* 删除确认对话框 */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              {deleteConfirm?.type === "provider" && "确定要删除这个提供商吗？"}
              {deleteConfirm?.type === "region" && "确定要删除这个区域吗？"}
              {deleteConfirm?.type === "complexity" && "确定要删除这个复杂度吗？"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              取消
            </Button>
            <Button
              onClick={() => {
                if (deleteConfirm?.type === "provider") {
                  handleConfirmDeleteProvider();
                } else if (deleteConfirm?.type === "region") {
                  handleConfirmDeleteRegion();
                } else if (deleteConfirm?.type === "complexity") {
                  handleConfirmDeleteComplexity();
                }
              }}
              variant="destructive"
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service 配置对话框 */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {configServiceTarget?.complexityId
                ? "配置服务 - 复杂度"
                : configServiceTarget?.regionId
                ? "配置服务 - 区域"
                : "配置服务 - 提供商"}
            </DialogTitle>
            <DialogDescription>
              配置MCP服务的基本信息和工具
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <MCPProviderConfig
              initialData={getServiceConfig(
                configServiceTarget?.providerId,
                configServiceTarget?.regionId,
                configServiceTarget?.complexityId
              )}
              onSave={handleSaveServiceConfig}
              onCancel={() => {
                setIsConfigDialogOpen(false);
                setConfigServiceTarget(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* 选择复杂度删除对话框 */}
      <Dialog open={isSelectComplexityDialogOpen} onOpenChange={setIsSelectComplexityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>统一删除复杂度</DialogTitle>
            <DialogDescription>
              选择要删除的复杂度级别，将从所有区域中删除选中的复杂度
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {getAllComplexityNames(deleteProviderId).map((name) => {
              const isSelected = selectedComplexitiesForDelete.has(name);
              return (
                <div
                  key={name}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleToggleComplexityForDelete(name)}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded border ${
                      isSelected ? "bg-primary border-primary" : "border-border"
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{name}</span>
                  </div>
                </div>
              );
            })}
            
            {getAllComplexityNames(deleteProviderId).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                暂无复杂度
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSelectComplexityDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmDeleteDialogOpen} disabled={selectedComplexitiesForDelete.size === 0}>
              删除选中的 {selectedComplexitiesForDelete.size} 个复杂度
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};