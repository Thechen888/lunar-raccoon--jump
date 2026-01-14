import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronDown, ChevronRight, Settings, Layers, Folder } from "lucide-react";
import { toast } from "sonner";
import { MCPProviderConfig } from "./MCPProviderConfig";

export interface MCPComplexity {
  id: string;
  name: string;
  description?: string;
  service?: {
    name: string;
    description?: string;
    url: string;
    headers?: string;
  };
}

export interface MCPRegion {
  id: string;
  name: string;
  complexities: MCPComplexity[];
  service?: {
    name: string;
    description?: string;
    url: string;
    headers?: string;
  };
}

export interface MCPProvider {
  id: string;
  name: string;
  layer: 1 | 2 | 3;
  regions: MCPRegion[];
  service?: {
    name: string;
    description?: string;
    url: string;
    headers?: string;
  };
}

interface MCPComplexityTreeProps {
  providers: MCPProvider[];
  onProvidersChange: (providers: MCPProvider[]) => void;
}

export const MCPComplexityTree = ({ providers, onProvidersChange }: MCPComplexityTreeProps) => {
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());

  // 统一删除复杂度对话框相关状态
  const [complexityDeleteDialogOpen, setComplexityDeleteDialogOpen] = useState(false);
  const [deletingProviderId, setDeletingProviderId] = useState<string | null>(null);
  const [selectedComplexityToDelete, setSelectedComplexityToDelete] = useState<string | null>(null);

  // 编辑对话框相关状态
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editType, setEditType] = useState<"provider" | "region" | "complexity">("provider");
  const [editMode, setEditMode] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<any>(null);

  // 服务配置对话框相关状态
  const [serviceConfigDialogOpen, setServiceConfigDialogOpen] = useState(false);
  const [configType, setConfigType] = useState<"provider" | "region" | "complexity">("provider");
  const [configItem, setConfigItem] = useState<any>(null);

  // 统一删除选定的复杂度（所有区域）
  const handleDeleteAllComplexities = () => {
    if (!deletingProviderId || !selectedComplexityToDelete) return;
    const newProviders = providers.map(provider => {
      if (provider.id !== deletingProviderId) return provider;
      return {
        ...provider,
        regions: provider.regions.map(region => ({
          ...region,
          complexities: region.complexities.filter(c => c.id !== selectedComplexityToDelete)
        }))
      };
    });
    onProvidersChange(newProviders);
    setComplexityDeleteDialogOpen(false);
    setDeletingProviderId(null);
    setSelectedComplexityToDelete(null);
    toast.success(`复杂度级别 "${selectedComplexityToDelete}" 已删除`);
  };

  // 统一删除复杂度对话框
  const handleOpenComplexityDelete = (providerId: string) => {
    setDeletingProviderId(providerId);
    setSelectedComplexityToDelete(null);
    setComplexityDeleteDialogOpen(true);
  };

  const toggleProvider = (providerId: string) => {
    const newExpanded = new Set(expandedProviders);
    if (newExpanded.has(providerId)) {
      newExpanded.delete(providerId);
    } else {
      newExpanded.add(providerId);
    }
    setExpandedProviders(newExpanded);
  };

  const toggleRegion = (providerId: string, regionId: string) => {
    const key = `${providerId}-${regionId}`;
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRegions(newExpanded);
  };

  const handleEdit = (type: "provider" | "region" | "complexity", item: any, mode: "create" | "edit") => {
    setEditType(type);
    setEditMode(mode);
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (data: { id: string; name: string; description?: string }) => {
    const newProviders = providers.map(provider => {
      if (editType === "provider") {
        if (provider.id !== editingItem?.id) return provider;
        return { ...provider, name: data.name };
      }
      
      if (editType === "region") {
        if (provider.id !== editingItem?.providerId) return provider;
        return {
          ...provider,
          regions: provider.regions.map(region => 
            region.id !== editingItem?.id ? region : { ...region, name: data.name }
          )
        };
      }
      
      if (editType === "complexity") {
        if (provider.id !== editingItem?.providerId) return provider;
        return {
          ...provider,
          regions: provider.regions.map(region => {
            if (region.id !== editingItem?.regionId) return region;
            return {
              ...region,
              complexities: region.complexities.map(complexity =>
                complexity.id !== editingItem?.id ? complexity : { 
                  ...complexity, 
                  name: data.name,
                  description: data.description 
                }
              )
            };
          })
        };
      }
      
      return provider;
    });
    
    onProvidersChange(newProviders);
    setEditDialogOpen(false);
    setEditingItem(null);
    toast.success("保存成功");
  };

  const handleDelete = (type: "provider" | "region" | "complexity", item: any) => {
    const newProviders = providers.map(provider => {
      if (type === "provider") {
        if (provider.id !== item.id) return provider;
        return provider;
      }
      
      if (type === "region" && provider.id === item.providerId) {
        return {
          ...provider,
          regions: provider.regions.filter(region => region.id !== item.id)
        };
      }
      
      if (type === "complexity" && provider.id === item.providerId) {
        return {
          ...provider,
          regions: provider.regions.map(region => {
            if (region.id !== item.regionId) return region;
            return {
              ...region,
              complexities: region.complexities.filter(c => c.id !== item.id)
            };
          })
        };
      }
      
      return provider;
    });
    
    onProvidersChange(newProviders);
    toast.success("删除成功");
  };

  const handleOpenServiceConfig = (type: "provider" | "region" | "complexity", item: any) => {
    setConfigType(type);
    setConfigItem(item);
    setServiceConfigDialogOpen(true);
  };

  const handleSaveServiceConfig = (config: any) => {
    const newProviders = providers.map(provider => {
      if (configType === "provider") {
        if (provider.id !== configItem?.id) return provider;
        return { ...provider, service: config };
      }
      
      if (configType === "region") {
        if (provider.id !== configItem?.providerId) return provider;
        return {
          ...provider,
          regions: provider.regions.map(region => 
            region.id !== configItem?.id ? region : { ...region, service: config }
          )
        };
      }
      
      if (configType === "complexity") {
        if (provider.id !== configItem?.providerId) return provider;
        return {
          ...provider,
          regions: provider.regions.map(region => {
            if (region.id !== configItem?.regionId) return region;
            return {
              ...region,
              complexities: region.complexities.map(complexity =>
                complexity.id !== configItem?.id ? complexity : { ...complexity, service: config }
              )
            };
          })
        };
      }
      
      return provider;
    });
    
    onProvidersChange(newProviders);
    setServiceConfigDialogOpen(false);
    setConfigItem(null);
    toast.success("服务配置已保存");
  };

  const getLayerBadge = (layer: number) => {
    const labels = { 1: "一层", 2: "二层", 3: "三层" };
    return labels[layer as keyof typeof labels] || "三层";
  };

  const hasService = (type: "provider" | "region" | "complexity", item: any) => {
    return !!item.service;
  };

  return (
    <div className="space-y-4">
      {providers.map((provider) => {
        const isExpanded = expandedProviders.has(provider.id);
        const hasRegions = provider.regions && provider.regions.length > 0;
        const hasComplexities = provider.layer === 3 && 
          provider.regions.some(r => r.complexities && r.complexities.length > 0);

        return (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center space-x-3 flex-1 cursor-pointer"
                  onClick={() => provider.layer > 1 && toggleProvider(provider.id)}
                >
                  {provider.layer > 1 && (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getLayerBadge(provider.layer)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {provider.layer === 1 && hasService("provider", provider) && (
                    <Button variant="outline" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      handleOpenServiceConfig("provider", provider);
                    }}>
                      配置服务
                    </Button>
                  )}
                  {provider.layer === 2 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit("region", { providerId: provider.id, id: "new" }, "create");
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      添加区域
                    </Button>
                  )}
                  {provider.layer === 3 && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit("region", { providerId: provider.id, id: "new" }, "create");
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        添加区域
                      </Button>
                      {hasComplexities && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenComplexityDelete(provider.id);
                          }}
                          title="选择复杂度级别进行统一删除"
                          className="text-destructive border-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="ml-1">删除复杂度</span>
                        </Button>
                      )}
                    </>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit("provider", provider, "edit");
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {isExpanded && hasRegions && (
              <CardContent className="space-y-3">
                {provider.regions.map((region) => {
                  const isRegionExpanded = expandedRegions.has(`${provider.id}-${region.id}`);
                  
                  return (
                    <Card key={region.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div 
                            className="flex items-center space-x-3 flex-1 cursor-pointer"
                            onClick={() => provider.layer === 3 && toggleRegion(provider.id, region.id)}
                          >
                            {provider.layer === 3 && (
                              isRegionExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )
                            )}
                            <div className="flex-1 flex items-center space-x-2">
                              <Folder className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{region.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {provider.layer === 2 && hasService("region", region) && (
                              <Button variant="outline" size="sm" onClick={(e) => {
                                e.stopPropagation();
                                handleOpenServiceConfig("region", { ...region, providerId: provider.id });
                              }}>
                                配置服务
                              </Button>
                            )}
                            {provider.layer === 2 && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit("region", { ...region, providerId: provider.id }, "edit");
                                }}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            )}
                            {provider.layer === 2 && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete("region", { ...region, providerId: provider.id });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            {provider.layer === 3 && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit("complexity", { providerId: provider.id, regionId: region.id, id: "new" }, "create");
                                }}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                添加复杂度
                              </Button>
                            )}
                            {provider.layer === 3 && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit("region", { ...region, providerId: provider.id }, "edit");
                                }}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      {isRegionExpanded && provider.layer === 3 && region.complexities && region.complexities.length > 0 && (
                        <CardContent className="space-y-2">
                          {region.complexities.map((complexity) => (
                            <div 
                              key={complexity.id}
                              className={`flex items-center justify-between p-3 border rounded-lg ${
                                complexity.service ? "border-primary/50 bg-primary/5" : "border-border"
                              }`}
                            >
                              <div className="flex items-center space-x-2 flex-1">
                                <Layers className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{complexity.name}</div>
                                  {complexity.description && (
                                    <div className="text-xs text-muted-foreground">{complexity.description}</div>
                                  )}
                                </div>
                                {complexity.service && (
                                  <Badge variant="default" className="text-xs">已配置</Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {complexity.service ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenServiceConfig("complexity", { 
                                        ...complexity, 
                                        providerId: provider.id,
                                        regionId: region.id 
                                      });
                                    }}
                                  >
                                    配置服务
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenServiceConfig("complexity", { 
                                        ...complexity, 
                                        providerId: provider.id,
                                        regionId: region.id 
                                      });
                                    }}
                                  >
                                    添加服务
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit("complexity", { 
                                      ...complexity, 
                                      providerId: provider.id,
                                      regionId: region.id 
                                    }, "edit");
                                  }}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode === "create" ? "添加" : "编辑"}{
                editType === "provider" ? "提供商" : 
                editType === "region" ? "区域" : "复杂度"}
            </DialogTitle>
            <DialogDescription>
              {editMode === "create" ? "创建新的" : "编辑现有的"}{
                editType === "provider" ? "提供商" : 
                editType === "region" ? "区域" : "复杂度"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>名称 <span className="text-red-500">*</span></Label>
              <Input
                placeholder={`输入${editType === "provider" ? "提供商" : editType === "region" ? "区域" : "复杂度"}名称`}
              />
            </div>
            {editType === "complexity" && (
              <div>
                <Label>描述</Label>
                <Textarea
                  placeholder="描述这个复杂度级别"
                  rows={2}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => handleSaveEdit({ id: "test", name: "test" })}>
              {editMode === "create" ? "添加" : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 服务配置对话框 */}
      <Dialog open={serviceConfigDialogOpen} onOpenChange={setServiceConfigDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>配置服务 - {configItem?.name}</DialogTitle>
            <DialogDescription>
              配置MCP服务的URL和请求头
            </DialogDescription>
          </DialogHeader>
          <MCPProviderConfig
            initialData={configItem?.service}
            onSave={handleSaveServiceConfig}
            onCancel={() => setServiceConfigDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 统一删除复杂度对话框 */}
      <Dialog open={complexityDeleteDialogOpen} onOpenChange={setComplexityDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>统一删除复杂度</DialogTitle>
            <DialogDescription>
              选择要删除的复杂度级别，该级别将从所有区域中删除。
            </DialogDescription>
          </DialogHeader>
          {deletingProviderId && (
            <div className="space-y-3">
              <Label>选择复杂度级别</Label>
              <div className="space-y-2">
                {providers.find(p => p.id === deletingProviderId)?.regions[0]?.complexities.map((complexity) => (
                  <div
                    key={complexity.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedComplexityToDelete === complexity.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedComplexityToDelete(complexity.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{complexity.name}</span>
                      {complexity.description && (
                        <span className="text-sm text-muted-foreground">- {complexity.description}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setComplexityDeleteDialogOpen(false);
              setDeletingProviderId(null);
              setSelectedComplexityToDelete(null);
            }}>
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAllComplexities}
              disabled={!selectedComplexityToDelete}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};