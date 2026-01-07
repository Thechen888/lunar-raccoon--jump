import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Trash2, Upload, RefreshCw, Search, Database, File, Edit, X } from "lucide-react";
import { toast } from "sonner";

interface OriginalDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  status: "processed" | "processing" | "error";
  tags: string[];
  collectionId: string;
}

interface QAIndex {
  id: string;
  question: string;
  answer: string;
  collectionId: string;
  createdAt: string;
  vectorId: string;
}

interface DocumentCollection {
  id: string;
  name: string;
  type: string;
  description: string;
  lastUpdated: string;
  status: "active" | "inactive";
  tags: string[];
  vectorIndexStatus: "ready" | "building" | "none";
  documentCount: number;
  qaCount: number;
}

export const DocumentManagement = () => {
  const [collections, setCollections] = useState<DocumentCollection[]>([
    {
      id: "tech-docs-cn",
      name: "技术文档-中文",
      type: "技术文档",
      description: "包含软件开发、系统设计等技术文档",
      lastUpdated: "2024-01-15",
      status: "active",
      tags: ["技术", "开发", "中文"],
      vectorIndexStatus: "ready",
      documentCount: 156,
      qaCount: 342
    },
    {
      id: "business-docs-cn",
      name: "业务文档-中文",
      type: "业务文档",
      description: "包含业务流程、产品规格等业务文档",
      lastUpdated: "2024-01-14",
      status: "active",
      tags: ["业务", "产品", "中文"],
      vectorIndexStatus: "ready",
      documentCount: 89,
      qaCount: 156
    },
    {
      id: "legal-docs-eu",
      name: "法律文档-欧洲",
      type: "法律文档",
      description: "GDPR合规、合同模板等法律文档",
      lastUpdated: "2024-01-10",
      status: "active",
      tags: ["法律", "合规", "欧洲"],
      vectorIndexStatus: "ready",
      documentCount: 234,
      qaCount: 512
    },
    {
      id: "knowledge-base",
      name: "知识库",
      type: "知识库",
      description: "公司内部知识库，包含各部门知识积累",
      lastUpdated: "2024-01-16",
      status: "active",
      tags: ["知识", "内部", "综合"],
      vectorIndexStatus: "ready",
      documentCount: 412,
      qaCount: 1089
    }
  ]);

  const [documents, setDocuments] = useState<OriginalDocument[]>([
    {
      id: "1",
      name: "React开发指南.pdf",
      type: "PDF",
      size: 2456000,
      uploadDate: "2024-01-15",
      status: "processed",
      tags: ["技术", "React"],
      collectionId: "tech-docs-cn"
    },
    {
      id: "2",
      name: "产品需求规格说明书.docx",
      type: "DOCX",
      size: 1024000,
      uploadDate: "2024-01-14",
      status: "processed",
      tags: ["业务", "产品"],
      collectionId: "business-docs-cn"
    },
    {
      id: "3",
      name: "GDPR合规指南.pdf",
      type: "PDF",
      size: 5120000,
      uploadDate: "2024-01-10",
      status: "processed",
      tags: ["法律", "合规"],
      collectionId: "legal-docs-eu"
    },
    {
      id: "4",
      name: "系统架构设计.pptx",
      type: "PPTX",
      size: 3145728,
      uploadDate: "2024-01-15",
      status: "processing",
      tags: ["技术", "架构"],
      collectionId: "tech-docs-cn"
    }
  ]);

  const [qaIndexes, setQaIndexes] = useState<QAIndex[]>([
    {
      id: "qa-1",
      question: "如何使用React Hooks？",
      answer: "React Hooks是React 16.8引入的新特性，让你可以在函数组件中使用状态和其他React特性...",
      collectionId: "tech-docs-cn",
      createdAt: "2024-01-15",
      vectorId: "vec-12345"
    },
    {
      id: "qa-2",
      question: "GDPR对数据处理有什么要求？",
      answer: "GDPR要求企业在处理欧盟公民的个人数据时必须遵循一系列原则，包括合法性、公平性、透明度等...",
      collectionId: "legal-docs-eu",
      createdAt: "2024-01-10",
      vectorId: "vec-67890"
    }
  ]);

  const [activeTab, setActiveTab] = useState("collections");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [isAddCollectionDialogOpen, setIsAddCollectionDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    collectionId: "",
    tags: [] as string[],
    description: ""
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingCollection, setEditingCollection] = useState<DocumentCollection | null>(null);
  const [editFormData, setEditFormData] = useState<{ name: string; type: string; description: string }>({
    name: "",
    type: "",
    description: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);

  const toggleExpand = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || doc.type.toLowerCase() === filterType.toLowerCase();
    const matchesCollection = !selectedCollection || doc.collectionId === selectedCollection;
    return matchesSearch && matchesType && matchesCollection;
  });

  const filteredQaIndexes = qaIndexes.filter(qa => {
    const matchesSearch = qa.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCollection = !selectedCollection || qa.collectionId === selectedCollection;
    return matchesSearch && matchesCollection;
  });

  const handleAddCollection = () => {
    const newCollection: DocumentCollection = {
      id: `coll-${Date.now()}`,
      name: "新文档集",
      type: "通用",
      description: "",
      lastUpdated: new Date().toISOString().split('T')[0],
      status: "active",
      tags: [],
      vectorIndexStatus: "none",
      documentCount: 0,
      qaCount: 0
    };
    setCollections([...collections, newCollection]);
    setIsAddCollectionDialogOpen(false);
    toast.success("文档集已创建");
  };

  const handleEditClick = (collection: DocumentCollection) => {
    setEditingCollection(collection);
    setEditFormData({
      name: collection.name,
      type: collection.type,
      description: collection.description
    });
  };

  const handleEditSave = () => {
    if (editingCollection) {
      setCollections(collections.map(c => 
        c.id === editingCollection.id 
          ? { 
              ...c, 
              name: editFormData.name, 
              type: editFormData.type, 
              description: editFormData.description,
              lastUpdated: new Date().toISOString().split('T')[0]
            } 
          : c
      ));
      setEditingCollection(null);
      toast.success("文档集已更新");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleUploadDocuments = () => {
    if (!uploadFormData.collectionId) {
      toast.error("请选择文档集");
      return;
    }
    
    if (selectedFiles.length === 0) {
      toast.error("请选择要上传的文档");
      return;
    }
    
    setProcessing(true);
    
    setTimeout(() => {
      const newDocuments = selectedFiles.map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || "UNKNOWN",
        size: file.size,
        uploadDate: new Date().toISOString().split('T')[0],
        status: "processed" as "processed" | "processing" | "error",
        tags: uploadFormData.tags,
        collectionId: uploadFormData.collectionId
      }));
      
      setDocuments([...documents, ...newDocuments]);
      setCollections(collections.map(c => 
        c.id === uploadFormData.collectionId 
          ? { ...c, documentCount: c.documentCount + newDocuments.length }
          : c
      ));
      
      setProcessing(false);
      setIsUploadDialogOpen(false);
      setUploadFormData({ collectionId: "", tags: [], description: "" });
      setSelectedFiles([]);
      toast.success(`成功上传 ${newDocuments.length} 个文档`);
    }, 2000);
  };

  const handleDeleteDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      setDocuments(documents.filter(d => d.id !== docId));
      setCollections(collections.map(c => 
        c.id === doc.collectionId 
          ? { ...c, documentCount: Math.max(0, c.documentCount - 1) }
          : c
      ));
      toast.success("文档已删除");
    }
  };

  const handleDeleteCollection = (collectionId: string) => {
    setCollections(collections.filter(c => c.id !== collectionId));
    setDocuments(documents.filter(d => d.collectionId !== collectionId));
    setQaIndexes(qaIndexes.filter(q => q.collectionId !== collectionId));
    toast.success("文档集已删除");
  };

  const handleReindex = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      toast.success("文档重新索引完成");
    }, 3000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="collections">文档集</TabsTrigger>
          <TabsTrigger value="documents">原文档</TabsTrigger>
          <TabsTrigger value="qa">QA向量索引</TabsTrigger>
        </TabsList>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>文档集管理</span>
                  </CardTitle>
                  <CardDescription>
                    管理文档集，每个文档集包含多个原文档和QA向量索引
                  </CardDescription>
                </div>
                <Dialog open={isAddCollectionDialogOpen} onOpenChange={setIsAddCollectionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      创建文档集
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>创建新文档集</DialogTitle>
                      <DialogDescription>
                        创建一个新的文档集来组织相关文档和QA
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>名称</Label>
                        <Input placeholder="输入文档集名称" />
                      </div>
                      <div>
                        <Label>类型</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="选择类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="技术文档">技术文档</SelectItem>
                            <SelectItem value="业务文档">业务文档</SelectItem>
                            <SelectItem value="法律文档">法律文档</SelectItem>
                            <SelectItem value="知识库">知识库</SelectItem>
                            <SelectItem value="通用">通用</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>描述</Label>
                        <Textarea placeholder="描述这个文档集的用途" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddCollectionDialogOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleAddCollection}>创建</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((collection) => (
                  <Card key={collection.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{collection.name}</CardTitle>
                          <CardDescription>{collection.description}</CardDescription>
                        </div>
                        <Badge variant={collection.status === "active" ? "default" : "secondary"}>
                          {collection.status === "active" ? "活跃" : "非活跃"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">类型:</span>
                          <Badge variant="outline">{collection.type}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center">
                            <File className="h-3 w-3 mr-1" />
                            原文档:
                          </span>
                          <span className="font-medium">{collection.documentCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center">
                            <Database className="h-3 w-3 mr-1" />
                            QA索引:
                          </span>
                          <span className="font-medium">{collection.qaCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">向量索引:</span>
                          <Badge 
                            variant={collection.vectorIndexStatus === "ready" ? "default" : collection.vectorIndexStatus === "building" ? "secondary" : "destructive"}
                            className="text-xs"
                          >
                            {collection.vectorIndexStatus === "ready" ? "就绪" : collection.vectorIndexStatus === "building" ? "构建中" : "未索引"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">最后更新:</span>
                          <span>{collection.lastUpdated}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {collection.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditClick(collection)}>
                            <Edit className="h-4 w-4 mr-1" />
                            编辑
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Original Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>原文档列表</CardTitle>
                  <CardDescription>
                    查看和管理所有上传的原文档
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={handleReindex} disabled={processing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${processing ? "animate-spin" : ""}`} />
                    重新索引
                  </Button>
                  <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        上传文档
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>上传文档</DialogTitle>
                        <DialogDescription>
                          支持批量上传多个文档
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>选择文档集</Label>
                          <Select
                            value={uploadFormData.collectionId}
                            onValueChange={(value) => setUploadFormData({ ...uploadFormData, collectionId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="选择文档集" />
                            </SelectTrigger>
                            <SelectContent>
                              {collections.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>标签（用逗号分隔）</Label>
                          <Input
                            placeholder="例如：技术, React, 前端"
                            value={uploadFormData.tags.join(", ")}
                            onChange={(e) => setUploadFormData({ ...uploadFormData, tags: e.target.value.split(",").map(t => t.trim()).filter(t => t) })}
                          />
                        </div>
                        <div>
                          <Label>描述</Label>
                          <Textarea
                            placeholder="文档描述..."
                            value={uploadFormData.description}
                            onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>文件</Label>
                          <div className="mt-2">
                            <Input 
                              type="file" 
                              multiple
                              className="cursor-pointer"
                              onChange={handleFileSelect}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              支持的格式：PDF, DOCX, PPTX, TXT（可多选）
                            </p>
                          </div>
                        </div>

                        {/* 已选择的文件列表 */}
                        {selectedFiles.length > 0 && (
                          <div className="border rounded-md p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">已选择 {selectedFiles.length} 个文件</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFiles([])}
                                className="h-6 px-2 text-xs"
                              >
                                清空
                              </Button>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {selectedFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                                >
                                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <File className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                    <span className="truncate">{file.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className="text-xs text-muted-foreground">
                                      {formatFileSize(file.size)}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveFile(index)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs text-muted-foreground">
                                总大小: {formatFileSize(selectedFiles.reduce((acc, file) => acc + file.size, 0))}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setIsUploadDialogOpen(false);
                          setSelectedFiles([]);
                          setUploadFormData({ collectionId: "", tags: [], description: "" });
                        }}>
                          取消
                        </Button>
                        <Button onClick={handleUploadDocuments} disabled={processing || selectedFiles.length === 0}>
                          {processing ? "上传中..." : `上传 ${selectedFiles.length} 个文档`}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索文档..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedCollection || "all"} onValueChange={(v) => setSelectedCollection(v === "all" ? null : v)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="文档集" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部文档集</SelectItem>
                    {collections.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="文件类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="docx">DOCX</SelectItem>
                    <SelectItem value="pptx">PPTX</SelectItem>
                    <SelectItem value="txt">TXT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>文档名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>大小</TableHead>
                    <TableHead>文档集</TableHead>
                    <TableHead>上传日期</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="font-medium">{doc.name}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {doc.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {formatFileSize(doc.size)}
                      </TableCell>
                      <TableCell>
                        {collections.find(c => c.id === doc.collectionId)?.name || "未分类"}
                      </TableCell>
                      <TableCell>{doc.uploadDate}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={doc.status === "processed" ? "default" : doc.status === "processing" ? "secondary" : "destructive"}
                        >
                          {doc.status === "processed" ? "已处理" : doc.status === "processing" ? "处理中" : "错误"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QA Vector Index Tab */}
        <TabsContent value="qa" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>QA向量索引</span>
                  </CardTitle>
                  <CardDescription>
                    管理从文档提取的QA对及其向量索引（后续接入向量数据库）
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索QA..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedCollection || "all"} onValueChange={(v) => setSelectedCollection(v === "all" ? null : v)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="文档集" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部文档集</SelectItem>
                    {collections.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>问题</TableHead>
                    <TableHead>答案</TableHead>
                    <TableHead>文档集</TableHead>
                    <TableHead>向量ID</TableHead>
                    <TableHead>创建时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQaIndexes.map((qa) => (
                    <TableRow key={qa.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {qa.question}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {qa.answer}
                      </TableCell>
                      <TableCell>
                        {collections.find(c => c.id === qa.collectionId)?.name || "未分类"}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {qa.vectorId}
                        </code>
                      </TableCell>
                      <TableCell>{qa.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Collection Dialog */}
      <Dialog open={editingCollection !== null} onOpenChange={() => setEditingCollection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑文档集</DialogTitle>
            <DialogDescription>
              编辑文档集的名称、类型和描述
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>名称</Label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="输入文档集名称"
              />
            </div>
            <div>
              <Label>类型</Label>
              <Select
                value={editFormData.type}
                onValueChange={(value) => setEditFormData({ ...editFormData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="技术文档">技术文档</SelectItem>
                  <SelectItem value="业务文档">业务文档</SelectItem>
                  <SelectItem value="法律文档">法律文档</SelectItem>
                  <SelectItem value="知识库">知识库</SelectItem>
                  <SelectItem value="通用">通用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>描述</Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="描述这个文档集的用途"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCollection(null)}>
              取消
            </Button>
            <Button onClick={handleEditSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};