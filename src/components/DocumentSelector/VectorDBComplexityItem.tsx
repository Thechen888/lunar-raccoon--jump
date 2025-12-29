import { Check } from "lucide-react";

interface VectorDBComplexityItemProps {
  dbId: string;
  complexity: string;
  dbAddress: string;
  isSelected: boolean;
  onSelect: (dbId: string, complexity: string) => void;
}

export const VectorDBComplexityItem = ({ dbId, complexity, dbAddress, isSelected, onSelect }: VectorDBComplexityItemProps) => {
  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-all border ${
        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      }`}
      onClick={() => onSelect(dbId, complexity)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{complexity}</span>
            {isSelected && <Check className="h-3 w-3 text-primary" />}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{dbAddress}</p>
        </div>
      </div>
    </div>
  );
};