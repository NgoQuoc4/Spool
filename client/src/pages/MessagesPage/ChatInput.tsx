import { useRef, useState } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
}

const ChatInput = ({ onSend }: ChatInputProps) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="messages-input-bar">
      <form
        className="messages-input-form"
        onSubmit={handleSubmit}
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          type="text"
          className="messages-input-field"
          placeholder="Start a message..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <button
          type="submit"
          className="messages-send-btn"
          disabled={!value.trim()}
          onClick={(e) => e.stopPropagation()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
