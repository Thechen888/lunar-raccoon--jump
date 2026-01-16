import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditRegionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region?: { id: string; name: string } | null;
  onSave: (data: { id: string; name: string }) => void;
  mode: "create" | "edit";
}

export const EditRegionDialog = ({ open, onOpenChange, region, onSave, mode }: EditRegionDialogProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(region?.name || "");
  }, [region]);

  const handleSave = () => {
    if (!name.trim()) {
      alert("请输入名称");
      return;
    }
    onSave({
      id: region?.id || `region-${Date.now()}`,
      name: name.trim()
    });
    setName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "添加区域" : "编辑区域"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "添加新的区域（如：中国、欧洲、美国等）" : "编辑区域名称"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>名称 <span className="text-red-500">*</span></Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：中国"
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