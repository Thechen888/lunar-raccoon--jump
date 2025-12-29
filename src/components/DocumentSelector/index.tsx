import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import { VectorDBSelector } from "./VectorDBSelector";
import { VectorDBComplexityItem } from "./VectorDBComplexityItem";

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
  const [expandedDatabases, setExpandedDatabases] = useState<Set<string>>(new Set(["china"]));
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customAddress, setCustomAddress] = useState("");

  const toggleExpand = (dbId: string) => {
    const newExpanded = new Set(expandedDatabases);
    if (newExpanded.has(dbId)) {
      newExpanded.delete(dbId);
    } else {
      newExpanded.add(dbId);
    }
    setExpandedDatabases(newExpanded);
  };

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>向量数据库选择</span>
            </CardTitle>
            <CardDescription>选择向量数据库提供商、区域和复杂度</CardDescription>
          </div>
          <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                自定义
              </Button>
            </DialogTrigger>
            <DialogContent>
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
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">提供商</Label>
            <div className="flex flex-wrap gap-2">
              {vectorDbProviders.map((provider) => (
                <Button
                  key={provider.id}
                  variant={selectedProvider === provider.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedProvider(provider.id);
                    setExpandedDatabases(new Set());
                  }}
                >
                  {provider.name}
                </Button>
              ))}
            </div>
          </div>

          {selectedProvider && (
            <div className="border-t pt-4">
              <VectorDBSelector
                databases={vectorDbProviders.find((p) => p.id === selectedProvider)?.databases || []}
                expandedDatabases={expandedDatabases}
                onToggleExpand={toggleExpand}
              />
              {vectorDbProviders
                .find((p) => p.id === selectedProvider)
                ?.databases.map((db) => (
                  expandedDatabases.has(db.id) && (
                    <div key={db.id} className="border-t bg-background p-3 space-y-2 mt-0">
                      {db.complexityOptions.map((option) => (
                        <VectorDBComplexityItem
                          key={option.name}
                          dbId={db.id}
                          complexity={option.name}
                          dbAddress={option.address}
                          isSelected={
                            selectedDoc?.vectorDb === selectedProvider &&
                            selectedDoc?.dbAddress === option.address &&
                            selectedDoc?.complexity === option.name
                          }
                          onSelect={(dbId, complexity) => handleSelect(selectedProvider, dbId, complexity, option.address)}
                        />
                      ))}
                    </div>
                  )
                ))}
            </div>
          )}

          {selectedDoc && selectedDoc.vectorDb === "custom" && (
            <div className="border-t pt-4 p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{selectedDoc.dbAddress}</div>
                  <div className="text-xs text-muted-foreground">{selectedDoc.customAddress}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelect(null)}
                >
                  移除
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};