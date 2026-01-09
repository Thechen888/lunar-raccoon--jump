import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Plus, Trash2, Upload, RefreshCw, Search, File, Edit, X, ChevronDown, ChevronRight, MessageSquare, Download, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QAItem {
  id: string;
  question: string;
  answer: string;
  status: "active" | "draft" | "archived";
  documentId: string;
  documentName: string;
  createdAt: string;
  tags: string[];
}

interface OriginalDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  status: "processed" | "processing" | "error";
  tags: string[];
  collectionId: string;
  conversionStatus: "none" | "processing" | "completed"; // markdown转换状态
  markdownContent?: string; // 转换后的markdown内容
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
}

export const DocumentManagement = () => {
  const [activeTab, setActiveTab] = useState("collections");
  const [isAddCollectionDialogOpen, setIsAddCollectionDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<DocumentCollection | null>(null);
  const [editFormData, setEditFormData] = useState<{ name: string; type: string; description: string }>({
    name: "",
    type: "",
    description: ""
  });

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
      documentCount: 156
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
      documentCount: 89
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
      documentCount: 234
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
      documentCount: 412
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
      collectionId: "tech-docs-cn",
      conversionStatus: "completed",
      markdownContent: `# React开发指南

## 简介
React 是一个用于构建用户界面的 JavaScript 库。

## 主要特性

### 1. 组件化
React 将 UI 拆分为独立、可复用的组件。

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

### 2. 声明式
React 使创建交互式 UI 变得轻而易举。

### 3. 虚拟DOM
React 使用虚拟DOM来提高性能。

## Hooks
Hooks 是 React 16.8 新增的特性。

### useState
用于在函数组件中添加状态。

\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

### useEffect
用于处理副作用操作。

\`\`\`jsx
useEffect(() => {
  document.title = \`You clicked \${count} times\`;
}, [count]);
\`\`\`

## 总结
React 提供了一种声明式的、高效的方式来构建用户界面。`
    },
    {
      id: "2",
      name: "产品需求规格说明书.docx",
      type: "DOCX",
      size: 1024000,
      uploadDate: "2024-01-14",
      status: "processed",
      tags: ["业务", "产品"],
      collectionId: "business-docs-cn",
      conversionStatus: "completed",
      markdownContent: `# 产品需求规格说明书

## 1. 概述
本文档描述了产品的主要需求和规格。

## 2. 功能需求

### 2.1 用户管理
- 用户注册
- 用户登录
- 密码重置

### 2.2 产品管理
- 产品列表
- 产品详情
- 产品搜索

## 3. 非功能需求

### 3.1 性能
- 响应时间 < 2秒
- 支持 1000 并发用户

### 3.2 安全性
- 数据加密
- 访问控制
- 审计日志`
    },
    {
      id: "3",
      name: "GDPR合规指南.pdf",
      type: "PDF",
      size: 5120000,
      uploadDate: "2024-01-10",
      status: "processed",
      tags: ["法律", "合规"],
      collectionId: "legal-docs-eu",
      conversionStatus: "processing"
    },
    {
      id: "4",
      name: "系统架构设计.pptx",
      type: "PPTX",
      size: 3145728,
      uploadDate: "2024-01-15",
      status: "processing",
      tags: ["技术", "架构"],
      collectionId: "tech-docs-cn",
      conversionStatus: "none"
    }
  ]);

  // QA数据
  const [qaItems, setQaItems] = useState<QAItem[]>([
    {
      id: "qa-1",
      question: "什么是React Hooks？",
      answer: "React Hooks 是 React 16.8 新增的特性，它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。",
      status: "active",
      documentId: "1",
      documentName: "React开发指南.pdf",
      createdAt: "2024-01-15",
      tags: ["React", "Hooks"]
    },
    {
      id: "qa-2",
      question: "useEffect 的作用是什么？",
      answer: "useEffect Hook 用于处理副作用操作，如数据获取、订阅、手动修改 DOM 等。",
      status: "active",
      documentId: "1",
      documentName: "React开发指南.pdf",
      createdAt: "2024-01-15",
      tags: ["React", "Hooks", "useEffect"]
    },
    {
      id: "qa-3",
      question: "GDPR的主要要求是什么？",
      answer: "GDPR主要要求包括：数据主体的知情同意权、数据可携带权、被遗忘权等。",
      status: "active",
      documentId: "3",
      documentName: "GDPR合规指南.pdf",
      createdAt: "2024-01-10",
      tags: ["GDPR", "合规"]
    },
    {
      id: "qa-4",
      question: "产品需求文档应该包含哪些内容？",
      answer: "产品需求文档应包含产品概述、功能需求、非功能需求、用户场景、验收标准等。",
      status: "draft",
      documentId: "2",
      documentName: "产品需求规格说明书.docx",
      createdAt: "2024-01-14",
      tags: ["产品", "需求"]
    },
    {
      id: "qa-5",
      question: "React组件的生命周期有哪些？",
      answer: "React组件生命周期包括：挂载阶段（constructor、componentDidMount）、更新阶段（componentDidUpdate）、卸载阶段（componentWillUnmount）。",
      status: "active",
      documentId: "1",
      documentName: "React开发指南.pdf",
      createdAt: "2024-01-15",
      tags: ["React", "生命周期"]
    },
    {
      id: "qa-6",
      question: "数据处理的安全要求？",
      answer: "数据处理需要遵循最小化原则、加密存储、访问控制等安全要求。",
      status: "archived",
      documentId: "3",
      documentName: "GDPR合规指南.pdf",
      createdAt: "2024-01-10",
      tags: ["安全", "数据处理"]
    }
  ]);

  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    collectionId: "",
    tags: [] as string[],
    description: ""
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [processing, setProcessing] = useState(false);

  // 查看Markdown对话框
  const [viewMarkdownDoc, setViewMarkdownDoc] = useState<OriginalDocument | null>(null);

  // QA管理状态
  const [qaSearchTerm, setQaSearchTerm] = useState("");
  const [qaStatusFilter, setQaStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all");
  const [qaDocumentFilter, setQaDocumentFilter] = useState<string>("all");
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set());
  const [qaViewMode, setQaViewMode] = useState<"grouped" | "list">("grouped");
  const [isEditQaDialogOpen, setIsEditQaDialogOpen] = useState(false);
  const [editingQa, setEditingQa] = useState<QAItem | null>(null);
  const [qaFormData, setQaFormData] = useState<{ question: string; answer: string; status: "active" | "draft" | "archived" }>({
    question: "",
    answer: "",
    status: "active"
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || doc.type.toLowerCase() === filterType.toLowerCase();
    const matchesCollection = !selectedCollection || doc.collectionId === selectedCollection;
    return matchesSearch && matchesType && matchesCollection;
  });

  // 筛选QA
  const filteredQaItems = qaItems.filter(qa => {
    const matchesSearch = qa.question.toLowerCase().includes(qaSearchTerm.toLowerCase()) || 
                         qa.answer.toLowerCase().includes(qaSearchTerm.toLowerCase());
    const matchesStatus = qaStatusFilter === "all" || qa.status === qaStatusFilter;
    const matchesDocument = qaDocumentFilter === "all" || qa.documentId === qaDocumentFilter;
    return matchesSearch && matchesStatus && matchesDocument;
  });

  // 按文档分组QA
  const qaByDocument = documents.reduce((acc, doc) => {
    const docQaItems = filteredQaItems.filter(qa => qa.documentId === doc.id);
    if (docQaItems.length > 0) {
      acc[doc.id] = {
        document: doc,
        qaItems: docQaItems
      };
    }
    return acc;
  }, {} as Record<string, { document: OriginalDocument; qaItems: QAItem[] }>);

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
      documentCount: 0
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
        collectionId: uploadFormData.collectionId,
        conversionStatus: "none" as "none" | "processing" | "completed"
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
    toast.success("文档集已删除");
  };

  const handleReindex = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      toast.success("文档重新索引完成");
    }, 3000);
  };

  const handleDownloadDocument = (doc: OriginalDocument) => {
    // 模拟下载文件
    toast.success(`正在下载: ${doc.name}`);
  };

  const handleViewMarkdown = (doc: OriginalDocument) => {
    if (doc.conversionStatus !== "completed") {
      toast.error("文档尚未转换为Markdown");
      return;
    }
    setViewMarkdownDoc(doc);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getConversionStatusBadge = (status: "none" | "processing" | "completed") => {
    const variants = {
      none: "outline",
      processing: "secondary",
      completed: "default"
    } as const;
    const labels = {
      none: "未转换",
      processing: "转换中",
      completed: "已转换"
    };
    return (
      <Badge variant={variants[status]} className="text-xs">
        {labels[status]}
      </Badge>
    );
  };

  // QA编辑功能
  const handleEditQa = (qa: QAItem) => {
    setEditingQa(qa);
    setQaFormData({
      question: qa.question,
      answer: qa.answer,
      status: qa.status
    });
    setIsEditQaDialogOpen(true);
  };

  const handleSaveQa = () => {
    if (editingQa) {
      setQaItems(qaItems.map(qa => 
        qa.id === editingQa.id 
          ? { ...qa, question: qaFormData.question, answer: qaFormData.answer, status: qaFormData.status }
          : qa
      ));
      setIsEditQaDialogOpen(false);
      setEditingQa(null);
      toast.success("QA已更新");
    }
  };

  const handleDeleteQa = (qaId: string) => {
    setQaItems(qaItems.filter(qa => qa.id !== qaId));
    toast.success("QA已删除");
  };

  const toggleDocumentExpand = (docId: string) => {
    const newExpanded = new Set(expandedDocuments);
    if (newExpanded.has(docId)) {
      newExpanded.delete(docId);
    } else {
      newExpanded.add(docId);
    }
    setExpandedDocuments(newExpanded);
  };

  // QA统计
  const qaStats = {
    total: qaItems.length,
    active: qaItems.filter(qa => qa.status === "active").length,
    draft: qaItems.filter(qa => qa.status === "draft").length,
    archived: qaItems.filter(qa => qa.status === "archived").length
  };

  const getStatusBadge = (status: "active" | "draft" | "archived") => {
    const variants = {
      active: "default",
      draft: "secondary",
      archived: "outline"
    } as const;
    const labels = {
      active: "启用",
      draft: "草稿",
      archived: "归档"
    };
    return (
      <Badge variant={variants[status]} className="text-xs">
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="collections">文档集</TabsTrigger>
          <TabsTrigger value="documents">原文档</TabsTrigger>
          <TabsTrigger value="qa">QA管理</TabsTrigger>
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
                    管理文档集，每个文档集包含多个原文档
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
                        创建一个新的文档集来组织相关文档
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
              <div className="space-y-2">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <File className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{doc.name}</span>
                            <Badge variant={doc.status === "processed" ? "default" : doc.status === "error" ? "destructive" : "secondary"} className="text-xs">
                              {doc.status === "processed" ? "已处理" : doc.status === "error" ? "错误" : "处理中"}
                            </Badge>
                            {getConversionStatusBadge(doc.conversionStatus)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                            <span>类型: {doc.type}</span>
                            <span>大小: {formatFileSize(doc.size)}</span>
                            <span>文档集: {collections.find(c => c.id === doc.collectionId)?.name}</span>
                            <span>上传: {doc.uploadDate}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {doc.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadDocument(doc)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewMarkdown(doc)}
                            disabled={doc.conversionStatus !== "completed"}
                            title={doc.conversionStatus === "completed" ? "查看Markdown" : "文档尚未转换为Markdown"}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id)}
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

        {/* QA Management Tab */}
        <TabsContent value="qa" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>QA管理</span>
                  </CardTitle>
                  <CardDescription>
                    管理由原文档自动生成的问答对
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">总计: {qaStats.total}</Badge>
                  <Badge variant="default" className="text-xs">启用: {qaStats.active}</Badge>
                  <Badge variant="secondary" className="text-xs">草稿: {qaStats.draft}</Badge>
                  <Badge variant="outline" className="text-xs">归档: {qaStats.archived}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 筛选和搜索 */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索问答..."
                    value={qaSearchTerm}
                    onChange={(e) => setQaSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={qaStatusFilter} onValueChange={(v: any) => setQaStatusFilter(v)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="active">启用</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="archived">归档</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={qaDocumentFilter} onValueChange={setQaDocumentFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="文档" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部文档</SelectItem>
                    {documents.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center border rounded-md p-1">
                  <Button
                    variant={qaViewMode === "grouped" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setQaViewMode("grouped")}
                    className="h-7 px-3 text-xs"
                  >
                    按文档分组
                  </Button>
                  <Button
                    variant={qaViewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setQaViewMode("list")}
                    className="h-7 px-3 text-xs"
                  >
                    列表视图
                  </Button>
                </div>
              </div>

              {filteredQaItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无QA数据
                </div>
              ) : qaViewMode === "grouped" ? (
                /* 按文档分组视图 */
                <div className="space-y-4">
                  {Object.entries(qaByDocument).map(([docId, { document, qaItems: docQaItems }]) => (
                    <Card key={docId}>
                      <CardHeader 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleDocumentExpand(docId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {expandedDocuments.has(docId) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{document.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {docQaItems.length} 个QA
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{document.type}</span>
                            <span>•</span>
                            <span>{formatFileSize(document.size)}</span>
                          </div>
                        </div>
                      </CardHeader>
                      {expandedDocuments.has(docId) && (
                        <CardContent className="space-y-2">
                          {docQaItems.map((qa) => (
                            <Card key={qa.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Badge variant="secondary" className="text-xs">问</Badge>
                                      <span className="font-medium">{qa.question}</span>
                                      {getStatusBadge(qa.status)}
                                    </div>
                                    <div className="flex items-start space-x-2">
                                      <Badge variant="outline" className="text-xs">答</Badge>
                                      <p className="text-sm text-muted-foreground">{qa.answer}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditQa(qa)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteQa(qa.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {qa.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                /* 列表视图 */
                <div className="space-y-2">
                  {filteredQaItems.map((qa) => (
                    <Card key={qa.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="secondary" className="text-xs">问</Badge>
                              <span className="font-medium">{qa.question}</span>
                              {getStatusBadge(qa.status)}
                              <Badge variant="outline" className="text-xs">
                                {qa.documentName}
                              </Badge>
                            </div>
                            <div className="flex items-start space-x-2 mb-2">
                              <Badge variant="outline" className="text-xs">答</Badge>
                              <p className="text-sm text-muted-foreground">{qa.answer}</p>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {qa.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQa(qa)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQa(qa.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 查看Markdown对话框 */}
      <Dialog open={viewMarkdownDoc !== null} onOpenChange={(open) => !open && setViewMarkdownDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <span>{viewMarkdownDoc?.name} - Markdown预览</span>
              {getConversionStatusBadge(viewMarkdownDoc?.conversionStatus || "none")}
            </DialogTitle>
            <DialogDescription>
              查看文档转换后的Markdown内容
            </DialogDescription>
          </DialogHeader>
          {viewMarkdownDoc?.markdownContent ? (
            <ScrollArea className="flex-1 pr-4">
              <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-md">
                {viewMarkdownDoc.markdownContent}
              </pre>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {viewMarkdownDoc?.conversionStatus === "processing" ? "文档正在转换为Markdown..." : "文档尚未转换为Markdown"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="flex-shrink-0 pt-4">
            <Button variant="outline" onClick={() => setViewMarkdownDoc(null)}>
              关闭
            </Button>
            <Button onClick={() => {
              if (viewMarkdownDoc?.markdownContent) {
                toast.success("Markdown已复制到剪贴板");
              }
            }}>
              复制Markdown
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑QA对话框 */}
      <Dialog open={isEditQaDialogOpen} onOpenChange={setIsEditQaDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑QA</DialogTitle>
            <DialogDescription>
              编辑问答对的内容和状态
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>问题</Label>
              <Input
                value={qaFormData.question}
                onChange={(e) => setQaFormData({ ...qaFormData, question: e.target.value })}
                placeholder="输入问题"
              />
            </div>
            <div>
              <Label>答案</Label>
              <Textarea
                value={qaFormData.answer}
                onChange={(e) => setQaFormData({ ...qaFormData, answer: e.target.value })}
                placeholder="输入答案"
                rows={4}
              />
            </div>
            <div>
              <Label>状态</Label>
              <Select
                value={qaFormData.status}
                onValueChange={(value: any) => setQaFormData({ ...qaFormData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">启用</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="archived">归档</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditQaDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveQa}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Collection Dialog */}
      <Dialog open={editingCollection !== null} onOpenChange={() => setEditingCollection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑文档集</DialogTitle>
            <CardDescription>
              编辑文档集的名称、类型和描述
            </CardDescription>
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