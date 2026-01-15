import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Database, RotateCcw, X } from "lucide-react";

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
    documentCollectionId?: string;
    databaseAddress?: string;
  }) => void;
  currentConfig?: {
    modelId: string;
    documentCollectionId?: string;
    databaseAddress?: string;
  };
  onClear: () => void;
}

export const ChatConfig = ({ models, documentCollections, onConfigChange, currentConfig, onClear }: ChatConfigProps) => {
  const [modelId, setModelId] = useState<string>(models[0]?.id || "");
  const [documentCollectionId, setDocumentCollectionId] = useState<string>("");
  const [databaseAddress, setDatabaseAddress] = useState<string>("");

  // 同步父组件传递的配置到内部状态
  useEffect(() => {
    if (currentConfig) {
      if (currentConfig.modelId && currentConfig.modelId !== modelId) {
        setModelId(currentConfig.modelId);
      }
      if (currentConfig.documentCollectionId && currentConfig.documentCollectionId !== documentCollectionId) {
        setDocumentCollectionId(currentConfig.documentCollectionId);
      }
      if (currentConfig.databaseAddress !== undefined && currentConfig.databaseAddress !== databaseAddress) {
        setDatabaseAddress(currentConfig.databaseAddress);
      }
    }
  }, [currentConfig]);

  const handleModelChange = (newModelId: string) => {
    setModelId(newModelId);
    onConfigChange({
      modelId: newModelId,
      documentCollectionId: documentCollectionId || undefined,
      databaseAddress: databaseAddress || undefined
    });
  };

  const handleDocumentCollectionChange = (newCollectionId: string) => {
    setDocumentCollectionId(newCollectionId);
    onConfigChange({
      modelId,
      documentCollectionId: newCollectionId || undefined,
      databaseAddress: databaseAddress || undefined
    });
  };

  const handleDatabaseAddressChange = (newAddress: string) => {
    setDatabaseAddress(newAddress);
    onConfigChange({
      modelId,
      documentCollectionId: documentCollectionId || undefined,
      databaseAddress: newAddress || undefined
    });
  };

  const handleClear = () => {
    setModelId(models[0]?.id || "");
    setDocumentCollectionId("");
    setDatabaseAddress("");
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
                  <Badge variant="outline" className="text-xs scale-75">{model.provider}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 文档集选择 */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">选择文档集（可选）</Label>
        <Select value={documentCollectionId} onValueChange={handleDocumentCollectionChange}>
          <SelectTrigger className="h-8 text-sm overflow-hidden">
            <SelectValue placeholder="选择文档集" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {documentCollections.map((collection) => (
              <SelectItem key={collection.id} value={collection.id} className="text-sm">
                <div className="flex items-center justify-between w-full pr-8">
                  <span>{collection.name}</span>
                  <Badge variant="outline" className="text-xs scale-75">{collection.type}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 数据库地址配置 - 仅在选择文档集后显示 */}
      {documentCollectionId && (
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center space-x-1">
            <Database className="h-3 w-3" />
            <span>数据库地址</span>
          </Label>
          <Input
            value={databaseAddress}
            onChange={(e) => handleDatabaseAddressChange(e.target.value)}
            placeholder="例如: https://pinecone.io/my-index"
            className="h-8 text-sm"
          />
        </div>
      )}
    </div>
  );
};