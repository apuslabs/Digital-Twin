import React, { useState, useEffect, useRef, FormEvent } from "react";
import MessageComposer from "./chat/MessageComposer";

import { Figure, ChatMessage, MessageAuthor } from "../types";
import { startChatSession, sendMessage, Chat } from "../services/apusService";
import { aoService } from "../services/LegacyAOService";
import TEEService from "../services/teeService";
import ArweaveService from "../services/arweaveService";
import Markdown from "react-markdown";
import Modal from "./dialog/Modal";

interface ChatInterfaceProps {
  figure: Figure;
  onBack: () => void;
  onNextTwin?: () => void;
  onPrevTwin?: () => void;
}

const BackArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

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

const UsersIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0011 9V8h-.13a7.001 7.001 0 00-3.74 5.93c0 .34.024.673.07 1h5.73zM12 21a7.003 7.003 0 006.83-5.93c.046-.327.07-.66.07-1a7 7 0 00-7-7h-1a7 7 0 00-7 7c0 .34.024.673.07 1A7.003 7.003 0 005 21h7z" />
  </svg>
);

const FileUploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const ChevronIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
      clipRule="evenodd"
    />
  </svg>
);

const AccordionItem: React.FC<{
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ id, title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        setHeight(isOpen ? contentRef.current.scrollHeight : 0);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [isOpen, children]);

  return (
    <div className="border border-border bg-white">
      <button
        type="button"
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-neutral-100 focus:outline-none"
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        id={`${id}-header`}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="text-xs">{title}</span>
        <span
          className={`transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden="true"
        >
          <ChevronIcon />
        </span>
      </button>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-header`}
        className="overflow-hidden"
        style={{ height, transition: "height 250ms ease" }}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
};

