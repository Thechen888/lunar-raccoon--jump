import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DocumentCard, Document } from "./DocumentCard";
import { UploadDialog } from "./UploadDialog";
import { MarkdownViewer } from "./MarkdownViewer";
import { QAViewer } from "./QAViewer";
import { DocumentCollection } from "./index";
import { Grid, List, Search, Upload } from "lucide-react";
import { toast } from "sonner";

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

  // 查看器状态
  const [markdownViewerDoc, setMarkdownViewerDoc] = useState<{ id: string; name: string; tags?: string[]; uploadDate?: string; fileSize?: number } | null>(null);
  const [qaViewerDoc, setQaViewerDoc] = useState<{ id: string; name: string } | null>(null);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || doc.type === filterType;
    const matchesCollection = !selectedCollection || doc.collectionId === selectedCollection;
    return matchesSearch && matchesType && matchesCollection;
  });

  const handleUploadDocuments = (data: {
    collectionId: string;
    documentType: "markdown" | "qa";
    tags: string[];
    description: string;
    files: File[];
  }) => {
    setProcessing(true);
    
    setTimeout(() => {
      const newDocuments = data.files.map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        name: file.name,
        type: data.documentType,
        description: data.description,
        fileSize: file.size,
        uploadDate: new Date().toISOString().split('T')[0],
        status: "processed" as "processed" | "processing" | "error",
        tags: data.tags,
        collectionId: data.collectionId,
        qaCount: data.documentType === "qa" ? Math.floor(Math.random() * 50) : undefined
      }));
      
      setDocuments([...documents, ...newDocuments]);
      setProcessing(false);
      toast.success(`成功上传 ${newDocuments.length} 个文档`);
    }, 2000);
  };

  const handleViewMarkdown = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      setMarkdownViewerDoc({
        id: doc.id,
        name: doc.name,
        tags: doc.tags,
        uploadDate: doc.uploadDate,
        fileSize: doc.fileSize
      });
    }
  };

  const handleViewQA = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      setQaViewerDoc({
        id: doc.id,
        name: doc.name
      });
    }
  };

  const handleDeleteDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      setDocuments(documents.filter(d => d.id !== docId));
      toast.success("文档已删除");
    }
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
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  collectionName={collections.find(c => c.id === doc.collectionId)?.name || "未分类"}
                  onViewMarkdown={handleViewMarkdown}
                  onViewQA={handleViewQA}
                  onDelete={handleDeleteDocument}
                />
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
                          <div className="h-4 w-4 text-primary flex items-center justify-center">
                            {doc.type === "markdown" ? "📄" : "❓"}
                          </div>
                          <span className="font-medium">{doc.name}</span>
                          <Badge variant={doc.type === "markdown" ? "default" : "secondary"} className="text-xs">
                            {doc.type === "markdown" ? "Markdown" : "QA"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>文档集: {collections.find(c => c.id === doc.collectionId)?.name}</span>
                          <span>上传: {doc.uploadDate}</span>
                          {doc.qaCount && <span>QA: {doc.qaCount}</span>}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {doc.type === "markdown" ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewMarkdown(doc.id)}
                          >
                            查看
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewQA(doc.id)}
                          >
                            查看
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Markdown 查看器对话框 */}
      {markdownViewerDoc && (
        <MarkdownViewer
          open={true}
          onOpenChange={() => setMarkdownViewerDoc(null)}
          documentId={markdownViewerDoc.id}
          documentName={markdownViewerDoc.name}
          documentTags={markdownViewerDoc.tags}
          documentUploadDate={markdownViewerDoc.uploadDate}
          documentFileSize={markdownViewerDoc.fileSize}
        />
      )}

      {/* QA 查看器对话框 */}
      {qaViewerDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col m-4">
            <QAViewer
              open={true}
              onOpenChange={() => setQaViewerDoc(null)}
              documentId={qaViewerDoc.id}
              documentName={qaViewerDoc.name}
            />
          </div>
        </div>
      )}

      {/* 上传对话框 */}
      <UploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        collections={collections}
        onUpload={handleUploadDocuments}
      />
    </>
  );
};