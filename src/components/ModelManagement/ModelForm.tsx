import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";

interface ModelConfig {
  id?: string;
  name: string;
  provider: string;
  endpoint: string;
  apiKey: string;
  modelName: string;
  maxTokens: number;
  temperature: number;
  topP: number;
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
      maxTokens: 4096,
      temperature: 0.7,
      topP: 1.0,
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
        <div className="md:col-span-2">
          <Label>描述</Label>
          <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="模型描述..." />
        </div>
        
        {/* 最大Token数 */}
        <div>
          <Label>最大Token数</Label>
          <Input 
            type="number" 
            value={formData.maxTokens} 
            onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })} 
          />
        </div>
        
        {/* 温度 */}
        <div>
          <div className="flex items-center space-x-1">
            <Label>温度</Label>
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <Input 
            type="number" 
            step="0.1" 
            min="0" 
            max="2" 
            value={formData.temperature} 
            onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })} 
          />
          <p className="text-xs text-muted-foreground mt-1">
            模型生成文本的随机程度。值越大，回复内容越富有多样性、创造性、随机性；设为0根据事实回答。日常聊天建议设置为 0.7。
          </p>
        </div>
        
        {/* Top P */}
        <div>
          <div className="flex items-center space-x-1">
            <Label>Top P</Label>
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <Input 
            type="number" 
            step="0.1" 
            min="0" 
            max="1" 
            value={formData.topP} 
            onChange={(e) => setFormData({ ...formData, topP: parseFloat(e.target.value) })} 
          />
          <p className="text-xs text-muted-foreground mt-1">
            默认值为1，值越小，AI生成的内容越单调，也越容易理解；值越大，AI回复的词汇范围越大，越多样化。
          </p>
        </div>
      </div>
      <div className="flex space-x-2 pt-4 border-t">
        <Button onClick={() => onSave(formData)}>保存</Button>
      </div>
    </div>
  );
};