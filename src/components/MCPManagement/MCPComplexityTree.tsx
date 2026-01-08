import { ChevronRight, ChevronDown, Check, Settings, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MCPProviderConfig, MCPServiceConfig } from "./MCPProviderConfig";
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
}

export interface MCPProvider {
  id: string;
  name: string;
  regions: MCPRegion[];
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
    regionId: string;
    complexityId: string;
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

  const handleOpenConfig = (providerId: string, regionId: string, complexityId: string) => {
    const provider = providers.find(p => p.id === providerId);
    const region = provider?.regions.find(r => r.id === regionId);
    const complexity = region?.complexities.find(c => c.id === complexityId);
    
    if (complexity?.service) {
      setConfiguringComplexity({ providerId, regionId, complexityId });
    } else {
      setConfiguringComplexity({ providerId, regionId, complexityId });
    }
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = (config: MCPServiceConfig) => {
    if (!configuringComplexity) return;

    const newProviders = providers.map(provider => {
      if (provider.id !== configuringComplexity.providerId) return provider;
      
      return {
        ...provider,
        regions: provider.regions.map(region => {
          if (region.id !== configuringComplexity.regionId) return region;
          
          return {
            ...region,
            complexities: region.complexities.map(complexity => {
              if (complexity.id !== configuringComplexity.complexityId) return complexity;
              
              return {
                ...complexity,
                service: config
              };
            })
          };
        })
      };
    });

    onProvidersChange(newProviders);
    setConfigDialogOpen(false);
    setConfiguringComplexity(null);
    toast.success("服务配置已保存");
  };

  const isComplexitySelected = (providerId: string, regionId: string, complexityId: string) => {
    return selectedComplexity === `${providerId}-${regionId}-${complexityId}`;
  };

  return (
    <div className="space-y-4">
      {providers.map((provider) => (
        <Card key={provider.id}>
          <CardHeader>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleProvider(provider.id)}
            >
              <div className="flex items-center space-x-2">
                {expandedProviders.has(provider.id) ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <CardTitle className="text-lg">{provider.name}</CardTitle>
              </div>
              <Badge variant="outline">{provider.regions.length} 个区域</Badge>
            </div>
          </CardHeader>
          
          {expandedProviders.has(provider.id) && (
            <CardContent className="pl-6 space-y-2">
              {provider.regions.map((region) => (
                <div key={region.id} className="border-l-2 border-border pl-4">
                  <div
                    className="flex items-center justify-between cursor-pointer py-2"
                    onClick={() => toggleRegion(region.id)}
                  >
                    <div className="flex items-center space-x-2">
                      {expandedRegions.has(region.id) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium text-sm">{region.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {region.complexities.some(c => c.service) && (
                        <Badge variant="secondary" className="text-xs">
                          已配置
                        </Badge>
                      )}
                    </div>
                  </div>

                  {expandedRegions.has(region.id) && (
                    <div className="space-y-2 mt-2">
                      {region.complexities.map((complexity) => (
                        <div
                          key={complexity.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            isComplexitySelected(provider.id, region.id, complexity.id)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => handleSelectComplexity(provider.id, region.id, complexity.id)}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenConfig(provider.id, region.id, complexity.id);
                                }}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      ))}

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
                const region = provider?.regions.find(r => r.id === configuringComplexity.regionId);
                const complexity = region?.complexities.find(c => c.id === configuringComplexity.complexityId);
                return complexity?.service;
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
    </div>
  );
};