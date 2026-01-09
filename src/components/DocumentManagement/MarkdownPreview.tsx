import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
}

export const MarkdownPreview = ({ open, onOpenChange, title, content }: MarkdownPreviewProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("已复制到剪贴板");
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("已下载");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate flex-1 mr-4">{title}</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-1" />
                复制
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                下载
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4">
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
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};