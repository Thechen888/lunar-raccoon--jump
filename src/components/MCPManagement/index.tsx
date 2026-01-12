import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server } from "lucide-react";
import { toast } from "sonner";
import { MCPComplexityTree, MCPProvider, MCPComplexity, MCPRegion, MCPService, MCPServiceConfig } from "./MCPComplexityTree";
import { MCPProviderConfig } from "./MCPProviderConfig";
import { MCPDetailDialog } from "./MCPDetailDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface MCPManagementProps {
  onServicesChange: (services: MCPService[]) => void;
  services: MCPService[];
}

export const MCPManagement = ({ onServicesChange, services }: MCPManagementProps) => {
  const [detailService, setDetailService] = useState<MCPService | null>(null);
  const [editingService, setEditingService] = useState<{
    providerId: string;
    regionId?: string;
    complexityId?: string;
    service: MCPService;
  } | null>(null);
  const [editConfigDialogOpen, setEditConfigDialogOpen] = useState(false);

  // 初始化层级数据结构 - 支持不同层级
  const [providers, setProviders] = useState<MCPProvider[]>([
    {
      id: "pangu",
      name: "PANGU",
      layer: 3, // 三层：提供商 -> 区域 -> 复杂度
      regions: [
        {
          id: "pangu-china",
          name: "中国",
          complexities: [
            {
              id: "pangu-china-simple",
              name: "精简",
              description: "快速响应模式",
              service: {
                name: "PANGU-中国-精简",
                description: "华为盘古大模型服务-中国区域-精简模式",
                url: "https://api.pangu.example.com/v1",
                headers: '{"Authorization": "Bearer pangu-token"}'
              }
            },
            {
              id: "pangu-china-normal",
              name: "一般",
              description: "标准模式",
              service: undefined
            },
            {
              id: "pangu-china-complex",
              name: "复杂",
              description: "深度分析模式",
              service: {
                name: "PANGU-中国-复杂",
                description: "华为盘古大模型服务-中国区域-复杂模式",
                url: "https://api.pangu.complex.example.com/v1",
                headers: '{"Authorization": "Bearer pangu-token"}'
              }
            },
            {
              id: "pangu-china-complete",
              name: "完全",
              description: "全能模式",
              service: undefined
            }
          ]
        },
        {
          id: "pangu-europe",
          name: "欧洲",
          complexities: [
            {
              id: "pangu-europe-simple",
              name: "精简",
              service: undefined
            },
            {
              id: "pangu-europe-normal",
              name: "一般",
              service: undefined
            },
            {
              id: "pangu-europe-complex",
              name: "复杂",
              service: undefined
            },
            {
              id: "pangu-europe-complete",
              name: "完全",
              service: undefined
            }
          ]
        },
        {
          id: "pangu-usa",
          name: "美国",
          complexities: [
            {
              id: "pangu-usa-simple",
              name: "精简",
              service: undefined
            },
            {
              id: "pangu-usa-normal",
              name: "一般",
              service: undefined
            },
            {
              id: "pangu-usa-complex",
              name: "复杂",
              service: undefined
            },
            {
              id: "pangu-usa-complete",
              name: "完全",
              service: undefined
            }
          ]
        }
      ]
    },
    {
      id: "hub",
      name: "HUB",
      layer: 2, // 二层：提供商 -> 区域
      regions: [
        {
          id: "hub-china",
          name: "中国",
          complexities: [], // 二层模式下不使用复杂度
          service: {
            name: "hub-中国",
            description: "EcoHub生态系统服务-中国区域",
            url: "https://api.hub.china.example.com/v1",
            headers: '{"Authorization": "Bearer ecohub-token", "Content-Type": "application/json"}'
          }
        },
        {
          id: "hub-europe",
          name: "欧洲",
          complexities: [],
          service: undefined
        },
        {
          id: "hub-usa",
          name: "美国",
          complexities: [],
          service: {
            name: "hub-美国",
            description: "EcoHub生态系统服务-美国区域",
            url: "https://api.hub.usa.example.com/v1",
            headers: '{"Authorization": "Bearer ecohub-token"}'
          }
        }
      ]
    },
    {
      id: "simple-provider",
      name: "Simple Provider",
      layer: 1, // 一层：直接在提供商上配置
      regions: [],
      service: {
        name: "Simple-Provider",
        description: "简单服务提供商示例",
        url: "https://api.simple.example.com/v1",
        headers: '{"Authorization": "Bearer simple-token"}'
      }
    }
  ]);

  // 示例工具数据
  const exampleTools = [
    {
      id: "tool-1",
      name: "代码生成",
      description: "根据需求生成高质量代码，支持多种编程语言",
      method: "POST",
      path: "/api/code/generate",
      enabled: true,
      projectId: "proj-pangu-001"
    },
    {
      id: "tool-2",
      name: "文本分析",
      description: "分析文本内容，提取关键信息和情感倾向",
      method: "POST",
      path: "/api/text/analyze",
      enabled: true,
      projectId: "proj-pangu-002"
    },
    {
      id: "tool-3",
      name: "数据查询",
      description: "查询数据库中的数据，支持复杂查询条件",
      method: "GET",
      path: "/api/data/query",
      enabled: false,
      projectId: "proj-pangu-003"
    },
    {
      id: "tool-4",
      name: "文件处理",
      description: "上传、下载和处理各种格式的文件",
      method: "POST",
      path: "/api/file/process",
      enabled: true,
      projectId: "proj-pangu-004"
    }
  ];

  // 示例提示数据
  const examplePrompts = [
    {
      id: "prompt-1",
      name: "系统提示词",
      content: "你是一个专业的AI助手，擅长回答各类问题。请确保回答准确、简洁、有帮助。对于技术问题，请提供详细的解释和示例代码。"
    },
    {
      id: "prompt-2",
      name: "代码审查提示词",
      content: "请审查以下代码，检查潜在的bug、性能问题和代码风格问题。提供具体的改进建议。"
    },
    {
      id: "prompt-3",
      name: "数据分析提示词",
      content: "请分析以下数据，提供关键洞察、趋势分析和可视化建议。使用专业的数据分析方法。"
    }
  ];

  // 将层级结构转换为服务列表（供其他组件使用）
  const convertToServices = (providers: MCPProvider[]): MCPService[] => {
    const services: MCPService[] = [];
    
    providers.forEach(provider => {
      if (provider.layer === 1 && provider.service) {
        // 一层模式：提供商上直接配置
        services.push({
          id: `${provider.id}`,
          name: provider.service.name,
          description: provider.service.description || "",
          url: provider.service.url,
          headers: provider.service.headers,
          status: "active",
          createdAt: "2024-01-01",
          tools: exampleTools,
          prompts: examplePrompts
        });
      } else if (provider.layer === 2) {
        // 二层模式：区域上配置
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
              tools: exampleTools,
              prompts: examplePrompts
            });
          }
        });
      } else if (provider.layer === 3) {
        // 三层模式：复杂度上配置
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
                tools: exampleTools,
                prompts: examplePrompts
              });
            }
          });
        });
      }
    });
    
    return services;
  };

  // 当提供商层级变化时，同步更新服务列表
  const handleProvidersChange = (newProviders: MCPProvider[]) => {
    setProviders(newProviders);
    const newServices = convertToServices(newProviders);
    onServicesChange(newServices);
  };

  const handleDeleteService = (serviceId: string) => {
    const parts = serviceId.split('-');
    
    const newProviders = providers.map(provider => {
      if (provider.id !== parts[0]) return provider;
      
      if (provider.layer === 1) {
        // 一层模式：删除提供商的服务配置
        return { ...provider, service: undefined };
      }
      
      if (provider.layer === 2 && parts.length >= 2) {
        // 二层模式：删除区域的服务配置
        return {
          ...provider,
          regions: provider.regions.map(region => {
            if (region.id !== parts[1]) return region;
            return { ...region, service: undefined };
          })
        };
      }
      
      if (provider.layer === 3 && parts.length >= 3) {
        // 三层模式：删除复杂度的服务配置
        return {
          ...provider,
          regions: provider.regions.map(region => {
            if (region.id !== parts[1]) return region;
            return {
              ...region,
              complexities: region.complexities.map(complexity => {
                if (complexity.id !== parts[2]) return complexity;
                return { ...complexity, service: undefined };
              })
            };
          })
        };
      }
      
      return provider;
    });
    
    handleProvidersChange(newProviders);
    setDetailService(null);
    toast.success("服务配置已删除");
  };

  const handleToggleTool = (toolId: string) => {
    if (detailService) {
      const updatedTools = detailService.tools?.map(tool =>
        tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
      );
      
      const updatedService = {
        ...detailService,
        tools: updatedTools || []
      };
      
      setDetailService(updatedService);
      onServicesChange(
        convertToServices(providers).map(s =>
          s.id === detailService.id ? updatedService : s
        )
      );
    }
  };

  const handleEditService = (service: MCPService) => {
    // 解析serviceId获取providerId, regionId, complexityId
    const parts = service.id.split('-');
    const providerId = parts[0];
    const regionId = parts[1];
    const complexityId = parts[2];
    
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return;
    
    let serviceConfig: MCPServiceConfig | undefined;
    
    if (provider.layer === 1) {
      serviceConfig = provider.service;
    } else if (provider.layer === 2 && regionId) {
      const region = provider.regions.find(r => r.id === regionId);
      serviceConfig = region?.service;
    } else if (provider.layer === 3 && regionId && complexityId) {
      const region = provider.regions.find(r => r.id === regionId);
      const complexity = region?.complexities.find(c => c.id === complexityId);
      serviceConfig = complexity?.service;
    }
    
    if (serviceConfig) {
      setEditingService({
        providerId,
        regionId,
        complexityId,
        service
      });
      setEditConfigDialogOpen(true);
    }
  };

  const handleSaveEditService = (config: MCPServiceConfig) => {
    if (!editingService) return;

    const newProviders = providers.map(provider => {
      if (provider.id !== editingService.providerId) return provider;
      
      if (!editingService.regionId) {
        // 一层模式
        return { ...provider, service: config };
      }
      
      if (!editingService.complexityId) {
        // 二层模式
        return {
          ...provider,
          regions: provider.regions.map(region => {
            if (region.id !== editingService.regionId) return region;
            return { ...region, service: config };
          })
        };
      }
      
      // 三层模式
      return {
        ...provider,
        regions: provider.regions.map(region => {
          if (region.id !== editingService.regionId) return region;
          return {
            ...region,
            complexities: region.complexities.map(complexity => {
              if (complexity.id !== editingService.complexityId) return complexity;
              return { ...complexity, service: config };
            })
          };
        })
      };
    });

    handleProvidersChange(newProviders);
    setEditConfigDialogOpen(false);
    setEditingService(null);
    setDetailService(null);
    toast.success("服务配置已更新");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>MCP 服务配置</span>
            </CardTitle>
            <CardDescription>
              按层级配置 MCP 服务：一层（提供商）、二层（提供商 → 区域）、三层（提供商 → 区域 → 复杂度）
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <MCPComplexityTree
            providers={providers}
            onProvidersChange={handleProvidersChange}
            onServiceDetail={setDetailService}
          />
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      {detailService && (
        <MCPDetailDialog
          service={detailService}
          open={true}
          onOpenChange={() => setDetailService(null)}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
          onToggleTool={handleToggleTool}
        />
      )}

      {/* 编辑服务配置对话框 */}
      <Dialog open={editConfigDialogOpen} onOpenChange={setEditConfigDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑服务配置</DialogTitle>
          </DialogHeader>
          {editingService && (
            <MCPProviderConfig
              initialData={{
                name: editingService.service.name,
                description: editingService.service.description,
                url: editingService.service.url,
                headers: editingService.service.headers
              }}
              onSave={handleSaveEditService}
              onCancel={() => {
                setEditConfigDialogOpen(false);
                setEditingService(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};