import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

interface Prompt {
  id: string;
  name: string;
  content: string;
}

interface ModelConfig {
  id: string;
  prompts?: Prompt[];
}

interface PromptConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: ModelConfig | null;
  onSave: (modelId: string, prompts: Prompt[]) => void;
}

export const PromptConfigDialog = ({ open, onOpenChange, model, onSave }: PromptConfigDialogProps) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [newPromptName, setNewPromptName] = useState("");
  const [newPromptContent, setNewPromptContent] = useState("");

  // 当model变化时，加载其提示词
  useEffect(() => {
    if (model) {
      setPrompts(model.prompts || []);
    }
  }, [model]);

  const handleAddPrompt = () => {
    if (!newPromptName.trim()) {
      toast.error("请输入提示词名称");
      return;
    }
    if (!newPromptContent.trim()) {
      toast.error("请输入提示词内容");
      return;
    }

    const newPrompt: Prompt = {
      id: `prompt-${Date.now()}`,
      name: newPromptName.trim(),
      content: newPromptContent.trim()
    };

    setPrompts([...prompts, newPrompt]);
    setNewPromptName("");
    setNewPromptContent("");
    toast.success("提示词已添加");
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setNewPromptName(prompt.name);
    setNewPromptContent(prompt.content);
  };

  const handleUpdatePrompt = () => {
    if (!editingPrompt) return;

    setPrompts(prompts.map(p => 
      p.id === editingPrompt.id 
        ? { ...p, name: newPromptName.trim(), content: newPromptContent.trim() }
        : p
    ));

    setEditingPrompt(null);
    setNewPromptName("");
    setNewPromptContent("");
    toast.success("提示词已更新");
  };

  const handleDeletePrompt = (promptId: string) => {
    setPrompts(prompts.filter(p => p.id !== promptId));
    toast.success("提示词已删除");
  };

  const handleCancelEdit = () => {
    setEditingPrompt(null);
    setNewPromptName("");
    setNewPromptContent("");
  };

  const handleSave = () => {
    if (model) {
      onSave(model.id, prompts);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>配置提示词 - {model?.id}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* 提示词列表 */}
          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className={`border rounded-lg p-3 ${
                  editingPrompt?.id === prompt.id ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">{prompt.name}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPrompt(prompt)}
                      disabled={editingPrompt?.id === prompt.id}
                      className="h-6 px-2 text-xs focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="h-6 px-2 text-xs text-destructive focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      删除
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap max-h-20 overflow-y-auto">
                  {prompt.content}
                </p>
              </div>
            ))}

            {prompts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                暂无提示词，请在下方添加
              </div>
            )}
          </div>

          {/* 添加/编辑表单 */}
          <div className="border-t pt-4 space-y-3 px-6">
            <div className="flex items-center justify-between">
              <Label>{editingPrompt ? "编辑提示词" : "添加新提示词"}</Label>
              {editingPrompt && (
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-6 px-2 text-xs focus-visible:ring-2 focus-visible:ring-ring">
                  取消编辑
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">名称</Label>
              <Input
                value={newPromptName}
                onChange={(e) => setNewPromptName(e.target.value)}
                placeholder="例如：系统提示词"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">内容</Label>
              <Textarea
                value={newPromptContent}
                onChange={(e) => setNewPromptContent(e.target.value)}
                placeholder="输入提示词内容..."
                rows={3}
                className="text-sm resize-none"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={editingPrompt ? handleUpdatePrompt : handleAddPrompt}
                disabled={!newPromptName.trim() || !newPromptContent.trim()}
                className="focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="h-4 w-4 mr-2" />
                {editingPrompt ? "更新提示词" : "添加提示词"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="focus-visible:ring-2 focus-visible:ring-ring">
            取消
          </Button>
          <Button onClick={handleSave} className="focus-visible:ring-2 focus-visible:ring-ring">
            保存配置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};