const ContributionPanel: React.FC<{ figure: Figure; hideTitle?: boolean }> = ({
  figure,
  hideTitle = false,
}) => {
  const [promptSuggestion, setPromptSuggestion] = useState("");
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "success" | "error" | "info"
  >("info");
  const [submitMsg, setSubmitMsg] = useState<{
    title: string;
    body: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("");
    }
  };

  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!aoService.isWalletConnected()) {
      setSubmitMsg({
        title: "Wallet Required",
        body: "Please connect your Arweave wallet to submit contributions.",
      });
      setSubmitStatus("info");
      setIsSubmitModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      let result;

      if (fileName) {
        // Handle file submission
        const fileInput = document.getElementById(
          "file-upload"
        ) as HTMLInputElement;
        const file = fileInput?.files?.[0];

        if (file) {
          const fileContent = await file.text();
          result = await aoService.submitPromptForEvaluation(
            figure,
            fileContent
          );
        }
      } else if (promptSuggestion.trim()) {
        // Handle text prompt submission
        result = await aoService.submitPromptForEvaluation(
          figure,
          promptSuggestion.trim()
        );
      }

      if (result?.success) {
        setSubmitMsg({
          title: "Success",
          body: `Your contribution has been submitted to ${figure.name}'s agent process for AI evaluation.\n\nMessage ID: ${result.messageId}\n\nYour submission will be reviewed by AI agents and integrated if approved.`,
        });
        setSubmitStatus("success");
        setIsSubmitModalOpen(true);

        // Clear form
        setPromptSuggestion("");
        setFileName("");
        const fileInput = document.getElementById(
          "file-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        // Optionally trigger judge evaluation
        // await aoService.sendPromptsToJudge(figure.processId);
      } else {
        setSubmitMsg({
          title: "Submission Error",
          body: `Error submitting contribution: ${
            result?.error || "Unknown error"
          }\n\nPlease try again or check your wallet connection.`,
        });
        setSubmitStatus("error");
        setIsSubmitModalOpen(true);
      }
    } catch (error) {
      console.error("Contribution submission error:", error);
      setSubmitMsg({
        title: "Unexpected Error",
        body: "An unexpected error occurred. Please try again.",
      });
      setSubmitStatus("error");
      setIsSubmitModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full relative border border-neutral-300 bg-white p-4 self-start text-neutral-900">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#000 0px,#000 1px,transparent 1px,transparent 8px),repeating-linear-gradient(-45deg,#000 0px,#000 1px,transparent 1px,transparent 8px)",
            backgroundSize: "12px 12px, 12px 12px",
          }}
        />

        <div className="relative space-y-3">
          {!hideTitle && (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 mr-2"></div>
              <h3 className="text-xs font-semibold tracking-wide uppercase text-neutral-700">
                Improve this Digital Twin
              </h3>
            </div>
          )}

          <div className="p-3 border border-neutral-300 bg-white/80">
            <p className="text-[11px] font-semibold mb-1 tracking-wide text-neutral-600 uppercase">
              Community
            </p>
            <p className="text-sm text-neutral-800 flex items-center">
              <UsersIcon />
              <span>
                Join <strong>{figure.contributors.toLocaleString()}</strong>{" "}
                other contributors!
              </span>
            </p>
          </div>

          <div className="p-3 border border-pink-500/30 bg-pink-50">
            <p className="text-[11px] font-semibold mb-1 tracking-wide text-pink-700 uppercase flex items-center gap-2">
              <span className="ph ph-[robot]"></span>
              AI-Powered Quality Control
            </p>
            <p className="text-[12px] text-pink-900/90 mb-2">
              Your contributions are evaluated by AI agents for authenticity and
              quality before being integrated.
            </p>
            <p className="text-[12px] text-pink-900/90">
              <strong className="font-semibold">Arweave Storage:</strong>{" "}
              Approved contributions become part of the permanent digital twin
              stored forever on Arweave.
            </p>
          </div>

          <form onSubmit={handleContributionSubmit} className="space-y-3">
            <div className="p-3 border border-neutral-300 bg-white/80 space-y-2">
              <p className="text-[11px] font-semibold tracking-wide text-neutral-600 uppercase">
                Suggest persona improvements
              </p>
              <textarea
                id="prompt-suggestion"
                rows={5}
                className="w-full border border-neutral-300 bg-white p-2 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all text-sm"
                placeholder={`e.g., "When discussing technology, ${figure.name} should reference specific innovations and speak with technical precision..."`}
                value={promptSuggestion}
                onChange={(e) => setPromptSuggestion(e.target.value)}
              />
            </div>

            <div className="relative text-center text-neutral-500 text-[11px]">
              <span className="px-2 bg-white">or</span>
              <div className="absolute top-1/2 left-0 w-full h-px bg-neutral-300 -z-10"></div>
            </div>

            <div className="p-3 border border-neutral-300 bg-white/80">
              <label
                htmlFor="file-upload"
                className="w-full cursor-pointer p-2 flex items-center justify-center text-sm font-medium text-neutral-700 bg-transparent border border-neutral-300 hover:bg-neutral-50 transition-colors"
              >
                <FileUploadIcon />
                {fileName || "Upload a .txt file"}
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".txt"
                onChange={handleFileChange}
              />
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-blue-600 text-white font-semibold disabled:bg-neutral-300 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={(!promptSuggestion.trim() && !fileName) || isSubmitting}
            >
              {isSubmitting ? "Submitting to AO..." : "Submit for AI Review"}
            </button>
            <p className="text-[11px] text-neutral-600 text-center">
              {aoService.isWalletConnected() ? (
                "AI agents will evaluate and integrate approved improvements into the permanent Arweave-stored digital twin"
              ) : (
                <span className="inline-flex items-center gap-1">
                  <span className="ph ph-[warning]"></span>Connect your Arweave
                  wallet to submit contributions
                </span>
              )}
            </p>
          </form>
        </div>
      </div>

      {/* Submit modal for contribution panel */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={submitMsg?.title || "Notice"}
      >
        {submitStatus === "success" ? (
          <>
            <div className="mb-3 p-3 border flex items-start gap-3 border-green-300 bg-green-50">
              <span
                className="ph ph-[check-circle] text-green-600 text-xl leading-none mt-0.5"
                aria-hidden
              ></span>
              <div className="text-sm text-neutral-900">
                <div className="font-semibold mb-1">Success</div>
                <pre className="whitespace-pre-wrap text-[13px] text-neutral-800">
                  {(submitMsg?.body || "").split("\n\n")[0]}
                </pre>
              </div>
            </div>
            <div className="p-3 border border-neutral-300 bg-white/80 mb-3">
              <div className="flex items-start gap-2 mb-2">
                <span
                  className="ph ph-[hash-straight] text-neutral-700"
                  aria-hidden
                ></span>
                <div className="text-[11px] text-neutral-500 uppercase tracking-wide">
                  Message ID
                </div>
              </div>
              <div className="font-mono text-sm text-neutral-900 break-all mb-2">
                {(submitMsg?.body || "")
                  .split("\n\n")[1]
                  ?.replace(/^Message ID:\s*/, "")}
              </div>
              <p className="text-[13px] text-neutral-700">
                {(submitMsg?.body || "").split("\n\n")[2] || ""}
              </p>
            </div>
          </>
        ) : (
          <div
            className={`mb-3 p-3 border flex items-start gap-3 ${
              submitStatus === "error"
                ? "border-red-300 bg-red-50"
                : "border-neutral-300 bg-white"
            }`}
          >
            <span
              className={`ph ${
                submitStatus === "error"
                  ? "ph-[x-circle] text-red-600"
                  : "ph-[info] text-neutral-700"
              } text-xl leading-none mt-0.5`}
              aria-hidden
            ></span>
            <div className="text-sm text-neutral-900">
              <div className="font-semibold mb-1">
                {submitMsg?.title || "Notice"}
              </div>
              <pre className="whitespace-pre-wrap text-[13px] text-neutral-800">
                {submitMsg?.body}
              </pre>
            </div>
          </div>
        )}
        <div className="flex justify-end">
          <button
            onClick={() => setIsSubmitModalOpen(false)}
            className={`px-4 py-2 border text-sm active:scale-95 transition ${
              submitStatus === "success"
                ? "border-green-600 text-green-700 bg-white hover:bg-green-50"
                : submitStatus === "error"
                ? "border-red-600 text-red-700 bg-white hover:bg-red-50"
                : "border-neutral-300 text-neutral-800 bg-white hover:bg-neutral-50"
            }`}
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};

