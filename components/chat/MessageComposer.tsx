import React from "react";

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSummarize?: () => void;
  isLoading: boolean;
  placeholder: string;
  hasSummarizeButton?: boolean;
}

const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
);

const SummarizeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const MessageComposer: React.FC<MessageComposerProps> = ({
  value,
  onChange,
  onSubmit,
  onSummarize,
  isLoading,
  placeholder,
  hasSummarizeButton = false,
}) => {
  const isDisabled = isLoading || !value.trim();

  return (
    <div className="p-4 border-t border-border shrink-0 bg-neutral-100">
      <form onSubmit={onSubmit} className="flex items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 w-full border border-border bg-white  py-3 px-3  placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
          disabled={isLoading}
        />
        {hasSummarizeButton && onSummarize && (
          <button
            type="button"
            onClick={onSummarize}
            className="p-3 bg-purple-600 border border-border text-white hover:bg-purple-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2"
            title="Summarize conversation"
          >
            <SummarizeIcon />
          </button>
        )}
        <button
          type="submit"
          className={`p-3 bg-blue-600 border border-border disabled:bg-neutral-200 disabled:cursor-not-allowed hover:bg-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-blue-600 ${
            isDisabled ? "text-neutral-500" : "text-white"
          }`}
          disabled={isDisabled}
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

export default MessageComposer;
