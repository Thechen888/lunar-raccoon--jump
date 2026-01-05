import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";

export type DocumentSelection = {
  provider: string;
  name: string;
  dbAddress: string;
};

const vectorDbProviders = [
  {
    id: "pinecone",
    name: "Pinecone",
    description: "Pinecone 向量数据库",
    address: "https://pinecone.io"
  },
  {
    id: "milvus",
    name: "Milvus",
    description: "Milvus 向量数据库",
    address: "https://milvus.io"
  }
];

interface DocumentSelectorProps {
  onSelect: (selection: DocumentSelection | null) => void;
  selectedDoc: DocumentSelection | null;
}

export const DocumentSelector = ({ onSelect, selectedDoc }: DocumentSelectorProps) => {
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customAddress, setCustomAddress] = useState("");

  const handleSelect = (providerId: string, name: string, address: string) => {
    const selection: DocumentSelection = {
      provider: providerId,
      name,
      dbAddress: address
    };
    onSelect(selection);
  };

  const handleAddCustom = () => {
    if (customName && customAddress) {
      const selection: DocumentSelection = {
        provider: "custom",
        name: customName,
        dbAddress: customAddress
      };
      onSelect(selection);
      setIsCustomDialogOpen(false);
      setCustomName("");
      setCustomAddress("");
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-xs font-medium mb-2 block">选择向量数据库</Label>
      
      {/* 预设提供商 */}
      <div className="grid grid-cols-2 gap-2">
        {vectorDbProviders.map((provider) => (
          <div
            key={provider.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedDoc?.provider === provider.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => handleSelect(provider.id, provider.name, provider.address)}
          >
            <div className="font-medium text-sm">{provider.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{provider.description}</div>
          </div>
        ))}
      </div>

      {/* 自定义添加 */}
      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            添加自定义数据库
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加自定义向量数据库</DialogTitle>
            <DialogDescription>配置自定义向量数据库地址</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>名称</Label>
              <Input
                placeholder="例如：我的数据库"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>
            <div>
              <Label>数据库地址</Label>
              <Input
                placeholder="https://db.example.com"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddCustom}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 已选摘要 */}
      {selectedDoc && (
        <div className="border-t pt-3">
          <div className="flex items-center justify-between p-2 bg-primary/5 rounded-md">
            <div>
              <div className="text-xs font-medium">{selectedDoc.name}</div>
              <div className="text-xs text-muted-foreground scale-75 origin-left">{selectedDoc.dbAddress}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect(null)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};