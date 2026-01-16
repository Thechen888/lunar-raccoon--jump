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
  maxInputTokens: number;
  maxOutputTokens: number;
  temperature: number;
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
      maxInputTokens: 4096,
      maxOutputTokens: 4096,
      temperature: 0.7,
      description: ""
    }
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>提供商</Label>
          <Input value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} placeholder="例如：OpenAI" className="focus-visible:ring-0 focus-visible:ring-offset-0" />
        </div>
        <div className="space-y-2">
          <Label>API端点</Label>
          <Input value={formData.endpoint} onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })} placeholder="https://api.openai.com/v1" className="focus-visible:ring-0 focus-visible:ring-offset-0" />
        </div>
        <div className="space-y-2">
          <Label>API密钥</Label>
          <Input type="password" value={formData.apiKey} onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })} placeholder="sk-****************" className="focus-visible:ring-0 focus-visible:ring-offset-0" />
        </div>
        <div className="space-y-2">
          <Label>模型名称</Label>
          <Input value={formData.modelName} onChange={(e) => setFormData({ ...formData, modelName: e.target.value })} placeholder="例如：gpt-4" className="focus-visible:ring-0 focus-visible:ring-offset-0" />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label>描述</Label>
          <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="模型描述..." className="focus-visible:ring-0 focus-visible:ring-offset-0" />
        </div>
        
        {/* 最大输入Token数 */}
        <div className="space-y-2">
          <Label>最大输入Token数</Label>
          <Input 
            type="number" 
            value={formData.maxInputTokens} 
            onChange={(e) => setFormData({ ...formData, maxInputTokens: parseInt(e.target.value) })} 
            className="focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        
        {/* 最大输出Token数 */}
        <div className="space-y-2">
          <Label>最大输出Token数</Label>
          <Input 
            type="number" 
            value={formData.maxOutputTokens} 
            onChange={(e) => setFormData({ ...formData, maxOutputTokens: parseInt(e.target.value) })} 
            className="focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        
        {/* 温度 */}
        <div className="md:col-span-2 space-y-2">
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
            className="focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <p className="text-xs text-muted-foreground mt-1">
            模型生成文本的随机程度。值越大，回复内容越富有多样性、创造性、随机性；设为0根据事实回答。日常聊天建议设置为 0.7。
          </p>
        </div>
      </div>
      <div className="flex space-x-2 pt-4 border-t">
        <Button onClick={() => onSave(formData)}>保存</Button>
      </div>
    </div>
  );
};