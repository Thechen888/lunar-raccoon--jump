import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText, Search, Filter, Trash2, Edit, ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Document {
  id: string;
  name: string;
  type: "markdown" | "qa";
  description: string;
  fileSize: number;
  uploadDate: string;
  status: "processed" | "processing" | "error";
  tags: string[];
  collectionId: string;
  qaCount?: number;
}

interface QAItem {
  id: string;
  documentId: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "draft" | "archived";
  tags?: string[];
  embeddingId?: string;
}

interface QAManagementProps {
  documents: Document[];
  onQAUpdate: (documentId: string, newQAList: QAItem[]) => void;
}

export const QAManagement = ({ documents, onQAUpdate }: QAManagementProps) => {
  const [viewMode, setViewMode] = useState<"grouped" | "list">("grouped");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all");
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set());
  const [editingQA, setEditingQA] = useState<QAItem | null>(null);
  const [editFormData, setEditFormData] = useState({ question: "", answer: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingQA, setDeletingQA] = useState<QAItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 模拟所有文档的 QA 数据
  const allQAData = useMemo(() => {
    const qaMap: Record<string, QAItem[]> = {};
    
    documents.forEach(doc => {
      if (doc.qaCount && doc.qaCount > 0) {
        // 生成模拟 QA 数据
        qaMap[doc.id] = Array.from({ length: Math.min(doc.qaCount, 10) }, (_, i) => ({
          id: `qa-${doc.id}-${i}`,
          documentId: doc.id,
          question: `${doc.name.replace('.md', '').replace('.qa', '')} 相关问题 ${i + 1}`,
          answer: `这是关于 ${doc.name} 的回答 ${i + 1}。\n\n基于文档内容，${doc.description} 相关的详细解答如下：\n\n1. 首先，需要理解基本概念\n2. 其次，掌握核心要点\n3. 最后，实践应用场景\n\n如有更多问题，请参考原文档。`,
          createdAt: doc.uploadDate,
          updatedAt: doc.uploadDate,
          status: i % 5 === 0 ? "draft" : "active",
          tags: doc.tags.slice(0, 2),
          embeddingId: `emb-${doc.id}-${i}`
        }));
      }
    });
    
    return qaMap;
  }, [documents]);

  // 获取筛选后的 QA 列表
  const getFilteredQA = (documentId: string): QAItem[] => {
    const qaList = allQAData[documentId] || [];
    
    return qaList.filter(qa => {
      const matchesSearch = qa.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           qa.answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || qa.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  // 获取所有 QA（平铺模式）
  const allFlattenedQA = useMemo(() => {
    let result: Array<QAItem & { documentName: string; collectionName: string }> = [];
    
    documents.forEach(doc => {
      const qaList = getFilteredQA(doc.id);
      qaList.forEach(qa => {
        result.push({
          ...qa,
          documentName: doc.name,
          collectionName: "" // 可从 collections 获取
        });
      });
    });
    
    return result;
  }, [documents, searchTerm, statusFilter, allQAData]);

  // 切换文档展开状态
  const toggleDocumentExpand = (documentId: string) => {
    const newExpanded = new Set(expandedDocuments);
    if (newExpanded.has(documentId)) {
      newExpanded.delete(documentId);
    } else {
      newExpanded.add(documentId);
    }
    setExpandedDocuments(newExpanded);
  };

  // 编辑 QA
  const handleEditQA = (qa: QAItem) => {
    setEditingQA(qa);
    setEditFormData({
      question: qa.question,
      answer: qa.answer
    });
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editingQA) return;
    
    // 更新 QA 数据
    const newQAList = allQAData[editingQA.documentId].map(qa =>
      qa.id === editingQA.id
        ? { ...qa, question: editFormData.question, answer: editFormData.answer, updatedAt: new Date().toISOString().split('T')[0] }
        : qa
    );
    
    onQAUpdate(editingQA.documentId, newQAList);
    setEditingQA(null);
    toast.success("QA 已更新");
  };

  // 删除 QA
  const handleDeleteQA = (qa: QAItem) => {
    setDeletingQA(qa);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteQA = () => {
    if (!deletingQA) return;
    
    const newQAList = allQAData[deletingQA.documentId].filter(qa => qa.id !== deletingQA.id);
    onQAUpdate(deletingQA.documentId, newQAList);
    setDeleteDialogOpen(false);
    setDeletingQA(null);
    toast.success("QA 已删除");
  };

  // 复制 QA
  const handleCopyQA = (qa: QAItem) => {
    const text = `问题：${qa.question}\n\n答案：${qa.answer}`;
    navigator.clipboard.writeText(text);
    setCopiedId(qa.id);
    toast.success("已复制到剪贴板");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 获取文档统计
  const getDocumentStats = (documentId: string) => {
    const qaList = allQAData[documentId] || [];
    const activeCount = qaList.filter(q => q.status === "active").length;
    const draftCount = qaList.filter(q => q.status === "draft").length;
    const archivedCount = qaList.filter(q => q.status === "archived").length;
    
    return { total: qaList.length, active: activeCount, draft: draftCount, archived: archivedCount };
  };

  // 获取全局统计
  const globalStats = useMemo(() => {
    let total = 0, active = 0, draft = 0, archived = 0;
    Object.values(allQAData).forEach(qaList => {
      qaList.forEach(qa => {
        total++;
        if (qa.status === "active") active++;
        else if (qa.status === "draft") draft++;
        else if (qa.status === "archived") archived++;
      });
    });
    return { total, active, draft, archived };
  }, [allQAData]);

  // 筛选后的文档列表
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const hasQA = doc.qaCount && doc.qaCount > 0;
      if (!hasQA) return false;
      
      const qaList = getFilteredQA(doc.id);
      return qaList.length > 0;
    });
  }, [documents, searchTerm, statusFilter, allQAData]);

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总 QA 数</p>
                <p className="text-2xl font-bold">{globalStats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">活跃</p>
                <p className="text-2xl font-bold text-green-600">{globalStats.active}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">草稿</p>
                <p className="text-2xl font-bold text-yellow-600">{globalStats.draft}</p>
              </div>
              <Edit className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已归档</p>
                <p className="text-2xl font-bold text-gray-600">{globalStats.archived}</p>
              </div>
              <Trash2 className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>QA 管理</span>
              </CardTitle>
              <CardDescription>
                按原文档分组管理所有问答对，支持搜索、筛选、编辑、删除
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="视图模式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grouped">分组视图</SelectItem>
                  <SelectItem value="list">列表视图</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 筛选栏 */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索问答内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">活跃</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="archived">已归档</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select 
              value={selectedDocumentId} 
              onValueChange={(value) => {
                setSelectedDocumentId(value);
                if (value !== "all") {
                  setExpandedDocuments(new Set([value]));
                }
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="筛选文档" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部文档</SelectItem>
                {documents.filter(d => d.qaCount && d.qaCount > 0).map(doc => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name} ({doc.qaCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 分组视图 */}
          {viewMode === "grouped" && (
            <div className="space-y-4">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无 QA 数据
                </div>
              ) : (
                filteredDocuments.map(doc => {
                  const qaList = getFilteredQA(doc.id);
                  const stats = getDocumentStats(doc.id);
                  const isExpanded = expandedDocuments.has(doc.id);
                  const isFiltered = selectedDocumentId !== "all" && selectedDocumentId !== doc.id;
                  
                  if (isFiltered) return null;
                  
                  return (
                    <Card key={doc.id} className={isExpanded ? "border-primary" : ""}>
                      <CardHeader 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleDocumentExpand(doc.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <FileText className="h-4 w-4 text-primary" />
                            <div className="flex-1">
                              <CardTitle className="text-base">{doc.name}</CardTitle>
                              <CardDescription className="text-xs mt-1">
                                {doc.description}
                              </CardDescription>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3 text-sm">
                              <div className="flex items-center space-x-1">
                                <Badge variant="default" className="text-xs">活跃: {stats.active}</Badge>
                              </div>
                              {stats.draft > 0 && (
                                <Badge variant="secondary" className="text-xs">草稿: {stats.draft}</Badge>
                              )}
                              {stats.archived > 0 && (
                                <Badge variant="outline" className="text-xs">归档: {stats.archived}</Badge>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              共 {stats.total} 个
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {isExpanded && (
                        <CardContent className="pt-0">
                          <ScrollArea className="max-h-[600px]">
                            <div className="space-y-3 pr-4">
                              {qaList.map((qa) => (
                                <Card key={qa.id} className="hover:shadow-md transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center space-x-2 flex-1">
                                        <MessageSquare className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                          <p className="font-medium">{qa.question}</p>
                                          <div className="flex items-center space-x-2 mt-2">
                                            <Badge 
                                              variant={qa.status === "active" ? "default" : qa.status === "draft" ? "secondary" : "outline"}
                                              className="text-xs"
                                            >
                                              {qa.status === "active" ? "活跃" : qa.status === "draft" ? "草稿" : "归档"}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                              {qa.createdAt}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleCopyQA(qa)}
                                          title="复制"
                                        >
                                          {copiedId === qa.id ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                          ) : (
                                            <Copy className="h-4 w-4" />
                                          )}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEditQA(qa)}
                                          title="编辑"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteQA(qa)}
                                          title="删除"
                                        >
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div className="pl-6 mt-3 pt-3 border-t">
                                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {qa.answer}
                                      </p>
                                    </div>
                                    
                                    {qa.tags && qa.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-3 pl-6">
                                        {qa.tags.map(tag => (
                                          <Badge key={tag} variant="outline" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* 列表视图 */}
          {viewMode === "list" && (
            <ScrollArea className="max-h-[700px]">
              <div className="space-y-3 pr-4">
                {allFlattenedQA.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    暂无 QA 数据
                  </div>
                ) : (
                  allFlattenedQA.map((qa) => (
                    <Card key={qa.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-muted-foreground">{qa.documentName}</span>
                              <Badge 
                                variant={qa.status === "active" ? "default" : qa.status === "draft" ? "secondary" : "outline"}
                                className="text-xs"
                              >
                                {qa.status === "active" ? "活跃" : qa.status === "draft" ? "草稿" : "归档"}
                              </Badge>
                            </div>
                            <p className="font-medium">{qa.question}</p>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyQA(qa)}
                            >
                              {copiedId === qa.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQA(qa)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQA(qa)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {qa.answer}
                          </p>
                        </div>
                        
                        {qa.tags && qa.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {qa.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      {editingQA && (
        <Dialog open={true} onOpenChange={() => setEditingQA(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>编辑 QA</DialogTitle>
              <DialogDescription>
                编辑问题和答案内容
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 space-y-4 overflow-y-auto py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">问题</label>
                <textarea
                  value={editFormData.question}
                  onChange={(e) => setEditFormData({ ...editFormData, question: e.target.value })}
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md resize-none"
                  placeholder="输入问题..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">答案</label>
                <textarea
                  value={editFormData.answer}
                  onChange={(e) => setEditFormData({ ...editFormData, answer: e.target.value })}
                  className="w-full min-h-[200px] px-3 py-2 border rounded-md resize-none"
                  placeholder="输入答案..."
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingQA(null)}>
                取消
              </Button>
              <Button onClick={handleSaveEdit}>
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这个 QA 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDeleteQA}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};