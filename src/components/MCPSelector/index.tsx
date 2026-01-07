import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";

export type MCPSelection = string;

interface MCPProvider {
  id: string;
  name: string;
  description: string;
  regions?: Array<{ id: string; name: string }>;
  complexityLevels?: Array<{ id: string; name: string; description: string }>;
}

interface MCPSelectorProps {
  onSelect: (selection: MCPSelection[]) => void;
  selectedMCPs: MCPSelection[];
  providers: MCPProvider[];
}

export const MCPSelector = ({ onSelect, selectedMCPs, providers }: MCPSelectorProps) => {
  const handleToggleService = (providerId: string) => {
    if (selectedMCPs.includes(providerId)) {
      onSelect(selectedMCPs.filter(id => id !== providerId));
    } else {
      onSelect([...selectedMCPs, providerId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedMCPs.length === providers.length) {
      onSelect([]);
    } else {
      onSelect(providers.map(p => p.id));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium">选择MCP服务（可多选）</span>
        <button
          onClick={handleSelectAll}
          className="text-xs text-primary hover:underline"
        >
          {selectedMCPs.length === providers.length ? "取消全选" : "全选"}
        </button>
      </div>
      
      <div className="space-y-2">
        {providers.map((provider) => {
          const isSelected = selectedMCPs.includes(provider.id);
          
          return (
            <div
              key={provider.id}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => handleToggleService(provider.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <Checkbox 
                    checked={isSelected} 
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${isSelected ? "text-green-600" : ""}`}>
                        {provider.name}
                      </span>
                      {isSelected && <Check className="h-3 w-3 text-green-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {provider.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedMCPs.length > 0 && (
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">已选择:</p>
          <div className="flex flex-wrap gap-1">
            {selectedMCPs.map((selectedId) => {
              const provider = providers.find(p => p.id === selectedId);
              return (
                <Badge key={selectedId} variant="secondary" className="text-xs">
                  {provider?.name}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};