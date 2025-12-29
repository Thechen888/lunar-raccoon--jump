import { Bot } from "lucide-react";

export const LoadingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <Bot className="h-4 w-4" />
        </div>
        <div className="bg-muted rounded-lg p-3">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
          </div>
        </div>
      </div>
    </div>
  );
};