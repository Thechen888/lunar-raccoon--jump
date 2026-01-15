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
  onSave: (updates: Array<{ originalName: string; newName: string; description?: string }>) => void;
}

export const BatchEditComplexityDialog = ({ open, onOpenChange, complexities, onSave }: BatchEditComplexityDialogProps) => {
  // 存储更新数据：以complexity的id为key，值为 { originalName, newName, description }
  const [updates, setUpdates] = useState<Record<string, { originalName: string; newName: string; description?: string }>>({});

  // 当对话框打开或complexities变化时，初始化updates
  useEffect(() => {
    if (open) {
      const newUpdates: Record<string, { originalName: string; newName: string; description?: string }> = {};
      complexities.forEach(c => {
        newUpdates[c.id] = {
          originalName: c.name, // 保存原始名称
          newName: c.name, 
          description: c.description 
        };
      });
      setUpdates(newUpdates);
    }
  }, [open, complexities]);

  const handleNameChange = (complexityId: string, newName: string) => {
    setUpdates({
      ...updates,
      [complexityId]: { ...updates[complexityId], newName }
    });
  };

  const handleDescriptionChange = (complexityId: string, newDesc: string) => {
    setUpdates({
      ...updates,
      [complexityId]: { ...updates[complexityId], description: newDesc }
    });
  };

  const handleSave = () => {
    // 转换为数组格式
    const updatesArray = complexities.map(c => updates[c.id]);
    
    // 验证所有名称都不为空
    const emptyName = updatesArray.find(u => !u || !u.newName.trim());
    if (emptyName) {
      toast.error("所有复杂度名称都不能为空");
      return;
    }

    onSave(updatesArray);
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
            const update = updates[complexity.id];
            
            // 如果update还没有初始化，先显示原始值
            const displayName = update ? update.newName : complexity.name;
            const displayDescription = update !== undefined ? update.description : complexity.description;
            
            return (
              <div key={complexity.id} className="space-y-3">
                <div>
                  <Label>复杂度级别 {index + 1} 名称</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => handleNameChange(complexity.id, e.target.value)}
                    placeholder={complexity.name}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>描述</Label>
                  <Input
                    value={displayDescription || ""}
                    onChange={(e) => handleDescriptionChange(complexity.id, e.target.value)}
                    placeholder="描述这个复杂度级别..."
                    className="w-full"
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