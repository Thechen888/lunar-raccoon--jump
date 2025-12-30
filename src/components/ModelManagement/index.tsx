import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Cpu, Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { ModelTable } from "./ModelTable";
import { ModelForm } from "./ModelForm";

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  endpoint: string;
  apiKey: string;
  modelName: string;
  modelVersion: string;
  status: "active" | "inactive" | "error";
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  description: string;
  lastTested: string;
}

export const ModelManagement = () => {
  const [models, setModels] = useState<ModelConfig[]>([
    {
      id: "model-1",
      name: "GPT-4 主模型",
      provider: "OpenAI",
      endpoint: "https://api.openai.com/v1",
      apiKey: "sk-****************",
      modelName: "gpt-4",
      modelVersion: "latest",
      status: "active",
      maxTokens: 8000,
      temperature: 0.7,
      topP: 1.0,
      frequencyPenalty: 0,
      presencePenalty: 0,
      description: "最先进的语言模型",
      lastTested: "2024-01-15"
    },
    {
      id: "model-2",
      name: "GPT-3.5 Turbo",
      provider: "OpenAI",
      endpoint: "https://api.openai.com/v1",
      apiKey: "sk-****************",
      modelName: "gpt-3.5-turbo",
      modelVersion: "1106",
      status: "active",
      maxTokens: 4096,
      temperature: 0.7,
      topP: 1.0,
      frequencyPenalty: 0,
      presencePenalty: 0,
      description: "快速响应的模型",
      lastTested: "2024-01-15"
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [testingModel, setTestingModel] = useState<string | null>(null);

  const handleToggleModel = (modelId: string) => {
    setModels(models.map((model) => (model.id === modelId ? { ...model, status: model.status === "active" ? "inactive" : "active" } : model)));
    toast.success("模型状态已更新");
  };

  const handleDeleteModel = (modelId: string) => {
    setModels(models.filter((m) => m.id !== modelId));
    toast.success("模型已删除");
  };

  const handleTestModel = (modelId: string) => {
    setTestingModel(modelId);
    setTimeout(() => {
      setTestingModel(null);
      toast.success("模型测试成功");
    }, 2000);
  };

  const handleAddModel = (data: Partial<ModelConfig>) => {
    const newModel: ModelConfig = {
      id: `model-${Date.now()}`,
      name: data.name || "新模型",
      provider: data.provider || "Custom",
      endpoint: data.endpoint || "",
      apiKey: data.apiKey || "",
      modelName: data.modelName || "",
      modelVersion: data.modelVersion || "latest",
      status: "inactive",
      maxTokens: data.maxTokens || 4096,
      temperature: data.temperature || 0.7,
      topP: data.topP || 1.0,
      frequencyPenalty: data.frequencyPenalty || 0,
      presencePenalty: data.presencePenalty || 0,
      description: data.description || "",
      lastTested: "未测试"
    };
    setModels([...models, newModel]);
    setIsAddDialogOpen(false);
    toast.success("模型已添加");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Cpu className="h-5 w-5" />
                <span>模型管理</span>
              </CardTitle>
              <CardDescription>管理AI模型配置，支持OpenAI格式</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  添加模型
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>添加新模型</DialogTitle>
                  <DialogDescription>配置新的AI模型（仅支持OpenAI格式）</DialogDescription>
                </DialogHeader>
                <ModelForm onSave={handleAddModel} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <ModelTable
            models={models}
            onToggleModel={handleToggleModel}
            onEditModel={setEditingModel}
            onTestModel={handleTestModel}
            onDeleteModel={handleDeleteModel}
            testingModel={testingModel}
          />
        </CardContent>
      </Card>

      {editingModel && (
        <Dialog open={true} onOpenChange={() => setEditingModel(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>编辑模型 - {editingModel.name}</DialogTitle>
            </DialogHeader>
            <ModelForm
              initialData={editingModel}
              onSave={(data) => {
                setModels(models.map((m) => (m.id === editingModel.id ? { ...m, ...data } : m)));
                setEditingModel(null);
                toast.success("模型已更新");
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};