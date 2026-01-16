import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
}

interface DocumentCollection {
  id: string;
  name: string;
  type: string;
}

interface ChatConfigProps {
  models: ModelConfig[];
  documentCollections: DocumentCollection[];
  onConfigChange: (config: {
    modelId: string;
    documentCollectionIds?: string[];
  }) => void;
  currentConfig?: {
    modelId: string;
    documentCollectionIds?: string[];
  };
  onClear: () => void;
}

export const ChatConfig = ({ models, documentCollections, onConfigChange, currentConfig, onClear }: ChatConfigProps) => {
  const [modelId, setModelId] = useState<string>(models[0]?.id || "");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

  // 同步父组件传递的配置到内部状态
  useEffect(() => {
    if (currentConfig) {
      if (currentConfig.modelId && currentConfig.modelId !== modelId) {
        setModelId(currentConfig.modelId);
      }
      if (currentConfig.documentCollectionIds !== undefined) {
        setSelectedCollectionIds(currentConfig.documentCollectionIds);
      }
    }
  }, [currentConfig]);

  const handleModelChange = (newModelId: string) => {
    setModelId(newModelId);
    onConfigChange({
      modelId: newModelId,
      documentCollectionIds: selectedCollectionIds.length > 0 ? selectedCollectionIds : undefined
    });
  };

  const handleToggleCollection = (collectionId: string) => {
    const newSelectedIds = selectedCollectionIds.includes(collectionId)
      ? selectedCollectionIds.filter(id => id !== collectionId)
      : [...selectedCollectionIds, collectionId];
    
    setSelectedCollectionIds(newSelectedIds);
    onConfigChange({
      modelId,
      documentCollectionIds: newSelectedIds.length > 0 ? newSelectedIds : undefined
    });
  };

  const handleClear = () => {
    setModelId(models[0]?.id || "");
    setSelectedCollectionIds([]);
    onClear();
  };

  return (
    <div className="space-y-4">
      {/* 清空按钮 */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClear}
          className="h-6 px-2 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          清空
        </Button>
      </div>

      {/* 模型选择 */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">选择模型</Label>
        <Select value={modelId} onValueChange={handleModelChange}>
          <SelectTrigger className="h-8 text-sm overflow-hidden">
            <SelectValue placeholder="选择模型" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id} className="text-sm">
                <div className="flex items-center space-x-2">
                  <span>{model.name}</span>
                  <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 文档集多选 */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">选择文档集（多选）</Label>
        <ScrollArea className="h-[120px] border rounded-md p-2">
          <div className="space-y-1">
            {documentCollections.map((collection) => (
              <div key={collection.id} className="flex items-center space-x-2 p-1 hover:bg-muted/50 rounded">
                <Checkbox
                  id={`collection-${collection.id}`}
                  checked={selectedCollectionIds.includes(collection.id)}
                  onCheckedChange={() => handleToggleCollection(collection.id)}
                  className="h-4 w-4"
                />
                <label
                  htmlFor={`collection-${collection.id}`}
                  className="flex-1 flex items-center justify-between cursor-pointer text-sm"
                >
                  <span>{collection.name}</span>
                  <Badge variant="outline" className="text-xs">{collection.type}</Badge>
                </label>
              </div>
            ))}
            {documentCollections.length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-2">
                暂无文档集
              </div>
            )}
          </div>
        </ScrollArea>
        {selectedCollectionIds.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedCollectionIds.map((id) => {
              const collection = documentCollections.find(c => c.id === id);
              return (
                <Badge key={id} variant="secondary" className="text-xs">
                  {collection?.name}
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};