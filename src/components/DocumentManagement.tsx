import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, Search, Plus, Edit, Trash2, Check, X, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { DocumentCard } from "./DocumentSelector/DocumentCard";

interface Document {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive";
  documentCount: number;
  qaCount: number;
  description: string;
  lastUpdated: string;
  tags: string[];
  vectorIndexStatus: "ready" | "building" | "none";
}

interface QA {
  id: string;
  question: string;
  answer: string;
  status: "active" | "inactive";
  tags: string[];
  createdAt: string;
}

export const DocumentManagement = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "doc-1",
      name: "技术文档-中文",
      type: "技术文档",
      status: "active",
      documentCount: 156,
      qaCount: 89,
      description: "产品技术规格说明书和开发文档",
      lastUpdated: "2024-01-15",
      tags: ["技术", "开发", "文档"],
      vectorIndexStatus: "ready"
    },
    {
      id: "doc-2",
      name: "业务文档-中文",
      type: "业务文档",
      status: "active",
      documentCount: 234,
      qaCount: 156,
      description: "公司业务流程和规章制度",
      lastUpdated: "2024-01-14",
      tags: ["业务", "流程"],
      vectorIndexStatus: "ready"
    },
    {
      id: "doc-3",
      name: "法律文档-欧洲",
      type: "法律文档",
      status: "inactive",
      documentCount: 89,
      qaCount: 45,
      description: "欧洲地区法律法规汇编",
      lastUpdated: "2024-01-13",
      tags: ["法律", "欧洲"],
      vectorIndexStatus: "building"
    }
  ]);

  const [qaList, setQaList] = useState<QA[]>([
    {
      id: "qa-1",
      question: "如何重置密码？",
      answer: "请访问设置页面，点击安全设置，选择重置密码选项。",
      status: "active",
      tags: ["账户", "安全"],
      createdAt: "2024-01-15"
    },
    {
      id: "qa-2",
      question: "如何上传文档？",
      answer: "在文档管理页面，点击上传按钮，选择文件后即可上传。",
      status: "active",
      tags: ["文档", "操作"],
      createdAt: "2024-01-14"
    },
    {
      id: "qa-3",
      question: "系统支持哪些格式？",
      answer: "支持 PDF、DOC、DOCX、TXT 等常见格式。",
      status: "inactive",
      tags: ["格式", "文档"],
      createdAt: "2024-01-13"
    }
  ]);

  const [activeTab, setActiveTab] = useState("documents");
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDocDialogOpen, setIsAddDocDialogOpen] = useState(false);
  const [isAddQADialogOpen, setIsAddQADialogOpen] = useState(false);
  const [editingQA, setEditingQA] = useState<QA | null>(null);
  const [newQA, setNewQA] = useState({ question: "", answer: "", tags: "" });
  const [qaSearchTerm, setQaSearchTerm] = useState("");
  const [qaStatusFilter, setQaStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const qaStats = {
    total: qaList.length,
    active: qaList.filter(qa => qa.status === "active").length,
    inactive: qaList.filter(qa => qa.status === "inactive").length
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredQA = qaList.filter(qa => {
    const matchesSearch = qa.question.toLowerCase().includes(qaSearchTerm.toLowerCase()) ||
                         qa.answer.toLowerCase().includes(qaSearchTerm.toLowerCase());
    const matchesStatus = qaStatusFilter === "all" || qa.status === qaStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddQA = () => {
    if (!newQA.question.trim() || !newQA.answer.trim()) {
      toast.error("请填写问题和答案");
      return;
    }
    const qa: QA = {
      id: `qa-${Date.now()}`,
      question: newQA.question,
      answer: newQA.answer,
      status: "active",
      tags: newQA.tags.split(",").map(t => t.trim()).filter(t => t),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setQaList([qa, ...qaList]);
    setNewQA({ question: "", answer: "", tags: "" });
    setIsAddQADialogOpen(false);
    toast.success("QA已添加");
  };

  const handleEditQA = (qa: QA) => {
    setEditingQA(qa);
    setNewQA({
      question: qa.question,
      answer: qa.answer,
      tags: qa.tags.join(", ")
    });
  };

  const handleUpdateQA = () => {
    if (!editingQA || !newQA.question.trim() || !newQA.answer.trim()) {
      toast.error("请填写问题和答案");
      return;
    }
    setQaList(qaList.map(q => 
      q.id === editingQA.id 
        ? { ...q, question: newQA.question, answer: newQA.answer, tags: newQA.tags.split(",").map(t => t.trim()).filter(t => t) }
        : q
    ));
    setEditingQA(null);
    setNewQA({ question: "", answer: "", tags: "" });
    toast.success("QA已更新");
  };

  const handleDeleteQA = (qaId: string) => {
    setQaList(qaList.filter(q => q.id !== qaId));
    toast.success("QA已删除");
  };

  const handleToggleQAStatus = (qaId: string) => {
    setQaList(qaList.map(q => 
      q.id === qaId ? { ...q, status: q.status === "active" ? "inactive" : "active" } : q
    ));
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents">文档集管理</TabsTrigger>
          <TabsTrigger value="qa">QA管理</TabsTrigger>
        </TabsList>

        {/* 文档集管理 */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>文档集管理</span>
                  </CardTitle>
                  <CardDescription>管理文档集和向量索引</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog open={isAddDocDialogOpen} onOpenChange={setIsAddDocDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <FolderPlus className="h-4 w-4 mr-2" />
                        创建文档集
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>创建新文档集</DialogTitle>
                        <DialogDescription>创建新的文档集用于存储和管理文档</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>名称</Label>
                          <Input placeholder="输入文档集名称" />
                        </div>
                        <div>
                          <Label>描述</Label>
                          <Textarea placeholder="描述文档集的用途..." />
                        </div>
                        <div>
                          <Label>类型</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="选择类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tech">技术文档</SelectItem>
                              <SelectItem value="business">业务文档</SelectItem>
                              <SelectItem value="legal">法律文档</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDocDialogOpen(false)}>取消</Button>
                        <Button onClick={() => { setIsAddDocDialogOpen(false); toast.success("文档集已创建"); }}>创建</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="搜索文档集..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    collection={doc}
                    isSelected={selectedDoc === doc.id}
                    onSelect={setSelectedDoc}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QA管理 */}
        <TabsContent value="qa" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>QA管理</span>
                  </CardTitle>
                  <CardDescription>管理问答对和知识库</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog open={isAddQADialogOpen} onOpenChange={setIsAddQADialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingQA(null); setNewQA({ question: "", answer: "", tags: "" }); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        添加QA
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingQA ? "编辑QA" : "添加新QA"}</DialogTitle>
                        <DialogDescription>{editingQA ? "修改问答对内容" : "创建新的问答对"}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>问题</Label>
                          <Textarea
                            value={newQA.question}
                            onChange={(e) => setNewQA({ ...newQA, question: e.target.value })}
                            placeholder="输入问题..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>答案</Label>
                          <Textarea
                            value={newQA.answer}
                            onChange={(e) => setNewQA({ ...newQA, answer: e.target.value })}
                            placeholder="输入答案..."
                            rows={5}
                          />
                        </div>
                        <div>
                          <Label>标签</Label>
                          <Input
                            value={newQA.tags}
                            onChange={(e) => setNewQA({ ...newQA, tags: e.target.value })}
                            placeholder="标签之间用逗号分隔"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsAddQADialogOpen(false); setEditingQA(null); }}>取消</Button>
                        <Button onClick={editingQA ? handleUpdateQA : handleAddQA}>
                          {editingQA ? "更新" : "添加"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索QA..."
                      value={qaSearchTerm}
                      onChange={(e) => setQaSearchTerm(e.target.value)}
                      className="pl-9 max-w-sm"
                    />
                  </div>
                  <Select value={qaStatusFilter} onValueChange={(v: any) => setQaStatusFilter(v)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="active">启用</SelectItem>
                      <SelectItem value="inactive">停用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">总计: {qaStats.total}</Badge>
                  <Badge variant="default" className="text-xs">启用: {qaStats.active}</Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredQA.map((qa) => (
                  <Card key={qa.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{qa.question}</h4>
                            <Badge variant={qa.status === "active" ? "default" : "secondary"} className="text-xs">
                              {qa.status === "active" ? "启用" : "停用"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{qa.answer}</p>
                          <div className="flex items-center space-x-2">
                            {qa.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">创建时间: {qa.createdAt}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleQAStatus(qa.id)}>
                            {qa.status === "active" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { handleEditQA(qa); setIsAddQADialogOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteQA(qa.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};