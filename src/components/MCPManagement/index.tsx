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
          tools: [],
          prompts: []
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
              tools: [],
              prompts: []
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
              按层级配置 MCP 服务：一层（提供商）、二层（提供商 → 区域）、三层（提供商 → 区域 → 复杂度）
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