const XIcon = () => (
  <img
    src="/resources/x.jpg"
    alt="X (Twitter)"
    className="w-5 h-5 mr-3 object-cover"
  />
);

const DiscordIcon = () => (
  <img
    src="/resources/discord.jpg"
    alt="Discord"
    className="w-5 h-5 mr-3 object-cover"
  />
);

const TelegramIcon = () => (
  <img
    src="/resources/telegram.webp"
    alt="Telegram"
    className="w-5 h-5 mr-3 object-cover"
  />
);

const ConnectionPanel: React.FC<{
  figure: Figure;
  onConnectClick: (platform: string) => void;
  hideTitle?: boolean;
}> = ({ figure, onConnectClick, hideTitle = false }) => {
  const connections = [
    { platform: "X", icon: <XIcon />, name: "X" },
    { platform: "Discord", icon: <DiscordIcon />, name: "Discord" },
    { platform: "Telegram", icon: <TelegramIcon />, name: "Telegram" },
  ];

  return (
    <div className="w-full bg-slate-800/50 p-6 self-start space-y-4">
      {!hideTitle && <h3 className="text-xl font-bold ">Connect Everywhere</h3>}
      <p className="text-sm text-slate-400">
        Engage with {figure.name}'s digital twin on your favorite platforms.
      </p>
      <div className="space-y-3">
        {connections.map(({ platform, icon, name }) => (
          <button
            key={platform}
            onClick={() => onConnectClick(platform)}
            className="w-full flex items-center justify-center p-3 bg-slate-700/80 text-slate-200 font-semibold hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {icon}
            Connect {figure.name} on {name}
          </button>
        ))}
      </div>
    </div>
  );
};

