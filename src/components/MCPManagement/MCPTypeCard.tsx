import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Trash2, Globe, Code } from "lucide-react";

interface MCPService {
  id: string;
  name: string;
  description: string;
  url: string;
  headers?: string;
  status: "active" | "inactive";
  createdAt: string;
}

interface MCPTypeCardProps {
  service: MCPService;
  onEdit: (service: MCPService) => void;
  onDelete: (id: string) => void;
}

export const MCPTypeCard = ({ service, onEdit, onDelete }: MCPTypeCardProps) => {
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
            <Button variant="outline" size="sm" onClick={() => onEdit(service)}>
              <Settings className="h-4 w-4 mr-1" />
              编辑
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
          
          {service.headers && (
            <div className="flex items-start space-x-2">
              <Code className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">请求头:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded block mt-1 truncate">
                  {service.headers}
                </code>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>创建时间: {service.createdAt}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};