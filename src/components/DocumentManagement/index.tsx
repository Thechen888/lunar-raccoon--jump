import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, RefreshCw } from "lucide-react";
import { DocumentManagementList } from "./DocumentManagementList";
import { QAManagement } from "./QAManagement";

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
  const [activeTab, setActiveTab] = useState("documents");
  const [collections] = useState<DocumentCollection[]>([
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
    },
    {
      id: "5",
      name: "系统设计文档.md",
      type: "markdown",
      description: "系统架构设计和实现方案",
      fileSize: 3145728,
      uploadDate: "2024-01-16",
      status: "processed",
      tags: ["技术", "架构", "设计"],
      collectionId: "tech-docs-cn"
    },
    {
      id: "6",
      name: "用户手册QA.md",
      type: "qa",
      description: "用户使用手册常见问题",
      fileSize: 768000,
      uploadDate: "2024-01-16",
      status: "processed",
      tags: ["用户", "手册", "QA"],
      collectionId: "knowledge-base",
      qaCount: 32
    }
  ]);

  const [processing, setProcessing] = useState(false);

  const handleQAUpdate = (documentId: string, newQAList: any[]) => {
    // 更新文档的 QA 计数
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === documentId 
          ? { ...doc, qaCount: newQAList.length }
          : doc
      )
    );
  };

  const handleReindex = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      console.log("重新索引完成");
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>文档管理</CardTitle>
              <CardDescription>
                管理文档、查看 Markdown 内容、管理 QA 问答库
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleReindex} disabled={processing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${processing ? "animate-spin" : ""}`} />
              重新索引
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents">文档列表</TabsTrigger>
          <TabsTrigger value="qa">QA 管理</TabsTrigger>
          <TabsTrigger value="collections">文档集</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <DocumentManagementList 
            documents={documents}
            collections={collections}
            setDocuments={setDocuments}
          />
        </TabsContent>

        <TabsContent value="qa">
          <QAManagement 
            documents={documents}
            onQAUpdate={handleQAUpdate}
          />
        </TabsContent>

        <TabsContent value="collections">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>文档集管理</span>
              </CardTitle>
              <CardDescription>
                管理文档集，每个文档集包含多个文档
              </CardDescription>
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
                        <CardDescription className={collection.status === "active" ? "text-green-600" : "text-gray-600"}>
                          {collection.status === "active" ? "活跃" : "非活跃"}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">类型:</span>
                          <span className="font-medium">{collection.type}</span>
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
                          <span className="text-sm">
                            {collection.vectorIndexStatus === "ready" ? "就绪" : collection.vectorIndexStatus === "building" ? "构建中" : "未索引"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">最后更新:</span>
                          <span>{collection.lastUpdated}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {collection.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-muted px-2 py-1 rounded">
                              {tag}
                            </span>
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
      </Tabs>
    </div>
  );
};