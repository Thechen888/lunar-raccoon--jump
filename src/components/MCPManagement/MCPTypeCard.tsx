import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Trash2, Globe, ExternalLink } from "lucide-react";

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

interface MCPTypeCardProps {
  service: MCPService;
  onEdit: (service: MCPService) => void;
  onDetail: (service: MCPService) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const MCPTypeCard = ({ service, onEdit, onDetail, onDelete, onToggleStatus }: MCPTypeCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <Badge variant={service.status === "active" ? "default" : "secondary"} className="text-xs">
                {service.status === "active" ? "启用" : "禁用"}
              </Badge>
            </div>
            <CardDescription>{service.description || "无描述"}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={service.status === "active"}
              onCheckedChange={() => onToggleStatus(service.id)}
            />
            <Button variant="outline" size="sm" onClick={() => onDetail(service)}>
              <ExternalLink className="h-4 w-4 mr-1" />
              详情
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(service)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(service.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">URL:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
              {service.url}
            </code>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>创建时间: {service.createdAt}</span>
            <div className="flex items-center space-x-3">
              <span>工具: {service.tools?.length || 0}</span>
              <span>提示: {service.prompts?.length || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};