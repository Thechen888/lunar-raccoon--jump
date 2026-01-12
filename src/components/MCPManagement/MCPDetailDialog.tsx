export const MCPDetailDialog = ({ 
  service, 
  open, 
  onOpenChange, 
  onEdit, 
  onDelete,
  onToggleTool 
}: MCPDetailDialogProps) => {
  const [activeTab, setActiveTab] = useState("info");

  // 示例工具数据
  const exampleTools: Tool[] = [
    {
      id: "tool-code-gen",
      name: "代码生成",
      description: "根据需求生成高质量代码，支持多种编程语言",
      method: "POST",
      path: "/api/code/generate",
      enabled: true,
      projectId: "proj-example-001"
    },
    {
      id: "tool-text-analyze",
      name: "文本分析",
      description: "分析文本内容，提取关键信息和情感倾向",
      method: "POST",
      path: "/api/text/analyze",
      enabled: true,
      projectId: "proj-example-002"
    },
    {
      id: "tool-data-query",
      name: "数据查询",
      description: "查询数据库中的数据，支持复杂查询条件",
      method: "GET",
      path: "/api/data/query",
      enabled: false,
      projectId: "proj-example-003"
    },
    {
      id: "tool-file-process",
      name: "文件处理",
      description: "上传、下载和处理各种格式的文件",
      method: "POST",
      path: "/api/file/process",
      enabled: true,
      projectId: "proj-example-004"
    }
  ];

  // 示例提示数据
  const examplePrompts: Prompt[] = [
    {
      id: "prompt-system",
      name: "系统提示词",
      content: "你是一个专业的AI助手，擅长回答各类问题。请确保回答准确、简洁、有帮助。对于技术问题，请提供详细的解释和示例代码。"
    },
    {
      id: "prompt-code-review",
      name: "代码审查提示词",
      content: "请审查以下代码，检查潜在的bug、性能问题和代码风格问题。提供具体的改进建议。\n\n代码：\n{code}"
    },
    {
      id: "prompt-data-analysis",
      name: "数据分析提示词",
      content: "请分析以下数据，提供关键洞察、趋势分析和可视化建议。使用专业的数据分析方法。\n\n数据：\n{data}"
    }
  ];

  // 优先使用传入的工具/提示，如果没有则使用示例数据
  const toolsToShow = service.tools && service.tools.length > 0 ? service.tools : exampleTools;
  const promptsToShow = service.prompts && service.prompts.length > 0 ? service.prompts : examplePrompts;

  const handleToggleTool = (toolId: string) => {
    onToggleTool(toolId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{service.name}</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(service)}
              >
                <Settings className="h-4 w-4 mr-1" />
                编辑
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDelete(service.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="flex-shrink-0">
            <TabsTrigger value="info">基本信息</TabsTrigger>
            <TabsTrigger value="tools">工具</TabsTrigger>
            <TabsTrigger value="prompts">提示</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-y-auto mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">状态</label>
                  <div className="mt-1">
                    <Badge variant={service.status === "active" ? "default" : "secondary"}>
                      {service.status === "active" ? "启用" : "禁用"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">创建时间</label>
                  <div className="mt-1">{service.createdAt}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">描述</label>
                <p className="mt-1 text-sm">{service.description || "无描述"}</p>
              </div>

              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground">URL</label>
                  <code className="block mt-1 text-sm bg-muted px-3 py-2 rounded">
                    {service.url}
                  </code>
                </div>
              </div>

              {service.headers && (
                <div className="flex items-start space-x-2">
                  <Code className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground">请求头</label>
                    <code className="block mt-1 text-sm bg-muted px-3 py-2 rounded whitespace-pre-wrap">
                      {service.headers}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tools" className="flex-1 flex flex-col overflow-hidden mt-4">
            <div className="space-y-2 mb-4 flex-shrink-0">
              <p className="text-sm text-muted-foreground">
                工具列表自动从服务端拉取，无法手动添加
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <ToolList 
                tools={toolsToShow} 
                onToggleTool={handleToggleTool}
              />
            </div>
          </TabsContent>

          <TabsContent value="prompts" className="flex-1 overflow-y-auto mt-4">
            <div className="space-y-2 mb-4">
              <p className="text-sm text-muted-foreground">
                提示内容自动从服务端拉取，无法手动添加
              </p>
            </div>
            <PromptList prompts={promptsToShow} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};