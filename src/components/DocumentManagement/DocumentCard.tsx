import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, MessageSquare, Trash2, FileCode } from "lucide-react";

export interface Document {
  id: string;
  name: string;
  type: "markdown" | "qa";
  description?: string;
  fileSize?: number;
  uploadDate: string;
  status: "processed" | "processing" | "error";
  tags: string[];
  collectionId: string;
  qaCount?: number;
}

interface DocumentCardProps {
  document: Document;
  collectionName: string;
  onViewMarkdown: (docId: string) => void;
  onViewQA: (docId: string) => void;
  onDelete: (docId: string) => void;
}

export const DocumentCard = ({ document, collectionName, onViewMarkdown, onViewQA, onDelete }: DocumentCardProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {document.type === "markdown" ? (
                <FileCode className="h-5 w-5 text-blue-500" />
              ) : (
                <MessageSquare className="h-5 w-5 text-green-500" />
              )}
              <CardTitle className="text-lg">{document.name}</CardTitle>
              <Badge variant={document.type === "markdown" ? "default" : "secondary"}>
                {document.type === "markdown" ? "Markdown" : "QA文档"}
              </Badge>
            </div>
            {document.description && (
              <p className="text-sm text-muted-foreground">{document.description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">文档集:</span>
            <span className="font-medium">{collectionName}</span>
          </div>
          
          {document.fileSize && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">文件大小:</span>
              <span className="font-medium">{formatFileSize(document.fileSize)}</span>
            </div>
          )}
          
          {document.qaCount !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                QA数量:
              </span>
              <span className="font-medium">{document.qaCount}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">上传日期:</span>
            <span>{document.uploadDate}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">状态:</span>
            <Badge 
              variant={document.status === "processed" ? "default" : document.status === "processing" ? "secondary" : "destructive"}
              className="text-xs"
            >
              {document.status === "processed" ? "已处理" : document.status === "processing" ? "处理中" : "错误"}
            </Badge>
          </div>
          
          {document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {document.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex space-x-2 pt-3 border-t">
            {document.type === "markdown" ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onViewMarkdown(document.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                预览
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onViewQA(document.id)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                查看QA
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDelete(document.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};