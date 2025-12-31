import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Database, Check } from "lucide-react";
import { useState, useEffect } from "react";
import type { ChatMode } from "./index";

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
    mode: ChatMode;
    modelId: string;
    documentCollectionId?: string;
  }) => void;
}

export const ChatConfig = ({ models, documentCollections, onConfigChange }: ChatConfigProps) => {
  const [mode, setMode] = useState<ChatMode>("llm");
  const [modelId, setModelId] = useState<string>(models[0]?.id || "");
  const [documentCollectionId, setDocumentCollectionId] = useState<string>("");
  const [kbModelId, setKbModelId] = useState<string>(models[0]?.id || "");

  const handleModeChange = (newMode: ChatMode) => {
    setMode(newMode);
    if (newMode === "llm") {
      onConfigChange({
        mode: newMode,
        modelId: modelId
      });
    } else {
      onConfigChange({
        mode: newMode,
        modelId: kbModelId,
        documentCollectionId: documentCollectionId || undefined
      });
    }
  };

  const handleModelChange = (newModelId: string) => {
    setModelId(newModelId);
    onConfigChange({
      mode,
      modelId: newModelId
    });
  };

  const handleDocumentCollectionChange = (newCollectionId: string) => {
    setDocumentCollectionId(newCollectionId);
    onConfigChange({
      mode,
      modelId: kbModelId,
      documentCollectionId: newCollectionId || undefined
    });
  };

  const handleKbModelChange = (newModelId: string) => {
    setKbModelId(newModelId);
    onConfigChange({
      mode,
      modelId: newModelId,
      documentCollectionId: documentCollectionId || undefined
    });
  };

  return (
    <div className="space-y-4">
      {/* 模式选择 */}
      <div>
        <Label className="text-xs font-medium mb-2 block">对话模式</Label>
        <RadioGroup value={mode} onValueChange={(v) => handleModeChange(v as ChatMode)}>
          <div className="grid grid-cols-2 gap-2">
            <div
              className={`relative border rounded-md p-3 cursor-pointer transition-colors ${
                mode === "llm" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value="llm" id="llm-mode" className="sr-only" />
              <Label htmlFor="llm-mode" className="cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">LLM 模式</span>
                  {mode === "llm" && <Check className="h-3 w-3 text-primary ml-auto" />}
                </div>
              </Label>
            </div>

            <div
              className={`relative border rounded-md p-3 cursor-pointer transition-colors ${
                mode === "knowledge" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value="knowledge" id="kb-mode" className="sr-only" />
              <Label htmlFor="kb-mode" className="cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">知识库模式</span>
                  {mode === "knowledge" && <Check className="h-3 w-3 text-primary ml-auto" />}
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* LLM 模式配置 */}
      {mode === "llm" && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">选择模型</Label>
          <Select value={modelId} onValueChange={handleModelChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="选择模型" />
            </SelectTrigger>
            <SelectContent>
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
      )}

      {/* 知识库模式配置 */}
      {mode === "knowledge" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs font-medium">选择文档集</Label>
            <Select value={documentCollectionId} onValueChange={handleDocumentCollectionChange}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="选择文档集" />
              </SelectTrigger>
              <SelectContent>
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

          <div className="space-y-2">
            <Label className="text-xs font-medium">选择问答模型</Label>
            <Select value={kbModelId} onValueChange={handleKbModelChange}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="选择问答模型" />
              </SelectTrigger>
              <SelectContent>
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
        </div>
      )}
    </div>
  );
};