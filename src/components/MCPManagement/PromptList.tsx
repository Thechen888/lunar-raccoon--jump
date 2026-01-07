import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Prompt {
  id: string;
  name: string;
  content: string;
}

interface PromptListProps {
  prompts: Prompt[];
}

export const PromptList = ({ prompts }: PromptListProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (promptId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(promptId);
    toast.success("已复制到剪贴板");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (prompts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          暂无提示
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {prompts.map((prompt) => (
        <Card key={prompt.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">{prompt.name}</CardTitle>
              </div>
              <button
                onClick={() => handleCopy(prompt.id, prompt.content)}
                className="p-1 hover:bg-muted rounded transition-colors"
                title="复制内容"
              >
                {copiedId === prompt.id ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="border-t pt-3">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {prompt.content}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};