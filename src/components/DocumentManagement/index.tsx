import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Search, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";
import { DocumentCard, Document } from "./DocumentCard";
import { MarkdownPreview } from "./MarkdownPreview";
import { QAList, QAItem } from "./QAList";
import { UploadDialog } from "./UploadDialog";

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

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "React开发指南.md",
      type: "markdown",
      description: "React框架完整开发指南，包含组件、Hooks、状态管理等",
      fileSize: 2456000,
      uploadDate: "2024-01-15",
      status: "processed",
      tags: ["技术", "React", "前端"],
      collectionId: "tech-docs-cn"
    },
    {
      id: "2",
      name: "产品FAQ.md",
      type: "qa",
      description: "产品常见问题及解答",
      fileSize: 512000,
      uploadDate: "2024-01-14",
      status: "processed",
      tags: ["业务", "产品", "FAQ"],
      collectionId: "business-docs-cn",
      qaCount: 25
    },
    {
      id: "3",
      name: "GDPR合规指南.md",
      type: "markdown",
      description: "GDPR数据保护法规合规指南",
      fileSize: 5120000,
      uploadDate: "2024-01-10",
      status: "processed",
      tags: ["法律", "合规", "欧洲"],
      collectionId: "legal-docs-eu"
    },
    {
      id: "4",
      name: "技术支持QA.md",
      type: "qa",
      description: "技术支持常见问答",
      fileSize: 1024000,
      uploadDate: "2024-01-15",
      status: "processed",
      tags: ["技术", "支持", "QA"],
      collectionId: "tech-docs-cn",
      qaCount: 48
    }
  ]);

  const [activeTab, setActiveTab] = useState("collections");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "markdown" | "qa">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [previewMarkdown, setPreviewMarkdown] = useState<{ docId: string; title: string; content: string } | null>(null);
  const [qaListData, setQaListData] = useState<{ docId: string; title: string; qaList: QAItem[] } | null>(null);

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
      setCollections(collections.map(c => 
        c.id === data.collectionId 
          ? { ...c, documentCount: c.documentCount + newDocuments.length }
          : c
      ));
      
      setProcessing(false);
      toast.success(`成功上传 ${newDocuments.length} 个文档`);
    }, 2000);
  };

  const handleViewMarkdown = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      const mockContent = `# ${doc.name}

## 概述
${doc.description}

## 主要内容

### 第一章
这是第一章的内容...

### 第二章
这是第二章的内容...

## 代码示例

\`\`\`javascript
function example() {
  console.log("Hello, World!");
}
\`\`\`

## 表格

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
| D   | E   | F   |
`;
      
      setPreviewMarkdown({
        docId,
        title: doc.name,
        content: mockContent
      });
    }
  };

  const handleViewQA = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      const mockQAList: QAItem[] = [
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
        },
        {
          id: "qa-3",
          question: "如何导出数据？",
          answer: "导出数据的步骤如下：\n1. 选择要导出的数据\n2. 点击导出按钮\n3. 选择导出格式\n4. 确认导出",
          tags: ["导出", "数据"],
          relevanceScore: 0.92
        }
      ];
      
      setQaListData({
        docId,
        title: doc.name,
        qaList: mockQAList
      });
    }
  };

  const handleAskQuestion = async (question: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `根据文档信息，这是一个很好的问题。关于 "${question}"，答案是：这需要根据具体情况来判断。建议您查看相关文档的详细说明。`;
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

  const handleReindex = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      toast.success("文档重新索引完成");
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="collections">文档集</TabsTrigger>
          <TabsTrigger value="documents">文档列表</TabsTrigger>
        </TabsList>

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
                    管理文档集，每个文档集包含多个文档
                  </CardDescription>
                </div>
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
                            <FileText className="h-3 w-3 mr-1" />
                            文档数:
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>文档列表</CardTitle>
                  <CardDescription>
                    查看 Markdown 文档和 QA 文档
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={handleReindex} disabled={processing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${processing ? "animate-spin" : ""}`} />
                    重新索引
                  </Button>
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    上传文档
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
              </div>

              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无文档
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {previewMarkdown && (
        <MarkdownPreview
          open={true}
          onOpenChange={() => setPreviewMarkdown(null)}
          title={previewMarkdown.title}
          content={previewMarkdown.content}
        />
      )}

      {qaListData && (
        <QAList
          open={true}
          onOpenChange={() => setQaListData(null)}
          title={qaListData.title}
          qaList={qaListData.qaList}
          onAskQuestion={handleAskQuestion}
        />
      )}

      <UploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        collections={collections}
        onUpload={handleUploadDocuments}
      />
    </div>
  );
};