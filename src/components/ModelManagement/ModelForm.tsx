import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ModelConfig {
  id?: string;
  name: string;
  provider: string;
  endpoint: string;
  apiKey: string;
  modelName: string;
  modelVersion: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  description: string;
}

interface ModelFormProps {
  initialData?: ModelConfig;
  onSave: (data: Partial<ModelConfig>) => void;
}

export const ModelForm = ({ initialData, onSave }: ModelFormProps) => {
  const [formData, setFormData] = useState<Partial<ModelConfig>>(
    initialData || {
      name: "",
      provider: "Custom",
      endpoint: "",
      apiKey: "",
      modelName: "",
      modelVersion: "latest",
      maxTokens: 4096,
      temperature: 0.7,
      topP: 1.0,
      frequencyPenalty: 0,
      presencePenalty: 0,
      description: ""
    }
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label>模型名称</Label>
          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="例如：GPT-4 主模型" />
        </div>
        <div>
          <Label>提供商</Label>
          <Input value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} placeholder="例如：OpenAI" />
        </div>
        <div>
          <Label>API端点</Label>
          <Input value={formData.endpoint} onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })} placeholder="https://api.openai.com/v1" />
        </div>
        <div>
          <Label>API密钥</Label>
          <Input type="password" value={formData.apiKey} onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })} placeholder="sk-****************" />
        </div>
        <div>
          <Label>模型名称</Label>
          <Input value={formData.modelName} onChange={(e) => setFormData({ ...formData, modelName: e.target.value })} placeholder="例如：gpt-4" />
        </div>
        <div>
          <Label>模型版本</Label>
          <Input value={formData.modelVersion} onChange={(e) => setFormData({ ...formData, modelVersion: e.target.value })} placeholder="例如：latest" />
        </div>
        <div className="md:col-span-2">
          <Label>描述</Label>
          <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="模型描述..." />
        </div>
        <div>
          <Label>最大Token数</Label>
          <Input type="number" value={formData.maxTokens} onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })} />
        </div>
        <div>
          <Label>温度 (Temperature)</Label>
          <Input type="number" step="0.1" min="0" max="1" value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })} />
        </div>
        <div>
          <Label>Top P</Label>
          <Input type="number" step="0.1" min="0" max="1" value={formData.topP} onChange={(e) => setFormData({ ...formData, topP: parseFloat(e.target.value) })} />
        </div>
        <div>
          <Label>频率惩罚</Label>
          <Input type="number" step="0.1" min="-2" max="2" value={formData.frequencyPenalty} onChange={(e) => setFormData({ ...formData, frequencyPenalty: parseFloat(e.target.value) })} />
        </div>
        <div>
          <Label>存在惩罚</Label>
          <Input type="number" step="0.1" min="-2" max="2" value={formData.presencePenalty} onChange={(e) => setFormData({ ...formData, presencePenalty: parseFloat(e.target.value) })} />
        </div>
      </div>
      <div className="flex space-x-2 pt-4 border-t">
        <Button onClick={() => onSave(formData)}>保存</Button>
      </div>
    </div>
  );
};