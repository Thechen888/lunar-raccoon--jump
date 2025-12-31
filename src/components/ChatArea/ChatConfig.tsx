import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Database, Check } from "lucide-react";
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
    <div className="space-y-6">
      {/* 模式选择 */}
      <div>
        <Label className="text-sm font-semibold text-muted-foreground mb-3 block">对话模式</Label>
        <RadioGroup value={mode} onValueChange={(v) => handleModeChange(v as ChatMode)}>
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                mode === "llm" 
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900/30 shadow-md" 
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm"
              }`}
            >
              <RadioGroupItem value="llm" id="llm-mode" className="sr-only" />
              <Label htmlFor="llm-mode" className="cursor-pointer">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`p-2 rounded-lg ${
                    mode === "llm" 
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white" 
                      : "bg-slate-100 dark:bg-slate-800"
                  }`}>
                    <Brain className="h-5 w-5" />
                  </div>
                  <span className="font-semibold">LLM 模式</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  直接使用大语言模型
                </p>
                {mode === "llm" && (
                  <Check className="h-5 w-5 text-blue-500 absolute top-3 right-3" />
                )}
              </Label>
            </div>

            <div
              className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                mode === "knowledge" 
                  ? "border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900/30 shadow-md" 
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm"
              }`}
            >
              <RadioGroupItem value="knowledge" id="kb-mode" className="sr-only" />
              <Label htmlFor="kb-mode" className="cursor-pointer">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`p-2 rounded-lg ${
                    mode === "knowledge" 
                      ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white" 
                      : "bg-slate-100 dark:bg-slate-800"
                  }`}>
                    <Database className="h-5 w-5" />
                  </div>
                  <span className="font-semibold">知识库模式</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  基于文档库增强问答
                </p>
                {mode === "knowledge" && (
                  <Check className="h-5 w-5 text-purple-500 absolute top-3 right-3" />
                )}
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* LLM 模式配置 */}
      {mode === "llm" && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Label className="text-sm font-semibold text-muted-foreground">选择模型</Label>
          <Select value={modelId} onValueChange={handleModelChange}>
            <SelectTrigger className="h-12">
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
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <Label className="text-sm font-semibold text-muted-foreground mb-2 block">选择文档集</Label>
            <Select value={documentCollectionId} onValueChange={handleDocumentCollectionChange}>
              <SelectTrigger className="h-12">
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
            <Label className="text-sm font-semibold text-muted-foreground mb-2 block">选择问答模型</Label>
            <Select value={kbModelId} onValueChange={handleKbModelChange}>
              <SelectTrigger className="h-12">
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
    </div>
  );
};