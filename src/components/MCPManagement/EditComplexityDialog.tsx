import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditComplexityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complexity?: { id: string; name: string; description?: string } | null;
  onSave: (data: { id: string; name: string; description?: string }) => void;
  mode: "create" | "edit";
}

export const EditComplexityDialog = ({ open, onOpenChange, complexity, onSave, mode }: EditComplexityDialogProps) => {
  const [name, setName] = useState(complexity?.name || "");
  const [description, setDescription] = useState(complexity?.description || "");

  const handleSave = () => {
    if (!name.trim()) {
      alert("请输入名称");
      return;
    }
    onSave({
      id: complexity?.id || `complexity-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined
    });
    setName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "添加复杂度级别" : "编辑复杂度级别"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "添加新的复杂度级别（如：精简、一般、复杂、完全等）" : "编辑复杂度级别"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>名称 <span className="text-red-500">*</span></Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：精简"
            />
          </div>
          <div className="space-y-2">
            <Label>描述</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述这个复杂度级别..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="focus-visible:ring-2 focus-visible:ring-ring">
            取消
          </Button>
          <Button onClick={handleSave} className="focus-visible:ring-2 focus-visible:ring-ring">
            {mode === "create" ? "添加" : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};