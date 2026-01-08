import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server } from "lucide-react";
import { toast } from "sonner";
import { MCPComplexityTree, MCPProvider, MCPComplexity, MCPRegion, MCPService } from "./MCPComplexityTree";
import { MCPDetailDialog } from "./MCPDetailDialog";

interface MCPManagementProps {
  onServicesChange: (services: MCPService[]) => void;
  services: MCPService[];
}

export const MCPManagement = ({ onServicesChange, services }: MCPManagementProps) => {
  const [detailService, setDetailService] = useState<MCPService | null>(null);

  // 初始化层级数据结构
  const [providers, setProviders] = useState<MCPProvider[]>([
    {
      id: "pangu",
      name: "PANGU",
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
      regions: [
        {
          id: "hub-china",
          name: "中国",
          complexities: [
            {
              id: "hub-china-simple",
              name: "精简",
              service: undefined
            },
            {
              id: "hub-china-normal",
              name: "一般",
              service: undefined
            },
            {
              id: "hub-china-complex",
              name: "复杂",
              service: {
                name: "hub-中国-复杂",
                description: "EcoHub生态系统服务-中国区域-复杂模式",
                url: "https://api.hub.complex.example.com/v1",
                headers: '{"Authorization": "Bearer ecohub-token", "Content-Type": "application/json"}'
              }
            },
            {
              id: "hub-china-complete",
              name: "完全",
              service: undefined
            }
          ]
        },
        {
          id: "hub-europe",
          name: "欧洲",
          complexities: [
            {
              id: "hub-europe-simple",
              name: "精简",
              service: undefined
            },
            {
              id: "hub-europe-normal",
              name: "一般",
              service: undefined
            },
            {
              id: "hub-europe-complex",
              name: "复杂",
              service: undefined
            },
            {
              id: "hub-europe-complete",
              name: "完全",
              service: undefined
            }
          ]
        },
        {
          id: "hub-usa",
          name: "美国",
          complexities: [
            {
              id: "hub-usa-simple",
              name: "精简",
              service: undefined
            },
            {
              id: "hub-usa-normal",
              name: "一般",
              service: undefined
            },
            {
              id: "hub-usa-complex",
              name: "复杂",
              service: undefined
            },
            {
              id: "hub-usa-complete",
              name: "完全",
              service: undefined
            }
          ]
        }
      ]
    }
  ]);

  // 将层级结构转换为服务列表（供其他组件使用）
  const convertToServices = (providers: MCPProvider[]): MCPService[] => {
    const services: MCPService[] = [];
    
    providers.forEach(provider => {
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
    });
    
    return services;
  };

  // 当提供商层级变化时，同步更新服务列表
  const handleProvidersChange = (newProviders: MCPProvider[]) => {
    setProviders(newProviders);
    const newServices = convertToServices(newProviders);
    onServicesChange(newServices);
  };

  // 获取服务详情（用于显示完整服务信息）
  const getServiceById = (serviceId: string): MCPService | null => {
    return convertToServices(providers).find(s => s.id === serviceId) || null;
  };

  const handleDeleteService = (serviceId: string) => {
    const [providerId, regionId, complexityId] = serviceId.split('-');
    
    const newProviders = providers.map(provider => {
      if (provider.id !== providerId) return provider;
      
      return {
        ...provider,
        regions: provider.regions.map(region => {
          if (region.id !== regionId) return region;
          
          return {
            ...region,
            complexities: region.complexities.map(complexity => {
              if (complexity.id !== complexityId) return complexity;
              
              return {
                ...complexity,
                service: undefined
              };
            })
          };
        })
      };
    });
    
    handleProvidersChange(newProviders);
    setDetailService(null);
    toast.success("服务配置已删除");
  };

  const handleToggleTool = (toolId: string) => {
    // TODO: 实现工具切换逻辑
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
              按层级配置 MCP 服务：服务提供商 → 区域 → 复杂度
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <MCPComplexityTree
            providers={providers}
            onProvidersChange={handleProvidersChange}
          />
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      {detailService && (
        <MCPDetailDialog
          service={detailService}
          open={true}
          onOpenChange={() => setDetailService(null)}
          onEdit={() => {}}
          onDelete={handleDeleteService}
          onToggleTool={handleToggleTool}
        />
      )}
    </div>
  );
};