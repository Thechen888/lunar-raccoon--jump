import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp, Zap, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Tool {
  id: string;
  name: string;
  description: string;
  method: string;
  path: string;
  enabled: boolean;
  details: string;
}

interface ToolListProps {
  tools: Tool[];
  onToggleTool: (toolId: string) => void;
}

export const ToolList = ({ tools, onToggleTool }: ToolListProps) => {
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const toggleExpand = (toolId: string) => {
    setExpandedTools((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(toolId)) {
        newSet.delete(toolId);
      } else {
        newSet.add(toolId);
      }
      return newSet;
    });
  };

  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (tools.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          暂无工具
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索工具..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredTools.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            未找到匹配的工具
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {filteredTools.map((tool) => (
              <Card key={tool.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Zap className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base">{tool.name}</CardTitle>
                        <Switch
                          checked={tool.enabled}
                          onCheckedChange={() => onToggleTool(tool.id)}
                        />
                      </div>
                      <CardDescription className="mt-1">
                        {tool.description}
                      </CardDescription>
                      {/* Method 和 Path 显示 */}
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge 
                          variant={
                            tool.method === "GET" ? "default" :
                            tool.method === "POST" ? "secondary" :
                            tool.method === "PUT" ? "outline" :
                            tool.method === "DELETE" ? "destructive" :
                            "outline"
                          }
                          className="text-xs"
                        >
                          {tool.method}
                        </Badge>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <code className="bg-muted px-2 py-0.5 rounded">
                            {tool.path}
                          </code>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand(tool.id)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      {expandedTools.has(tool.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </CardHeader>
                {expandedTools.has(tool.id) && (
                  <CardContent className="pt-0">
                    <div className="border-t pt-3">
                      <div className="text-sm">
                        <span className="font-medium">工具详情：</span>
                        <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{tool.details}</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};