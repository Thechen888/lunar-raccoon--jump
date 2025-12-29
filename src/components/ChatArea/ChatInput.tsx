import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  disabled: boolean;
  onSend: (message: string) => void;
}

export const ChatInput = ({ disabled, onSend }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-4">
      <div className="flex space-x-2">
        <Textarea
          placeholder="输入您的问题..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="min-h-[80px] resize-none"
          disabled={disabled}
        />
        <Button onClick={handleSend} disabled={!input.trim() || disabled} className="self-end">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};