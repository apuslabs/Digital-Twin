import React, { useEffect } from "react";
import Markdown from "react-markdown";

interface ContributionDetailData {
  // Basic info
  walletAddress?: string;
  figureName: string;
  date: string;
  
  // Score (optional for incomplete evaluations)
  aiScore?: number;
  
  // IDs and links
  arweaveTxId?: string;
  aoMessageId?: string;
  
  // Content
  contribution?: string;
  reasoning?: string;
  
  // TEE Attestation
  attestation?: string;
  teeStatus?: "verified" | "failed" | "verifying";
  teeProvider?: string;
}

interface ContributionDetailCardProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: ContributionDetailData;
  mode?: "winner" | "evaluation";
}

const CloseIcon = () => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const ContributionDetailCard: React.FC<ContributionDetailCardProps> = ({
  isOpen,
  onClose,
  title,
  data,
  mode = "winner"
}) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative bg-white border border-neutral-300 p-6 m-4 max-w-2xl w-full transform transition-all duration-300 animate-slide-up text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-300">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 border border-neutral-300 hover:bg-neutral-50 transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-6">
          {/* Header Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-neutral-500">
                {mode === "winner" ? "Winner Address" : "Status"}
              </p>
              {mode === "winner" && data.walletAddress ? (
                <p
                  className="text-neutral-900 font-mono break-all"
                  title={data.walletAddress}
                >
                  {data.walletAddress}
                </p>
              ) : (
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              )}
            </div>
            <div>
              <p className="text-neutral-500">
                {mode === "winner" ? "Contribution For" : "Evaluation For"}
              </p>
              <p className="text-neutral-900 font-semibold">
                {data.figureName}
              </p>
            </div>
            <div>
              <p className="text-neutral-500">Date</p>
              <p className="text-neutral-900">{data.date}</p>
            </div>
          </div>

          {/* Score and IDs Cards */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4">
            <div className="flex-1 p-4 border border-neutral-300 bg-white/80 flex flex-col items-center justify-center text-center">
              <p className="text-sm text-neutral-600 mb-1">
                AI Evaluated Score
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {typeof data.aiScore === 'number' ? data.aiScore : '--'}
              </p>
            </div>
            
            {/* Arweave Transaction ID (for winners) or AO Message ID (for evaluations) */}
            {mode === "winner" && data.arweaveTxId ? (
              <div className="flex-1 p-4 border border-neutral-300 bg-white/80">
                <p className="text-sm text-neutral-600 mb-2">
                  Arweave Transaction ID
                </p>
                <p className="text-[11px] text-neutral-500 mb-1">
                  Contribution data storage
                </p>
                <a
                  href="#"
                  className="text-sm font-mono text-neutral-900 break-all hover:underline"
                  title={data.arweaveTxId}
                >
                  {data.arweaveTxId.substring(0, 18)}...
                </a>
              </div>
            ) : (
              <div className="flex-1 p-4 border border-neutral-300 bg-white/80">
                <p className="text-sm text-neutral-600 mb-2">
                  AO Message ID
                </p>
                <a
                  href="#"
                  className="text-sm font-mono text-neutral-900 break-all hover:underline"
                  title={data.aoMessageId}
                >
                  {data.aoMessageId.substring(0, 18)}...
                </a>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div>
            <p className="text-neutral-600 mb-2 text-sm">
              {mode === "winner" ? "Contribution Data" : "AI Judge Reasoning"}
            </p>
            <div className="max-h-48 overflow-y-auto border border-neutral-300 bg-white/80 p-4 custom-scrollbar">
              {mode === "winner" ? (
                <p className="text-neutral-900 whitespace-pre-wrap font-light">
                  {data.contribution}
                </p>
              ) : (
                <p className="text-neutral-900 whitespace-pre-wrap font-light">
                  <Markdown>{data.reasoning || ""}</Markdown>
                </p>
              )}
            </div>
          </div>

          {/* TEE Protection Section - for both winners and evaluations with attestation data */}
          {data.attestation && (
            <div className="border border-neutral-300 p-4 bg-white/80">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-green-500 mr-2"></div>
                <p className="text-neutral-800 font-semibold text-sm inline-flex items-center gap-1">
                  <span className="ph ph-[lock]"></span>
                  TEE Protected Attestation
                </p>
              </div>
              <p className="text-[11px] text-neutral-600 mb-2">
                This evaluation was verified in a Trusted Execution Environment
              </p>
              <p className="text-xs font-mono text-neutral-900 bg-transparent p-2 border border-neutral-300 break-all">
                {data.attestation}
              </p>
              <p className="text-[11px] text-neutral-600 mt-2 inline-flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <span className="ph ph-[check]"></span>Cryptographically
                  verified
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="ph ph-[shield]"></span>Tamper‑proof evaluation
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="ph ph-[check]"></span>Privacy preserved
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-300 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 transition-colors"
          >
            Close
          </button>
        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 2px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a3a3a3; }
        `}</style>
      </div>
    </div>
  );
};

export default ContributionDetailCard;