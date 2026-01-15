import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export interface MCPComplexity {
  id: string;
  name: string;
  description?: string;
}

interface BatchEditComplexityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complexities: MCPComplexity[];
  onSave: (updates: Array<{ id: string; name: string; description?: string }>) => void;
}

export const BatchEditComplexityDialog = ({ open, onOpenChange, complexities, onSave }: BatchEditComplexityDialogProps) => {
  const [updates, setUpdates] = useState<Array<{ id: string; name: string; description?: string }>>([]);

  // 当对话框打开或complexities变化时，初始化updates
  useEffect(() => {
    if (open) {
      setUpdates(complexities.map(c => ({ id: c.id, name: c.name, description: c.description })));
    }
  }, [open, complexities]);

  const handleNameChange = (id: string, newName: string) => {
    setUpdates(updates.map(u => u.id === id ? { ...u, name: newName } : u));
  };

  const handleDescriptionChange = (id: string, newDesc: string) => {
    setUpdates(updates.map(u => u.id === id ? { ...u, description: newDesc } : u));
  };

  const handleSave = () => {
    // 验证所有名称都不为空
    const emptyName = updates.find(u => !u.name.trim());
    if (emptyName) {
      toast.error("所有复杂度名称都不能为空");
      return;
    }

    onSave(updates);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>批量修改复杂度</DialogTitle>
          <DialogDescription>
            统一修改所有区域中的复杂度级别名称和描述
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {complexities.map((complexity, index) => {
            const update = updates.find(u => u.id === complexity.id) || complexity;
            return (
              <div key={complexity.id} className="space-y-3">
                <div>
                  <Label>复杂度级别 {index + 1} 名称</Label>
                  <Input
                    value={update.name}
                    onChange={(e) => handleNameChange(complexity.id, e.target.value)}
                    placeholder="例如：精简"
                  />
                </div>
                <div>
                  <Label>描述</Label>
                  <Input
                    value={update.description || ""}
                    onChange={(e) => handleDescriptionChange(complexity.id, e.target.value)}
                    placeholder="描述这个复杂度级别..."
                  />
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存修改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};