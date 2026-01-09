import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FileText, Search } from "lucide-react";
import { toast } from "sonner";

interface DocumentCollection {
  id: string;
  name: string;
  type: string;
  description: string;
  documentCount: number;
  qaCount: number;
  lastUpdated: string;
  tags: string[];
  vectorIndexStatus: "ready" | "building" | "none";
}

interface QAItem {
  id: string;
  question: string;
  answer: string;
  documentCollectionId: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export const DocumentManagement = () => {
  const [activeTab, setActiveTab] = useState("collections");
  const [searchTerm, setSearchTerm] = useState("");
  const [qaStatusFilter, setQaStatusFilter] = useState<string>("all");
  
  // 文档集管理
  const [collections, setCollections] = useState<DocumentCollection[]>([
    {
      id: "collection-1",
      name: "技术文档-中文",
      type: "技术文档",
      description: "包含公司所有技术文档的中文版本",
      documentCount: 120,
      qaCount: 56,
      lastUpdated: "2024-01-15",
      tags: ["技术", "中文", "开发"],
      vectorIndexStatus: "ready"
    },
    {
      id: "collection-2",
      name: "业务文档-中文",
      type: "业务文档",
      description: "包含业务流程和操作文档",
      documentCount: 45,
      qaCount: 23,
      lastUpdated: "2024-01-14",
      tags: ["业务", "操作"],
      vectorIndexStatus: "ready"
    },
    {
      id: "collection-3",
      name: "法律文档-欧洲",
      type: "法律文档",
      description: "欧洲地区的法律和合规文档",
      documentCount: 30,
      qaCount: 12,
      lastUpdated: "2024-01-13",
      tags: ["法律", "欧洲", "合规"],
      vectorIndexStatus: "building"
    },
    {
      id: "collection-4",
      name: "知识库",
      type: "知识库",
      description: "通用知识库文档",
      documentCount: 200,
      qaCount: 89,
      lastUpdated: "2024-01-10",
      tags: ["知识库"],
      vectorIndexStatus: "none"
    }
  ]);

  // QA管理
  const [qaItems, setQaItems] = useState<QAItem[]>([
    {
      id: "qa-1",
      question: "如何创建新的文档集？",
      answer: "在文档管理页面，点击"添加文档集"按钮，填写相关信息后保存即可创建新的文档集。",
      documentCollectionId: "collection-1",
      status: "active",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-15"
    },
    {
      id: "qa-2",
      question: "如何上传文档到文档集？",
      answer: "选择目标文档集后，点击"上传文档"按钮，选择本地文件即可上传。支持PDF、Word、TXT等格式。",
      documentCollectionId: "collection-1",
      status: "active",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-15"
    },
    {
      id: "qa-3",
      question: "文档上传后如何处理？",
      answer: "文档上传后会自动进行解析、分块、向量化处理，处理后即可用于问答。",
      documentCollectionId: "collection-1",
      status: "inactive",
      createdAt: "2024-01-11",
      updatedAt: "2024-01-15"
    }
  ]);

  // Dialog状态
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [isQaDialogOpen, setIsQaDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");

  // 表单状态
  const [collectionForm, setCollectionForm] = useState({
    name: "",
    type: "",
    description: "",
    tags: ""
  });

  const [qaForm, setQaForm] = useState({
    question: "",
    answer: "",
    documentCollectionId: "",
    status: "active" as "active" | "inactive"
  });

  // 筛选文档集
  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 筛选QA
  const filteredQaItems = qaItems.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      qaStatusFilter === "all" ||
      (qaStatusFilter === "active" && item.status === "active") ||
      (qaStatusFilter === "inactive" && item.status === "inactive");
    return matchesSearch && matchesStatus;
  });

  // 处理文档集保存
  const handleCollectionSave = () => {
    if (!collectionForm.name.trim()) {
      toast.error("请输入文档集名称");
      return;
    }
    
    if (mode === "create") {
      const newCollection: DocumentCollection = {
        id: `collection-${Date.now()}`,
        name: collectionForm.name,
        type: collectionForm.type,
        description: collectionForm.description,
        documentCount: 0,
        qaCount: 0,
        lastUpdated: new Date().toISOString().split("T")[0],
        tags: collectionForm.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
        vectorIndexStatus: "none"
      };
      setCollections([...collections, newCollection]);
      toast.success("文档集已创建");
    } else {
      setCollections(
        collections.map((c) =>
          c.id === editingItem.id
            ? { ...c, name: collectionForm.name, type: collectionForm.type, description: collectionForm.description, tags: collectionForm.tags.split(",").map(tag => tag.trim()).filter(tag => tag) }
            : c
        )
      );
      toast.success("文档集已更新");
    }
    setIsCollectionDialogOpen(false);
    setCollectionForm({ name: "", type: "", description: "", tags: "" });
    setEditingItem(null);
  };

