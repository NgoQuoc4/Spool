import { DirectMessageIcon } from "@/components/Icons";

const ChatEmptyState = ({
  hasConversations,
  onStartFirstChat,
  onOpenNewModal,
}: {
  hasConversations: boolean;
  onStartFirstChat: () => void;
  onOpenNewModal: () => void;
}) => {
  return (
    <div className="messages-empty-container">
      <div className="messages-empty-circle">
        <DirectMessageIcon size={38} />
      </div>
      <h2 className="messages-empty-title">Keep it real in direct messages</h2>
      <p className="messages-empty-subtitle">
        Start a side conversation, send threads and more.
      </p>
      <button
        className="messages-new-btn"
        onClick={() => {
          if (hasConversations) {
            onStartFirstChat();
          } else {
            onOpenNewModal();
          }
        }}
      >
        New message
      </button>
    </div>
  );
};

export default ChatEmptyState;
