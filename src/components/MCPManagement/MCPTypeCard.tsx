import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Trash2, MapPin, Sliders } from "lucide-react";

interface Region {
  id: string;
  name: string;
}

interface ComplexityLevel {
  id: string;
  name: string;
  description: string;
}

interface MCPType {
  id: string;
  name: string;
  description: string;
  regions: Region[];
  complexityLevels: ComplexityLevel[];
}

interface MCPTypeCardProps {
  mcpType: MCPType;
  onEdit: (mcpType: MCPType) => void;
  onDelete: (id: string) => void;
}

export const MCPTypeCard = ({ mcpType, onEdit, onDelete }: MCPTypeCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{mcpType.name}</CardTitle>
            <CardDescription>{mcpType.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(mcpType)}>
              <Settings className="h-4 w-4 mr-1" />
              编辑
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(mcpType.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">区域:</span>
            <div className="flex flex-wrap gap-1">
              {mcpType.regions.length > 0 ? (
                mcpType.regions.map((region) => (
                  <Badge key={region.id} variant="outline" className="text-xs">
                    {region.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">无区域</span>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {mcpType.regions.length} 个
            </Badge>
          </div>
          
          <div className="flex items-start space-x-2">
            <Sliders className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <span className="text-sm text-muted-foreground">复杂度:</span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {mcpType.complexityLevels.length > 0 ? (
                  mcpType.complexityLevels.map((level) => (
                    <div key={level.id} className="p-2 border rounded bg-muted/50">
                      <div className="text-sm font-medium">{level.name}</div>
                      <div className="text-xs text-muted-foreground">{level.description}</div>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground col-span-2">无复杂度等级</span>
                )}
              </div>
              <Badge variant="secondary" className="text-xs mt-2">
                {mcpType.complexityLevels.length} 个等级
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};