import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Database, ChevronDown, Check } from "lucide-react";
import { useState } from "react";

export type ChatMode = "llm" | "knowledge";

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
    // 切换模式时重置配置
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">对话配置</CardTitle>
        <CardDescription>选择对话模式和相应的配置</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 模式选择 */}
        <div>
          <Label className="text-sm font-medium mb-3 block">对话模式</Label>
          <RadioGroup value={mode} onValueChange={(v) => handleModeChange(v as ChatMode)}>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
                  mode === "llm" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="llm" id="llm-mode" className="sr-only" />
                <Label htmlFor="llm-mode" className="cursor-pointer">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <span className="font-medium">LLM 模式</span>
                    {mode === "llm" && <Check className="h-4 w-4 text-primary ml-auto" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    直接使用大语言模型进行问答
                  </p>
                </Label>
              </div>

              <div
                className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
                  mode === "knowledge" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="knowledge" id="kb-mode" className="sr-only" />
                <Label htmlFor="kb-mode" className="cursor-pointer">
                  <div className="flex items-center space-x-2 mb-2">
                    <Database className="h-5 w-5 text-primary" />
                    <span className="font-medium">知识库模式</span>
                    {mode === "knowledge" && <Check className="h-4 w-4 text-primary ml-auto" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    基于文档库进行增强问答
                  </p>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* LLM 模式配置 */}
        {mode === "llm" && (
          <div className="space-y-3 pt-3 border-t">
            <Label className="text-sm font-medium">选择模型</Label>
            <Select value={modelId} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center space-x-2">
                      <span>{model.name}</span>
                      <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 知识库模式配置 */}
        {mode === "knowledge" && (
          <div className="space-y-4 pt-3 border-t">
            <div>
              <Label className="text-sm font-medium mb-2 block">选择文档集</Label>
              <Select value={documentCollectionId} onValueChange={handleDocumentCollectionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择文档集" />
                </SelectTrigger>
                <SelectContent>
                  {documentCollections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      <div className="flex items-center justify-between w-full pr-8">
                        <span>{collection.name}</span>
                        <Badge variant="outline" className="text-xs">{collection.type}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {documentCollectionId && (
                <p className="text-xs text-muted-foreground mt-2">
                  将基于该文档集进行知识检索和增强问答
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">选择问答模型</Label>
              <Select value={kbModelId} onValueChange={handleKbModelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择问答模型" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center space-x-2">
                        <span>{model.name}</span>
                        <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                该模型将用于处理检索到的文档并生成答案
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};