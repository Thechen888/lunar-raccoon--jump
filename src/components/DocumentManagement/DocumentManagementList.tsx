import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Grid, List, Search, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DocumentCollection } from "./index";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

interface DocumentManagementListProps {
  documents: Document[];
  collections: DocumentCollection[];
  setDocuments: (docs: Document[]) => void;
}

export const DocumentManagementList = ({ documents, collections, setDocuments }: DocumentManagementListProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "markdown" | "qa">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [uploadFormData, setUploadFormData] = useState({
    collectionId: "",
    documentType: "markdown" as "markdown" | "qa",
    tags: [] as string[],
    description: ""
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || doc.type === filterType;
    const matchesCollection = !selectedCollection || doc.collectionId === selectedCollection;
    return matchesSearch && matchesType && matchesCollection;
  });

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
        type: uploadFormData.documentType,
        description: uploadFormData.description,
        fileSize: file.size,
        uploadDate: new Date().toISOString().split('T')[0],
        status: "processed" as "processed" | "processing" | "error",
        tags: uploadFormData.tags,
        collectionId: uploadFormData.collectionId,
        qaCount: uploadFormData.documentType === "qa" ? Math.floor(Math.random() * 50) : undefined
      }));
      
      setDocuments([...documents, ...newDocuments]);
      setProcessing(false);
      setIsUploadDialogOpen(false);
      setUploadFormData({ collectionId: "", documentType: "markdown", tags: [], description: "" });
      setSelectedFiles([]);
      toast.success(`成功上传 ${newDocuments.length} 个文档`);
    }, 2000);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(documents.filter(d => d.id !== docId));
    toast.success("文档已删除");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索文档..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <select
              value={selectedCollection || "all"}
              onChange={(e) => setSelectedCollection(e.target.value === "all" ? null : e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="all">全部文档集</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "all" | "markdown" | "qa")}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="all">全部类型</option>
              <option value="markdown">Markdown 文档</option>
              <option value="qa">QA 文档</option>
            </select>

            <div className="flex items-center border rounded-md p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-7 w-7 p-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-7 w-7 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              上传
            </Button>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm || selectedCollection || filterType !== "all" ? "暂无匹配的文档" : "暂无文档"}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">
                            {doc.type === "markdown" ? "📄" : "❓"}
                          </span>
                          <span className="font-medium">{doc.name}</span>
                        </div>
                        <Badge variant={doc.type === "markdown" ? "default" : "secondary"} className="text-xs">
                          {doc.type === "markdown" ? "Markdown" : "QA"}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>文档集: {collections.find(c => c.id === doc.collectionId)?.name}</div>
                      <div>上传: {doc.uploadDate}</div>
                      <div>大小: {formatFileSize(doc.fileSize)}</div>
                      {doc.qaCount && <div>QA 数量: {doc.qaCount}</div>}
                    </div>
                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {doc.tags.map((tag) => (
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
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">
                            {doc.type === "markdown" ? "📄" : "❓"}
                          </span>
                          <span className="font-medium">{doc.name}</span>
                          <Badge variant={doc.type === "markdown" ? "default" : "secondary"} className="text-xs">
                            {doc.type === "markdown" ? "Markdown" : "QA"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>文档集: {collections.find(c => c.id === doc.collectionId)?.name}</span>
                          <span>上传: {doc.uploadDate}</span>
                          <span>大小: {formatFileSize(doc.fileSize)}</span>
                          {doc.qaCount && <span>QA: {doc.qaCount}</span>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 上传对话框 */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
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
              <Label>文档类型</Label>
              <Select
                value={uploadFormData.documentType}
                onValueChange={(value: any) => setUploadFormData({ ...uploadFormData, documentType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markdown">Markdown 文档</SelectItem>
                  <SelectItem value="qa">QA 文档</SelectItem>
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
                  支持的格式：.md, .qa, .txt（可多选）
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
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsUploadDialogOpen(false);
              setSelectedFiles([]);
              setUploadFormData({ collectionId: "", documentType: "markdown", tags: [], description: "" });
            }}>
              取消
            </Button>
            <Button onClick={handleUploadDocuments} disabled={processing || selectedFiles.length === 0}>
              {processing ? "上传中..." : `上传 ${selectedFiles.length} 个文档`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};