  // 处理QA保存
  const handleQaSave = () => {
    if (!qaForm.question.trim()) {
      toast.error("请输入问题");
      return;
    }
    if (!qaForm.answer.trim()) {
      toast.error("请输入答案");
      return;
    }

    if (mode === "create") {
      const newQaItem: QAItem = {
        id: `qa-${Date.now()}`,
        question: qaForm.question,
        answer: qaForm.answer,
        documentCollectionId: qaForm.documentCollectionId,
        status: qaForm.status,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0]
      };
      setQaItems([...qaItems, newQaItem]);
      toast.success("QA已创建");
    } else {
      setQaItems(
        qaItems.map((q) =>
          q.id === editingItem.id
            ? { ...q, question: qaForm.question, answer: qaForm.answer, documentCollectionId: qaForm.documentCollectionId, status: qaForm.status, updatedAt: new Date().toISOString().split("T")[0] }
            : q
        )
      );
      toast.success("QA已更新");
    }
    setIsQaDialogOpen(false);
    setQaForm({ question: "", answer: "", documentCollectionId: "", status: "active" });
    setEditingItem(null);
  };

  // 删除文档集
  const handleDeleteCollection = (id: string) => {
    setCollections(collections.filter((c) => c.id !== id));
    toast.success("文档集已删除");
  };

  // 删除QA
  const handleDeleteQa = (id: string) => {
    setQaItems(qaItems.filter((q) => q.id !== id));
    toast.success("QA已删除");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>文档管理</span>
          </CardTitle>
          <CardDescription>管理文档集和QA问答</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="collections">文档集管理</TabsTrigger>
              <TabsTrigger value="qa">QA管理</TabsTrigger>
            </TabsList>

            {/* 文档集管理 */}
            <TabsContent value="collections" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索文档集..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Dialog open={isCollectionDialogOpen} onOpenChange={setIsCollectionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setMode("create"); setEditingItem(null); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加文档集
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{mode === "create" ? "添加文档集" : "编辑文档集"}</DialogTitle>
                      <DialogDescription>
                        {mode === "create" ? "创建新的文档集来组织您的文档" : "编辑文档集信息"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>名称</Label>
                        <Input
                          value={collectionForm.name}
                          onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })}
                          placeholder="例如：技术文档-中文"
                        />
                      </div>
                      <div>
                        <Label>类型</Label>
                        <Input
                          value={collectionForm.type}
                          onChange={(e) => setCollectionForm({ ...collectionForm, type: e.target.value })}
                          placeholder="例如：技术文档"
                        />
                      </div>
                      <div>
                        <Label>描述</Label>
                        <Textarea
                          value={collectionForm.description}
                          onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
                          placeholder="描述这个文档集的用途..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>标签（用逗号分隔）</Label>
                        <Input
                          value={collectionForm.tags}
                          onChange={(e) => setCollectionForm({ ...collectionForm, tags: e.target.value })}
                          placeholder="例如：技术, 中文, 开发"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCollectionDialogOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleCollectionSave}>保存</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCollections.map((collection) => (
                  <Card key={collection.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CardTitle className="text-lg">{collection.name}</CardTitle>
                            <Badge variant="outline">{collection.type}</Badge>
                          </div>
                          <CardDescription>{collection.description}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setMode("edit");
                              setEditingItem(collection);
                              setCollectionForm({
                                name: collection.name,
                                type: collection.type,
                                description: collection.description,
                                tags: collection.tags.join(", ")
                              });
                              setIsCollectionDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCollection(collection.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">文档数量</span>
                          <span className="font-medium">{collection.documentCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">QA数量</span>
                          <span className="font-medium">{collection.qaCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">向量索引状态</span>
                          <Badge
                            variant={
                              collection.vectorIndexStatus === "ready"
                                ? "default"
                                : collection.vectorIndexStatus === "building"
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {collection.vectorIndexStatus === "ready"
                              ? "就绪"
                              : collection.vectorIndexStatus === "building"
                              ? "构建中"
                              : "未索引"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">最后更新</span>
                          <span className="text-xs">{collection.lastUpdated}</span>
                        </div>
                        {collection.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2 border-t">
                            {collection.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* QA管理 */}
            <TabsContent value="qa" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索QA..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={qaStatusFilter} onValueChange={(v: any) => setQaStatusFilter(v)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="active">启用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={isQaDialogOpen} onOpenChange={setIsQaDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setMode("create"); setEditingItem(null); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加QA
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{mode === "create" ? "添加QA" : "编辑QA"}</DialogTitle>
                      <DialogDescription>
                        {mode === "create" ? "创建新的问答对" : "编辑问答对信息"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>问题</Label>
                        <Textarea
                          value={qaForm.question}
                          onChange={(e) => setQaForm({ ...qaForm, question: e.target.value })}
                          placeholder="输入问题..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>答案</Label>
                        <Textarea
                          value={qaForm.answer}
                          onChange={(e) => setQaForm({ ...qaForm, answer: e.target.value })}
                          placeholder="输入答案..."
                          rows={5}
                        />
                      </div>
                      <div>
                        <Label>所属文档集</Label>
                        <Select
                          value={qaForm.documentCollectionId}
                          onValueChange={(value) => setQaForm({ ...qaForm, documentCollectionId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择文档集" />
                          </SelectTrigger>
                          <SelectContent>
                            {collections.map((collection) => (
                              <SelectItem key={collection.id} value={collection.id}>
                                {collection.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>状态</Label>
                        <Select
                          value={qaForm.status}
                          onValueChange={(value: "active" | "inactive") => setQaForm({ ...qaForm, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">启用</SelectItem>
                            <SelectItem value="inactive">禁用</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsQaDialogOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleQaSave}>保存</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>问题</TableHead>
                    <TableHead>答案</TableHead>
                    <TableHead>文档集</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>最后更新</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQaItems.map((qa) => (
                    <TableRow key={qa.id}>
                      <TableCell>
                        <div className="font-medium max-w-[200px] truncate">{qa.question}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground max-w-[300px] truncate">{qa.answer}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {collections.find((c) => c.id === qa.documentCollectionId)?.name || "未知"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={qa.status === "active" ? "default" : "secondary"}>
                          {qa.status === "active" ? "启用" : "禁用"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">{qa.updatedAt}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setMode("edit");
                              setEditingItem(qa);
                              setQaForm({
                                question: qa.question,
                                answer: qa.answer,
                                documentCollectionId: qa.documentCollectionId,
                                status: qa.status
                              });
                              setIsQaDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQa(qa.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};