import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Search, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface QAItem {
  id: string;
  question: string;
  answer: string;
  tags?: string[];
  relevanceScore?: number;
}

interface QAListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  qaList: QAItem[];
  onAskQuestion?: (question: string) => Promise<string>;
}

export const QAList = ({ open, onOpenChange, title, qaList, onAskQuestion }: QAListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredQAList = qaList.filter(qa =>
    qa.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qa.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("已复制到剪贴板");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAsk = async () => {
    if (!questionInput.trim()) {
      toast.error("请输入问题");
      return;
    }
    
    if (!onAskQuestion) {
      toast.error("问答功能未配置");
      return;
    }

    setLoading(true);
    try {
      const result = await onAskQuestion(questionInput);
      setAnswer(result);
    } catch (error) {
      toast.error("查询失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title} - QA列表</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 搜索和提问区域 */}
          <div className="flex-shrink-0 space-y-3 pb-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索问答对..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {onAskQuestion && (
              <div className="flex space-x-2">
                <Input
                  placeholder="输入问题进行提问..."
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                />
                <Button onClick={handleAsk} disabled={loading}>
                  {loading ? "查询中..." : "提问"}
                </Button>
              </div>
            )}
          </div>

          {/* QA回答显示 */}
          {answer && (
            <div className="flex-shrink-0 p-4 bg-muted rounded-lg mb-4">
              <p className="text-sm font-medium mb-2">回答：</p>
              <p className="text-sm">{answer}</p>
            </div>
          )}

          {/* QA列表 */}
          <ScrollArea className="flex-1">
            <div className="space-y-3 pr-4">
              {filteredQAList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {searchTerm ? "未找到匹配的问答对" : "暂无问答对"}
                </div>
              ) : (
                filteredQAList.map((qa) => (
                  <div key={qa.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium mb-1">问题：</p>
                        <p className="text-sm">{qa.question}</p>
                      </div>
                      {qa.relevanceScore !== undefined && (
                        <Badge variant="outline" className="text-xs ml-2">
                          相关性: {qa.relevanceScore.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium mb-1 text-sm">答案：</p>
                          <p className="text-sm text-muted-foreground">{qa.answer}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(qa.id, `问题：${qa.question}\n答案：${qa.answer}`)}
                          className="ml-2 flex-shrink-0"
                        >
                          {copiedId === qa.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {qa.tags && qa.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
                        {qa.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};