const TEEProtectionPanel: React.FC<{
  figure: Figure;
  hideTitle?: boolean;
  sessionId: string;
}> = ({ figure, hideTitle = false, sessionId }) => {
  const [attestationData, setAttestationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageStartTime] = useState(new Date().toISOString());
  const [isAttestationModalOpen, setIsAttestationModalOpen] = useState(false);

  // Fetch TEE attestation when component mounts
  useEffect(() => {
    const fetchAttestation = async () => {
      setIsLoading(true);
      try {
        const attestation = await TEEService.getAttestation(sessionId);
        setAttestationData(attestation);
      } catch (error) {
        console.error("Failed to fetch TEE attestation:", error);
        setAttestationData({
          error: "Failed to fetch attestation",
          status: "ERROR",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttestation();
  }, [sessionId]);

  const displaySessionId = sessionId.substring(0, 16) + "...";
  const attestationStatus =
    attestationData?.status === "VERIFIED"
      ? "✓"
      : attestationData?.status === "ERROR"
      ? "✗"
      : "⏳";
  const statusColor =
    attestationData?.status === "VERIFIED"
      ? "text-green-600"
      : attestationData?.status === "ERROR"
      ? "text-red-600"
      : "text-yellow-600";

  return (
    <>
      <div className="w-full relative border border-neutral-300 bg-white p-4 self-start text-neutral-900">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#000 0px,#000 1px,transparent 1px,transparent 8px),repeating-linear-gradient(-45deg,#000 0px,#000 1px,transparent 1px,transparent 8px)",
            backgroundSize: "12px 12px, 12px 12px",
          }}
        />

        <div className="relative space-y-3">
          {!hideTitle && (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 mr-2"></div>
              <h3 className="text-xs font-semibold tracking-wide uppercase text-neutral-700">
                TEE Protection
              </h3>
            </div>
          )}

          <div className="p-3 border border-neutral-300 bg-white/80">
            <p className="text-[11px] font-semibold mb-1 tracking-wide text-neutral-600 uppercase">
              Security Status
            </p>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-4 h-4 animate-spin duration-1000 ease-in-out-quart">
                  <span
                    className="ph ph-[hourglass] text-neutral-600 text-[10px]"
                    aria-hidden
                  ></span>
                </span>
                <span className="text-sm text-neutral-500">
                  Verifying trusted execution environment...
                </span>
              </div>
            ) : (
              <p className={`text-sm ${statusColor}`}>
                {attestationStatus}{" "}
                {attestationData?.status === "VERIFIED"
                  ? "Trusted execution environment"
                  : attestationData?.status === "ERROR"
                  ? "Attestation failed"
                  : "Verifying..."}
              </p>
            )}
          </div>

          <div className="p-3 border border-neutral-300 bg-white/80">
            <p className="text-[11px] font-semibold mb-2 tracking-wide text-neutral-600 uppercase">
              Session Attestation
            </p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-[11px] text-neutral-500">
                  Session ID:
                </span>
                <span className="text-[11px] font-mono text-neutral-900">
                  {displaySessionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] text-neutral-500">Started:</span>
                <span className="text-[11px] text-neutral-800">
                  {pageStartTime.substring(11, 19)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] text-neutral-500">
                  TEE Provider:
                </span>
                <span className="text-[11px] text-neutral-900">
                  {isLoading
                    ? "Loading..."
                    : attestationData?.provider || "APUS NVIDIA TEE"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 border border-neutral-300 bg-white/80">
            <p className="text-[11px] font-semibold mb-2 tracking-wide text-neutral-600 uppercase">
              Full Attestation
            </p>
            {isLoading ? (
              <div className="w-full text-[11px] text-neutral-500 bg-transparent p-2 border border-neutral-300">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-neutral-400"></div>
                  <span>Fetching attestation...</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAttestationModalOpen(true)}
                className="w-full text-[11px] font-mono text-neutral-900 bg-transparent p-2 border border-neutral-300 hover:bg-neutral-50 transition-colors break-all"
                disabled={isLoading}
              >
                {attestationData?.error
                  ? "Error - Click for details"
                  : attestationData?.attestation
                  ? attestationData.attestation.startsWith("eyJ")
                    ? `JWT: ${attestationData.attestation.substring(0, 20)}...`
                    : attestationData.attestation.length > 50
                    ? attestationData.attestation.substring(0, 50) + "..."
                    : attestationData.attestation
                  : "No attestation data"}
              </button>
            )}
          </div>

          <div className="text-center">
            <p className="text-[11px] text-neutral-600">
              Your conversation is secure
            </p>
            <div className="flex justify-center items-center mt-2 space-x-4 text-[11px] text-neutral-800">
              <span className="inline-flex items-center gap-1">
                <span className="ph ph-[shield--duotone] text-green-500"></span>
                Tamper‑proof
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="ph ph-[check--duotone] text-green-500"></span>
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAttestationModalOpen}
        onClose={() => setIsAttestationModalOpen(false)}
        title="TEE Attestation Details"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-5 w-5 border-b border-neutral-400" />
            <span className="ml-2 text-sm text-neutral-600">Loading…</span>
          </div>
        ) : attestationData?.error ? (
          <div className="space-y-3">
            <p className="text-sm text-red-700">{attestationData.error}</p>
            <div className="text-[11px] text-neutral-500">
              Timestamp: {attestationData.timestamp}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-neutral-500">Session ID</div>
                <div className="font-mono text-neutral-900 break-all">
                  {sessionId}
                </div>
              </div>
              <div>
                <div className="text-neutral-500">Provider</div>
                <div className="text-neutral-900">
                  {attestationData?.provider || "Unknown"}
                </div>
              </div>
              <div>
                <div className="text-neutral-500">Status</div>
                <div className="text-neutral-900">
                  {attestationData?.status}
                </div>
              </div>
              <div>
                <div className="text-neutral-500">Timestamp</div>
                <div className="text-neutral-900">
                  {attestationData?.timestamp}
                </div>
              </div>
            </div>
            <div>
              <div className="text-neutral-500 text-sm mb-1">
                Attestation Data
              </div>
              <pre className="whitespace-pre-wrap break-words text-[11px] p-3 border border-neutral-300 bg-neutral-50 max-h-64 overflow-auto">
                {attestationData?.attestation ||
                  "No attestation data available"}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

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

const getGuideContent = (
  platform: string,
  figureName: string
): { title: string; steps: string[] } => {
  const figureHandle = figureName.replace(/\s+/g, "");
  switch (platform) {
    case "X":
      return {
        title: `Connect with ${figureName} on X`,
        steps: [
          `Obtain an API key for this Digital Twin (e.g., @DigitalTwin${figureHandle}).`,
          "Send a Direct Message to start a conversation.",
          "The AI will respond directly in your DMs.",
        ],
      };
    case "Discord":
      return {
        title: `Connect with ${figureName} on Discord`,
        steps: [`Create a digital ${figureName}. on discord`],
      };
    case "Telegram":
      return {
        title: `Connect with ${figureName} on Telegram`,
        steps: [
          `Create a digital ${figureName}. on Telegram.`,
          "Start a chat with the bot.",
          "The AI will respond directly in your chat.",
        ],
      };
    default:
      return {
        title: "Connection Guide",
        steps: ["No guide available for this platform."],
      };
  }
};

const ConnectionModal: React.FC<{
  figureName: string;
  platform: string;
  onClose: () => void;
}> = ({ figureName, platform, onClose }) => {
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

  const { title, steps } = getGuideContent(platform, figureName);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-neutral-100 p-6 m-4 max-w-lg w-full transform transition-all duration-300 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-2xl font-bold ">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="text-slate-300 space-y-4">
          <ol className="list-decimal list-inside space-y-2">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <p className="text-sm text-slate-400 pt-2">
            Note: The exact usernames and links may vary. Please refer to the
            official project documentation for the most up-to-date information.
          </p>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600  font-semibold hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  figure,
  onBack,
  onNextTwin,
  onPrevTwin,
}) => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", text: "", author: MessageAuthor.AI },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modalPlatform, setModalPlatform] = useState<string | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hotkeyActive, setHotkeyActive] = useState<"prev" | "next" | null>(
    null
  );
  const hotkeyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const initializeChat = async () => {
      let permanentPrompt = "";

      // Fetch permanent prompt if the figure has an Arweave transaction ID
      if (figure.arweaveTxId) {
        try {
          permanentPrompt = await ArweaveService.fetchPermanentPrompt(
            figure.arweaveTxId
          );
        } catch (error) {
          console.warn("Failed to fetch permanent prompt:", error);
          // Continue with empty permanent prompt if fetch fails
        }
      }

      const session = startChatSession(figure.systemPrompt, permanentPrompt);
      setChatSession(session);
      // Show typing state first for the initial AI message, then reveal welcome text
      const welcomeId = "welcome";
      setMessages([
        {
          id: welcomeId,
          text: "",
          author: MessageAuthor.AI,
        },
      ]);
      setShouldAutoScroll(true);
      const typingTimer = window.setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === welcomeId ? { ...m, text: figure.welcomeMessage } : m
          )
        );
      }, 700);
      // Cleanup on figure change
      return () => window.clearTimeout(typingTimer);
    };

    initializeChat();
  }, [figure]);

  // Hotkeys to change twin while in chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = document.activeElement as HTMLElement | null;
      const isTypingContext =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          (target as any).isContentEditable === true ||
          target.tagName === "SELECT");
      if (isTypingContext) return;
      if (e.key === "ArrowRight") {
        onNextTwin?.();
        setHotkeyActive("next");
        if (hotkeyTimerRef.current) window.clearTimeout(hotkeyTimerRef.current);
        hotkeyTimerRef.current = window.setTimeout(
          () => setHotkeyActive(null),
          160
        );
      } else if (e.key === "ArrowLeft") {
        onPrevTwin?.();
        setHotkeyActive("prev");
        if (hotkeyTimerRef.current) window.clearTimeout(hotkeyTimerRef.current);
        hotkeyTimerRef.current = window.setTimeout(
          () => setHotkeyActive(null),
          160
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNextTwin, onPrevTwin]);

  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldAutoScroll]);

  const handleConnectClick = (platform: string) => {
    setModalPlatform(platform);
  };

  const handleCloseModal = () => {
    setModalPlatform(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chatSession) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userInput,
      author: MessageAuthor.User,
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);
    setShouldAutoScroll(true); // Enable auto-scroll when user sends a message

    const aiMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: aiMessageId, text: "", author: MessageAuthor.AI },
    ]);

    try {
      const response = await sendMessage(chatSession, userInput, figure.config);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, text: response } : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                text: "Sorry, I encountered an error. Please try again.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-[95vw] mx-auto flex flex-col xl:flex-row gap-6 animate-fade-in">
        <div className="flex w-full flex-col xl:flex-row gap-6">
          {/* Figure*/}
          <div className="flex flex-col sm:flex-row w-full max-w-full xl:flex-col xl:space-y-3 xl:max-w-96">
            <img
              src={figure.imageUrl}
              data-fallback={figure.imageUrl}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                const fallback = img.getAttribute("data-fallback");
                if (fallback && img.src !== fallback) {
                  img.src = fallback;
                  (img as any).onerror = null;
                }
              }}
              alt={figure.name}
              className="w-full sm:w-96 aspect-square object-cover border border-border xl:w-full"
            />
            <div className="flex w-full flex-col">
              <div className="border border-border bg-white p-3 w-full xl:w-auto">
                <h2 className="text-xl font-bold">{figure.name}</h2>
                <p className="text-sm text-neutral-500">{figure.title}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-neutral-500 mr-2">
                    Permanent Prompt:
                  </span>
                  <a
                    href="#"
                    className="text-xs font-mono text-neutral-400 hover:text-blue-500 underline transition-colors"
                    title={`View ${figure.name}'s permanent prompt on Arweave: ${figure.arweaveTxId}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(
                        `https://arweave.net/${figure.arweaveTxId}`,
                        "_blank"
                      );
                    }}
                  >
                    {figure.arweaveTxId.substring(0, 12)}...
                  </a>
                </div>
              </div>
              <TEEProtectionPanel
                figure={figure}
                sessionId={chatSession?.sessionId || "loading"}
              />
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="w-full h-[82vh] flex border border-border flex-col bg-white overflow-hidden">
            <div className="flex items-center p-4 border-b border-border shrink-0 w-full justify-between">
              <div className="flex items-center" />

              <div className="flex items-center gap-2">
                <button
                  onClick={onPrevTwin}
                  className={`py-2 px-3 transition cursor-pointer border border-border text-xs active:scale-95 duration-150 ease-out-quart ${
                    hotkeyActive === "prev"
                      ? "bg-neutral-200 scale-95"
                      : "hover:bg-neutral-100"
                  }`}
                  aria-label="Previous Twin (Arrow Left)"
                >
                  ◀
                </button>
                <button
                  onClick={onNextTwin}
                  className={`py-2 px-3 transition cursor-pointer border border-border text-xs active:scale-95 duration-150 ease-out-quart ${
                    hotkeyActive === "next"
                      ? "bg-neutral-200 scale-95"
                      : "hover:bg-neutral-100"
                  }`}
                  aria-label="Next Twin (Arrow Right)"
                >
                  ▶
                </button>
                <button
                  onClick={onBack}
                  className="flex gap-2 items-center py-2 px-4 hover:bg-neutral-100 transition-colors mr-3 cursor-pointer border border-border text-xs active:scale-95 duration-150 ease-out-quart"
                >
                  <BackArrowIcon />
                  Back to Home
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-3 ${
                    message.author === MessageAuthor.User
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {message.author === MessageAuthor.AI && (
                    <img
                      src={figure.imageUrl}
                      data-fallback={figure.imageUrl}
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        const fallback = img.getAttribute("data-fallback");
                        if (fallback && img.src !== fallback) {
                          img.src = fallback;
                          (img as any).onerror = null;
                        }
                      }}
                      className="w-8 h-8 self-start"
                      alt="figure avatar"
                    />
                  )}
                  <div
                    className={`relative max-w-2xl lg:max-w-3xl px-4 py-3 ${
                      message.author === MessageAuthor.User
                        ? "bg-neutral-200"
                        : "bg-blue-100"
                    }`}
                  >
                    {message.author === MessageAuthor.User ? (
                      <span
                        className="absolute w-3 h-3 -right-2 top-4 bg-neutral-200"
                        style={{
                          clipPath: "polygon(100% 50%, 0 0, 0 100%)",
                        }}
                        aria-hidden="true"
                      />
                    ) : message.text.trim() !== "" ? (
                      <span
                        className="absolute w-3 h-3 -left-2 top-4 bg-blue-100"
                        style={{
                          clipPath: "polygon(0 50%, 100% 0, 100% 100%)",
                        }}
                        aria-hidden="true"
                      />
                    ) : null}
                    <div
                      className={`${
                        message.author === MessageAuthor.User
                          ? "text-foreground"
                          : "text-blue-800"
                      } whitespace-pre-wrap text-sm`}
                      aria-live="polite"
                    >
                      {message.author === MessageAuthor.AI &&
                      message.text.trim() === "" ? (
                        <div
                          className="flex items-center gap-1 py-0.5"
                          aria-label="AI is typing"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400/70 animate-pulse"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400/70 animate-pulse [animation-delay:0.15s]"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400/70 animate-pulse [animation-delay:0.3s]"></span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm">
                          <Markdown>{message.text}</Markdown>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* Loading indicator is shown inline within the pending AI message */}
              <div ref={messagesEndRef} />
            </div>

            <MessageComposer
              value={userInput}
              onChange={setUserInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              placeholder={`Message ${figure.name}...`}
            />
          </div>
        </div>

        {/* Right Sidebar - Collapsible Panels (TEE moved under image) */}
        <div className="w-full xl:max-w-xs xl:w-88 space-y-3 self-start">
          <AccordionItem id="improve-twin" title="Improve this Digital Twin">
            <ContributionPanel figure={figure} hideTitle />
          </AccordionItem>
          {/* <AccordionItem id="connect-everywhere" title="Connect Everywhere">
            <ConnectionPanel
              figure={figure}
              onConnectClick={handleConnectClick}
              hideTitle
            />
          </AccordionItem> */}
        </div>
      </div>
      {modalPlatform && (
        <ConnectionModal
          figureName={figure.name}
          platform={modalPlatform}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default ChatInterface;
