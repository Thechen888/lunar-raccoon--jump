import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { File, X, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";

interface Collection {
  id: string;
  name: string;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: Collection[];
  onUpload: (data: {
    collectionId: string;
    documentType: "markdown" | "qa";
    tags: string[];
    description: string;
    files: File[];
  }) => void;
}

export const UploadDialog = ({ open, onOpenChange, collections, onUpload }: UploadDialogProps) => {
  const [collectionId, setCollectionId] = useState("");
  const [documentType, setDocumentType] = useState<"markdown" | "qa">("markdown");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleUpload = () => {
    if (!collectionId) {
      toast.error("请选择文档集");
      return;
    }
    
    if (selectedFiles.length === 0) {
      toast.error("请选择要上传的文档");
      return;
    }

    onUpload({
      collectionId,
      documentType,
      tags,
      description,
      files: selectedFiles
    });

    // Reset form
    setCollectionId("");
    setDocumentType("markdown");
    setTags([]);
    setTagInput("");
    setDescription("");
    setSelectedFiles([]);
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>上传文档</DialogTitle>
          <DialogDescription>
            支持 Markdown 文档和 QA 文档上传
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 文档集选择 */}
          <div>
            <Label>选择文档集 <span className="text-red-500">*</span></Label>
            <Select value={collectionId} onValueChange={setCollectionId}>
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

          {/* 文档类型 */}
          <div>
            <Label>文档类型 <span className="text-red-500">*</span></Label>
            <Select value={documentType} onValueChange={(value: "markdown" | "qa") => setDocumentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="markdown">Markdown 文档</SelectItem>
                <SelectItem value="qa">QA 文档</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 描述 */}
          <div>
            <Label>描述</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述这个文档的用途..."
              rows={2}
            />
          </div>

          {/* 标签 */}
          <div>
            <Label>标签</Label>
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="输入标签后按回车"
              />
              <Button variant="outline" onClick={handleAddTag}>
                添加
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 文件选择 */}
          <div>
            <Label>文件 <span className="text-red-500">*</span></Label>
            <div className="mt-2">
              <Input 
                type="file" 
                multiple
                className="cursor-pointer"
                onChange={handleFileSelect}
                accept={documentType === "markdown" ? ".md,.markdown" : ".json,.txt"}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {documentType === "markdown" 
                  ? "支持的格式：.md, .markdown（可多选）" 
                  : "支持的格式：.json, .txt（可多选）"}
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
              <div className="space-y-2 max-h-32 overflow-y-auto">
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleUpload} disabled={!collectionId || selectedFiles.length === 0}>
            <Upload className="h-4 w-4 mr-2" />
            上传文档
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};