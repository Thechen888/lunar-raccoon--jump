import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider?: { id: string; name: string } | null;
  onSave: (data: { id: string; name: string }) => void;
  mode: "create" | "edit";
}

export const EditProviderDialog = ({ open, onOpenChange, provider, onSave, mode }: EditProviderDialogProps) => {
  const [name, setName] = useState(provider?.name || "");

  const handleSave = () => {
    if (!name.trim()) {
      alert("请输入名称");
      return;
    }
    onSave({
      id: provider?.id || `provider-${Date.now()}`,
      name: name.trim()
    });
    setName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "添加服务提供商" : "编辑服务提供商"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "添加新的服务提供商（如：PANGU、HUB等）" : "编辑服务提供商名称"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>名称 <span className="text-red-500">*</span></Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：PANGU"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            {mode === "create" ? "添加" : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};