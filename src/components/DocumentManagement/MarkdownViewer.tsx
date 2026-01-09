import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, FileText, Tag, Calendar, HardDrive, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { documentApi } from "@/services/documentApi";

interface MarkdownViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentName: string;
  documentTags?: string[];
  documentUploadDate?: string;
  documentFileSize?: number;
}

export const MarkdownViewer = ({ 
  open, 
  onOpenChange, 
  documentId, 
  documentName,
  documentTags = [],
  documentUploadDate = "",
  documentFileSize = 0
}: MarkdownViewerProps) => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 加载文档内容（接口4：获取 Markdown 文档）
  useEffect(() => {
    const loadDocument = async () => {
      setLoading(true);
      try {
        // 使用 API 获取文档内容
        const response = await documentApi.getMarkdownContent(documentId);
        setContent(response.content);
      } catch (error) {
        console.error("加载文档失败:", error);
        // 模拟文档内容，用于演示
        setContent(`# ${documentName}

## 概述
这是一个示例 Markdown 文档，展示文档内容渲染效果。

## 功能说明

### 1. 文档浏览
- 支持完整的 Markdown 语法
- 代码高亮显示
- 表格渲染

### 2. 代码示例

\`\`\`javascript
// 这是一个 JavaScript 代码示例
function example() {
  console.log("Hello, World!");
  return {
    status: "success",
    data: []
  };
}
\`\`\`

\`\`\`python
# 这是一个 Python 代码示例
def example():
    print("Hello, World!")
    return {"status": "success", "data": []}
\`\`\`

### 3. 表格示例

| 功能 | 状态 | 说明 |
|------|------|------|
| Markdown 渲染 | ✅ | 完整支持 |
| 代码高亮 | ✅ | 多语言支持 |
| 表格展示 | ✅ | 美观展示 |

### 4. 列表示例

#### 无序列表
- 项目 A
- 项目 B
  - 子项目 B.1
  - 子项目 B.2
- 项目 C

#### 有序列表
1. 第一步
2. 第二步
3. 第三步

### 5. 引用示例

> 这是一个引用块，用于强调重要内容。

### 6. 链接和图片

- 链接：[示例链接](https://example.com)
- 粗体：**这是粗体文本**
- 斜体：*这是斜体文本*
- 删除线：~~这是删除线文本~~

### 7. 分割线

---

## 总结

本文档展示了 Markdown 文档的完整渲染效果，包括代码高亮、表格、列表等功能。
`);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadDocument();
    }
  }, [open, documentId, documentName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("已复制到剪贴板");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentName}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("已下载");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex-shrink-0 border-b p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 mr-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">{documentName}</h2>
              </div>
              
              {/* 文档元信息 */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                {documentUploadDate && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{documentUploadDate}</span>
                  </div>
                )}
                
                {documentFileSize > 0 && (
                  <div className="flex items-center space-x-1">
                    <HardDrive className="h-4 w-4" />
                    <span>{formatFileSize(documentFileSize)}</span>
                  </div>
                )}
              </div>
              
              {/* 标签 */}
              {documentTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {documentTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    复制
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open('#', '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                新窗口
              </Button>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <ScrollArea className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>加载文档中...</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        showLineNumbers
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  a({ children, href, ...props }) {
                    return (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 underline"
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};