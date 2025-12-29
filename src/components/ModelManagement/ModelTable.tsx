import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Settings, Play, Trash2 } from "lucide-react";

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  modelName: string;
  modelVersion: string;
  status: "active" | "inactive" | "error";
  maxTokens: number;
  temperature: number;
  description: string;
}

interface ModelTableProps {
  models: ModelConfig[];
  onToggleModel: (modelId: string) => void;
  onEditModel: (model: ModelConfig) => void;
  onTestModel: (modelId: string) => void;
  onDeleteModel: (modelId: string) => void;
  testingModel: string | null;
}

export const ModelTable = ({ models, onToggleModel, onEditModel, onTestModel, onDeleteModel, testingModel }: ModelTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>模型名称</TableHead>
          <TableHead>提供商</TableHead>
          <TableHead>模型</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>配置</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {models.map((model) => (
          <TableRow key={model.id}>
            <TableCell>
              <div className="font-medium">{model.name}</div>
              <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{model.provider}</Badge>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium text-sm">{model.modelName}</div>
                <div className="text-xs text-muted-foreground">{model.modelVersion}</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={model.status === "active" ? "default" : model.status === "error" ? "destructive" : "secondary"}>
                {model.status === "active" ? "运行中" : model.status === "error" ? "错误" : "离线"}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="text-xs text-muted-foreground">
                {model.maxTokens} tokens / T: {model.temperature}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Switch checked={model.status === "active"} onCheckedChange={() => onToggleModel(model.id)} />
                <Button variant="ghost" size="sm" onClick={() => onEditModel(model)}>
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onTestModel(model.id)} disabled={testingModel === model.id}>
                  <Play className={`h-4 w-4 ${testingModel === model.id ? "animate-pulse" : ""}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDeleteModel(model.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};