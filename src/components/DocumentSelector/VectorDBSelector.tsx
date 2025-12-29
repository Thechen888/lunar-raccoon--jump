import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

interface VectorDB {
  id: string;
  name: string;
  complexityOptions: string[];
}

interface VectorDBSelectorProps {
  databases: VectorDB[];
  expandedDatabases: Set<string>;
  onToggleExpand: (dbId: string) => void;
}

export const VectorDBSelector = ({ databases, expandedDatabases, onToggleExpand }: VectorDBSelectorProps) => {
  return (
    <div className="space-y-3">
      {databases.map((region) => (
        <div key={region.id} className="border rounded-lg overflow-hidden">
          <div
            className={`p-4 cursor-pointer transition-colors ${
              expandedDatabases.has(region.id) ? "bg-muted/50" : "hover:bg-muted/30"
            }`}
            onClick={() => onToggleExpand(region.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {expandedDatabases.has(region.id) ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <h4 className="font-medium">{region.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {region.complexityOptions.join(" / ")}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {region.complexityOptions.length} 个选项
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};