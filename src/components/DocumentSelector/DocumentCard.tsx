import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface DocumentCollection {
  id: string;
  name: string;
  type: string;
  documentCount: number;
  qaCount: number;
  description: string;
  lastUpdated: string;
  tags: string[];
  vectorIndexStatus: "ready" | "building" | "none";
}

interface DocumentCardProps {
  collection: DocumentCollection;
  isSelected: boolean;
  onSelect: (docId: string) => void;
}

export const DocumentCard = ({ collection, isSelected, onSelect }: DocumentCardProps) => {
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      }`}
      onClick={() => onSelect(collection.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium">{collection.name}</h4>
            {isSelected && <Check className="h-4 w-4 text-primary" />}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{collection.description}</p>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">{collection.type}</Badge>
              <Badge variant="secondary" className="text-xs">
                {collection.documentCount} 文档
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {collection.qaCount} QA
              </Badge>
              <Badge
                variant={
                  collection.vectorIndexStatus === "ready"
                    ? "default"
                    : collection.vectorIndexStatus === "building"
                    ? "secondary"
                    : "destructive"
                }
                className="text-xs"
              >
                {collection.vectorIndexStatus === "ready"
                  ? "向量就绪"
                  : collection.vectorIndexStatus === "building"
                  ? "构建中"
                  : "未索引"}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">{collection.lastUpdated}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {collection.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};