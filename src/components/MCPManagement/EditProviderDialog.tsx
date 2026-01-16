import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface EditProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider?: { id: string; name: string; layer?: number } | null;
  onSave: (data: { id: string; name: string; layer: number }) => void;
  mode: "create" | "edit";
}

export const EditProviderDialog = ({ open, onOpenChange, provider, onSave, mode }: EditProviderDialogProps) => {
  const [name, setName] = useState("");
  const [layer, setLayer] = useState(3);

  useEffect(() => {
    setName(provider?.name || "");
    if (provider?.layer !== undefined) {
      setLayer(provider.layer);
    }
  }, [provider]);

  const handleSave = () => {
    if (!name.trim()) {
      alert("请输入名称");
      return;
    }
    onSave({
      id: provider?.id || `provider-${Date.now()}`,
      name: name.trim(),
      layer
    });
    setName("");
    setLayer(3);
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
          <div className="space-y-2">
            <Label>名称 <span className="text-red-500">*</span></Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：PANGU"
            />
          </div>
          {mode === "create" && (
            <div className="space-y-2">
              <Label>层级结构 <span className="text-red-500">*</span></Label>
              <RadioGroup value={layer.toString()} onValueChange={(v) => setLayer(parseInt(v))}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="1" id="layer-1" className="focus-visible:ring-2 focus-visible:ring-ring" />
                  <Label htmlFor="layer-1" className="cursor-pointer">
                    <div>
                      <span className="font-medium">一层</span>
                      <p className="text-xs text-muted-foreground">直接在提供商上配置服务</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="2" id="layer-2" className="focus-visible:ring-2 focus-visible:ring-ring" />
                  <Label htmlFor="layer-2" className="cursor-pointer">
                    <div>
                      <span className="font-medium">二层</span>
                      <p className="text-xs text-muted-foreground">提供商 → 区域，在区域上配置</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="layer-3" className="focus-visible:ring-2 focus-visible:ring-ring" />
                  <Label htmlFor="layer-3" className="cursor-pointer">
                    <div>
                      <span className="font-medium">三层</span>
                      <p className="text-xs text-muted-foreground">提供商 → 区域 → 复杂度，在复杂度上配置</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
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