import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";

export type DocumentSelection = {
  vectorDb: string;
  complexity: string;
  dbAddress: string;
  customAddress?: string;
};

interface VectorDB {
  id: string;
  name: string;
  complexityOptions: { name: string; address: string }[];
}

interface VectorDBProvider {
  id: string;
  name: string;
  description: string;
  databases: VectorDB[];
}

const vectorDbProviders: VectorDBProvider[] = [
  {
    id: "pinecone",
    name: "Pinecone",
    description: "Pinecone 向量数据库",
    databases: [
      {
        id: "china",
        name: "中国",
        complexityOptions: [
          { name: "精简", address: "https://china.pinecone.io/s1" },
          { name: "复杂", address: "https://china.pinecone.io/s2" }
        ]
      },
      {
        id: "us-east",
        name: "美国东部",
        complexityOptions: [
          { name: "精简", address: "https://us-east.pinecone.io/s1" },
          { name: "复杂", address: "https://us-east.pinecone.io/s2" }
        ]
      }
    ]
  },
  {
    id: "milvus",
    name: "Milvus",
    description: "Milvus 向量数据库",
    databases: [
      {
        id: "china",
        name: "中国",
        complexityOptions: [
          { name: "精简", address: "https://china.milvus.io/s1" },
          { name: "复杂", address: "https://china.milvus.io/s2" }
        ]
      }
    ]
  }
];

interface DocumentSelectorProps {
  onSelect: (selection: DocumentSelection | null) => void;
  selectedDoc: DocumentSelection | null;
}

export const DocumentSelector = ({ onSelect, selectedDoc }: DocumentSelectorProps) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedDbId, setSelectedDbId] = useState<string | null>(null);
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customAddress, setCustomAddress] = useState("");

  const handleSelect = (providerId: string, dbId: string, complexity: string, address: string) => {
    const selection: DocumentSelection = {
      vectorDb: providerId,
      complexity,
      dbAddress: address
    };
    onSelect(selection);
  };

  const handleAddCustom = () => {
    if (customName && customAddress) {
      const selection: DocumentSelection = {
        vectorDb: "custom",
        complexity: "自定义",
        dbAddress: customName,
        customAddress
      };
      onSelect(selection);
      setIsCustomDialogOpen(false);
      setCustomName("");
      setCustomAddress("");
    }
  };

  return (
    <div className="space-y-4">
      {/* 提供商选择 */}
      <div>
        <Label className="text-xs font-medium mb-2 block">提供商</Label>
        <div className="flex flex-wrap gap-2">
          {vectorDbProviders.map((provider) => (
            <Button
              key={provider.id}
              variant={selectedProvider === provider.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedProvider(provider.id);
                setSelectedDbId(null);
              }}
              className="h-8 text-xs"
            >
              {provider.name}
            </Button>
          ))}
          <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                自定义
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
        </div>
      </div>

      {/* 数据库和复杂度选择 */}
      {selectedProvider && (
        <div className="space-y-2">
          {vectorDbProviders
            .find((p) => p.id === selectedProvider)
            ?.databases.map((db) => (
              <div key={db.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">{db.name}</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {db.complexityOptions.map((option) => (
                    <div
                      key={option.name}
                      className={`p-2 border rounded-md cursor-pointer transition-colors text-xs ${
                        selectedDoc?.vectorDb === selectedProvider &&
                        selectedDoc?.dbAddress === option.address &&
                        selectedDoc?.complexity === option.name
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleSelect(selectedProvider, db.id, option.name, option.address)}
                    >
                      <div className="font-medium text-center">{option.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 已选摘要 */}
      {selectedDoc && selectedDoc.vectorDb === "custom" && (
        <div className="border-t pt-3">
          <div className="flex items-center justify-between p-2 bg-primary/5 rounded-md">
            <div>
              <div className="text-xs font-medium">{selectedDoc.dbAddress}</div>
              <div className="text-xs text-muted-foreground scale-75 origin-left">{selectedDoc.customAddress}</div>
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