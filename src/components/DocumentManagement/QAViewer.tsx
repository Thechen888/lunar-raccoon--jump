import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Send, Copy, Check, MessageSquare, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { documentApi, QAItem, AskResponse, QueryResponse } from "@/services/documentApi";

interface QAViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentName: string;
}

export const QAViewer = ({ open, onOpenChange, documentId, documentName }: QAViewerProps) => {
  const [activeTab, setActiveTab] = useState("qa-list");
  const [qaList, setQaList] = useState<QAItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [answer, setAnswer] = useState<AskResponse | null>(null);
  const [queryResults, setQueryResults] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 加载 QA 列表（接口3：有哪些 QA）
  const loadQAList = async () => {
    setLoading(true);
    try {
      const response = await documentApi.getQAList({
        keyword: searchTerm || undefined,
        limit: 50
      });
      setQaList(response.items);
    } catch (error) {
      console.error("加载 QA 列表失败:", error);
      // 模拟数据，用于演示
      setQaList([
        {
          id: "qa-1",
          question: "如何使用这个功能？",
          answer: "您可以通过以下步骤使用此功能：\n1. 打开设置页面\n2. 找到功能选项\n3. 启用功能\n4. 保存配置",
          tags: ["使用指南"],
          relevanceScore: 0.95
        },
        {
          id: "qa-2",
          question: "支持哪些格式？",
          answer: "我们支持以下格式：\n- Markdown (.md)\n- PDF (.pdf)\n- Word (.docx)\n- 纯文本 (.txt)",
          tags: ["格式支持"],
          relevanceScore: 0.88
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 接口1：问 (Ask)
  const handleAsk = async () => {
    if (!questionInput.trim()) {
      toast.error("请输入问题");
      return;
    }

    setLoading(true);
    try {
      const response = await documentApi.ask(questionInput, {
        collectionId: documentId
      });
      setAnswer(response);
      toast.success("提问成功");
    } catch (error) {
      console.error("提问失败:", error);
      // 模拟响应
      setAnswer({
        answer: `根据文档 "${documentName}"，关于 "${questionInput}" 的答案是：\n\n这是一个很好的问题。基于文档内容，建议您按照以下步骤操作：\n1. 首先确认您的配置正确\n2. 检查相关设置\n3. 参考文档中的示例代码\n\n如果问题仍然存在，请联系技术支持。`,
        sourceDocuments: [documentId],
        confidence: 0.92
      });
      toast.success("提问成功（演示模式）");
    } finally {
      setLoading(false);
    }
  };

  // 接口2：查 (Query)
  const handleQuery = async () => {
    if (!searchTerm.trim()) {
      toast.error("请输入查询关键词");
      return;
    }

    setLoading(true);
    try {
      const response = await documentApi.query(searchTerm, {
        collectionId: documentId,
        maxResults: 10
      });
      setQueryResults(response);
      toast.success("查询成功");
    } catch (error) {
      console.error("查询失败:", error);
      // 模拟响应
      setQueryResults({
        results: [
          {
            id: "res-1",
            content: `搜索 "${searchTerm}" 找到的相关内容：\n\n这是一个示例搜索结果，展示了与您查询关键词相关的内容片段。在实际系统中，这里会显示从文档库中检索到的真实内容。`,
            relevanceScore: 0.89
          },
          {
            id: "res-2",
            content: `另一个相关结果：\n\n这里显示了更多的相关内容，帮助您找到需要的信息。`,
            relevanceScore: 0.76
          }
        ]
      });
      toast.success("查询成功（演示模式）");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("已复制到剪贴板");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 组件加载时获取 QA 列表
  useEffect(() => {
    if (open) {
      loadQAList();
    }
  }, [open, searchTerm]);

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-base">
            <MessageSquare className="h-4 w-4" />
            <span>问答库 - {documentName}</span>
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="flex-shrink-0 mx-4 mt-4">
            <TabsTrigger value="qa-list">QA 列表</TabsTrigger>
            <TabsTrigger value="ask">提问</TabsTrigger>
            <TabsTrigger value="query">查询</TabsTrigger>
          </TabsList>

          {/* Tab 1: QA 列表（接口3：有哪些 QA） */}
          <TabsContent value="qa-list" className="flex-1 overflow-hidden mt-4 px-4 pb-4">
            <div className="h-full flex flex-col space-y-4">
              <div className="flex-shrink-0 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索问答对..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-3 pr-4">
                  {loading && qaList.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      加载中...
                    </div>
                  ) : qaList.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "未找到匹配的问答对" : "暂无问答对"}
                    </div>
                  ) : (
                    qaList.map((qa) => (
                      <Card key={qa.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                <p className="font-medium">问题：</p>
                              </div>
                              <p className="text-sm ml-6">{qa.question}</p>
                            </div>
                            {qa.relevanceScore !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                相关性: {(qa.relevanceScore * 100).toFixed(0)}%
                              </Badge>
                            )}
                          </div>

                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <FileText className="h-4 w-4 text-green-500" />
                                  <p className="font-medium text-sm">答案：</p>
                                </div>
                                <p className="text-sm text-muted-foreground ml-6 whitespace-pre-wrap">
                                  {qa.answer}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(qa.id, `问题：${qa.question}\n\n答案：${qa.answer}`)}
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
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Tab 2: 提问（接口1：问） */}
          <TabsContent value="ask" className="flex-1 overflow-hidden mt-4 px-4 pb-4">
            <div className="h-full flex flex-col space-y-4">
              <div className="flex-shrink-0 space-y-3">
                <div className="flex space-x-2">
                  <Input
                    placeholder="输入您的问题..."
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                    className="flex-1"
                  />
                  <Button onClick={handleAsk} disabled={loading || !questionInput.trim()}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {loading ? "提问中..." : "提问"}
                  </Button>
                </div>

                {answer && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span>回答</span>
                        {answer.confidence && (
                          <Badge variant="outline" className="text-xs">
                            置信度: {(answer.confidence * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{answer.answer}</p>
                      {answer.sourceDocuments && answer.sourceDocuments.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            来源文档：{answer.sourceDocuments.join(", ")}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {!answer && (
                <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>输入您的问题，AI 将基于文档内容为您解答</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 3: 查询（接口2：查） */}
          <TabsContent value="query" className="flex-1 overflow-hidden mt-4 px-4 pb-4">
            <div className="h-full flex flex-col space-y-4">
              <div className="flex-shrink-0 flex space-x-2">
                <Input
                  placeholder="输入查询关键词..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                  className="flex-1"
                />
                <Button onClick={handleQuery} disabled={loading || !searchTerm.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "查询中..." : "查询"}
                </Button>
              </div>

              {queryResults && queryResults.results.length > 0 ? (
                <ScrollArea className="flex-1">
                  <div className="space-y-3 pr-4">
                    {queryResults.results.map((result) => (
                      <Card key={result.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm whitespace-pre-wrap">{result.content}</p>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <Badge variant="outline" className="text-xs">
                                相关性: {(result.relevanceScore * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : queryResults ? (
                <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>未找到匹配的内容</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>输入查询关键词，在文档库中搜索相关内容</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  );
};