import React, { useState, useEffect, useRef, FormEvent } from "react";
import MessageComposer from "./chat/MessageComposer";
import ContributionDetailCard from "./ContributionDetailCard";

import { Figure, ChatMessage, MessageAuthor } from "../types";
import {
  startChatSession,
  sendMessage,
  Chat,
  evaluateConversation,
  formatConversationForEvaluation,
} from "../services/apusService";
import { aoService, QueryResult } from "../services/LegacyAOService";
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

type EvaluationData = {
  score?: number;
  overall_score?: number;
  mood?: string;
  comment?: string;
  comments?: string;
  reasoning?: string;
  key_highlights?: string[];
  suggestions?: string[];
};

const isFigureAuthor = (author: MessageAuthor | string, figureName: string) =>
  author === MessageAuthor.AI || author === figureName;

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
  const [lastReference, setLastReference] = useState<string | null>(null);

  // Query result modal state
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [attestationData, setAttestationData] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  // Helper function to extract evaluation result
  const getEvaluationResult = (result: QueryResult) => {
    return result?.data?.evaluation || result?.data?.result;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("");
    }
  };

  const handleQueryResult = async () => {
    if (!lastReference) {
      alert("No submission found to query.");
      return;
    }

    try {
      const result = await aoService.queryTaskResult(
        figure.processId,
        lastReference
      );

      if (!result.success) {
        alert(`Error: ${result.error || "Failed to query task result"}`);
        return;
      }

      // Store the query result
      setQueryResult(result);

      // If evaluation is complete with proper data, show ContributionDetailCard
      if (result.status === "done") {
        const evaluationResult = getEvaluationResult(result);

        if (
          evaluationResult &&
          evaluationResult.score &&
          evaluationResult.reasoning
        ) {
          // Fetch TEE attestation and wallet address in parallel
          const attestationPromise = TEEService.getAttestation(lastReference);
          const walletPromise = aoService.getWalletAddress();

          // Show ContributionDetailCard
          setIsResultModalOpen(true);

          // Update TEE status and wallet when ready
          try {
            const [attestationResult, walletAddr] = await Promise.all([
              attestationPromise,
              walletPromise,
            ]);
            setAttestationData(attestationResult);
            setWalletAddress(walletAddr || "");
          } catch (error) {
            console.error("Failed to fetch attestation or wallet data:", error);
            const errorData = { error: "Failed to fetch attestation data" };
            setAttestationData(errorData);
          }

          return;
        }
      }

      // For all other cases (pending, processing, incomplete evaluation), show modal
      setIsResultModalOpen(true);
    } catch (error) {
      console.error("Error querying task result:", error);
      alert("Failed to query task result. See console for details.");
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
        setLastReference(result.reference || null);
        setLastMessageId(result.messageId || null);
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
              disabled={
                (!promptSuggestion.trim() && !fileName) ||
                isSubmitting ||
                !figure.processId
              }
            >
              {isSubmitting ? "Submitting to AO..." : "Submit for AI Review"}
            </button>
            <p className="text-[11px] text-neutral-600 text-center">
              {!figure.processId ? (
                <span className="inline-flex items-center gap-1 text-red-600">
                  <span className="ph ph-[warning]"></span>This figure is not
                  available for contributions yet
                </span>
              ) : !aoService.isWalletConnected() ? (
                <span className="inline-flex items-center gap-1">
                  <span className="ph ph-[warning]"></span>Connect your Arweave
                  wallet to submit contributions
                </span>
              ) : (
                "AI agents will evaluate and integrate approved improvements into the permanent Arweave-stored digital twin"
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
        <div className="flex justify-end gap-2">
          {submitStatus === "success" && (
            <button
              onClick={handleQueryResult}
              className="px-4 py-2 border text-sm active:scale-95 transition border-blue-600 text-blue-700 bg-white hover:bg-blue-50"
            >
              Query Result
            </button>
          )}
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

      {/* ContributionDetailCard for complete evaluation results */}
      {queryResult &&
        queryResult.status === "done" &&
        getEvaluationResult(queryResult) &&
        getEvaluationResult(queryResult)?.score &&
        getEvaluationResult(queryResult)?.reasoning && (
          <ContributionDetailCard
            isOpen={isResultModalOpen}
            onClose={() => setIsResultModalOpen(false)}
            title="Evaluation Result"
            data={{
              figureName: figure.name,
              date: new Date().toLocaleDateString(),
              aiScore: getEvaluationResult(queryResult)?.score,
              aoMessageId: lastMessageId || "",
              reasoning: getEvaluationResult(queryResult)?.reasoning,
              walletAddress: walletAddress,
              attestation: attestationData?.attestation,
              teeStatus: attestationData?.error
                ? "failed"
                : attestationData?.attestation
                ? "verified"
                : "verifying",
            }}
            mode="evaluation"
          />
        )}

      {/* Fallback modal for pending/error states or incomplete evaluation data */}
      {queryResult &&
        (queryResult.status !== "done" ||
          (queryResult.status === "done" &&
            (!getEvaluationResult(queryResult) ||
              !getEvaluationResult(queryResult)?.score ||
              !getEvaluationResult(queryResult)?.reasoning))) && (
          <Modal
            isOpen={isResultModalOpen}
            onClose={() => setIsResultModalOpen(false)}
            title="Evaluation Status"
          >
            {queryResult.status === "pending" && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-neutral-600">Evaluation in progress...</p>
                <p className="text-sm text-neutral-500 mt-2">
                  The AI agent is currently processing your submission.
                </p>
              </div>
            )}

            {queryResult.status === "processing" && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-neutral-600">Evaluation in progress...</p>
                <p className="text-sm text-neutral-500 mt-2">
                  The AI agent is currently processing your submission.
                </p>
              </div>
            )}

            {queryResult.status === "done" &&
              !getEvaluationResult(queryResult) && (
                <div className="space-y-4">
                  <p className="text-neutral-600">
                    Evaluation completed but results could not be parsed.
                  </p>
                  <div>
                    <span className="text-sm font-medium">Raw Data:</span>
                    <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(queryResult.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

            {queryResult.error && (
              <div>
                <span className="text-sm font-medium text-red-600">Error:</span>
                <div className="mt-1 p-2 bg-red-50 rounded text-sm text-red-800">
                  {queryResult.error}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsResultModalOpen(false)}
                className="px-4 py-2 border border-neutral-300 text-neutral-800 bg-white hover:bg-neutral-50 text-sm active:scale-95 transition"
              >
                Close
              </button>
            </div>
          </Modal>
        )}
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
      <div className="w-full relative border-b border-l border-r border-neutral-300 bg-white p-4 self-start text-neutral-900">
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

const ScoreCardModal: React.FC<{
  figure: Figure;
  messages: ChatMessage[];
  attestationData: any;
  isOpen: boolean;
  onClose: () => void;
}> = ({ figure, messages, attestationData, isOpen, onClose }) => {
  const scoreCardRef = useRef<HTMLDivElement>(null);
  const aspectRef = useRef<HTMLDivElement>(null);
  const blurUnderlayRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(
    null
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const shareSoundRef = useRef<HTMLAudioElement | null>(null);
  const [showFinal, setShowFinal] = useState(false);

  const isFigureMessage = (author: MessageAuthor | string) =>
    isFigureAuthor(author, figure.name);

  useEffect(() => {
    const shareAudio = new Audio("/resources/sounds/share.wav");
    shareAudio.preload = "auto";
    shareSoundRef.current = shareAudio;
  }, []);

  // Evaluate conversation when modal opens
  useEffect(() => {
    if (isOpen && messages.length > 1 && !evaluationData && !isEvaluating) {
      const runEvaluation = async () => {
        setIsEvaluating(true);
        setEvaluationError(null);

        try {
          // Only include user messages for evaluation
          // We're evaluating how the user engaged, not the AI responses
          const userMessages = messages
            .filter((msg) => msg.author === MessageAuthor.User) // Only user messages
            .filter((msg) => msg.text.trim() !== "") // Filter out empty messages
            .map((msg) => msg.text);

          const conversationData = userMessages.join('\n\n');
          const characterName = figure.name;

          const result = await evaluateConversation(
            characterName,
            conversationData
          );

          setEvaluationData(result);
        } catch (error) {
          console.error("Failed to evaluate conversation:", error);
          setEvaluationError(
            error instanceof Error ? error.message : "Evaluation failed"
          );
        } finally {
          setIsEvaluating(false);
        }
      };

      runEvaluation();
    }
  }, [isOpen, messages, figure, evaluationData, isEvaluating]);

  // Reset transition state and evaluation when modal opens (force re-evaluation on each open)
  useEffect(() => {
    if (isOpen) {
      setShowFinal(false);
      setEvaluationData(null);
      setEvaluationError(null);
    }
  }, [isOpen]);

  // When evaluation completes, trigger crossfade to final visuals
  useEffect(() => {
    if (isOpen && !isEvaluating) {
      const id = window.setTimeout(() => setShowFinal(true), 50);
      return () => window.clearTimeout(id);
    }
  }, [isOpen, isEvaluating]);

  const playShareSound = () => {
    const audio = shareSoundRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      void audio.play();
    } catch (_) {
      // Ignore playback errors
    }
  };

  // Generate mock conversation highlights
  const stripMarkdown = (input: string): string => {
    let output = input || "";
    // remove code fences
    output = output.replace(/```[\s\S]*?```/g, "");
    // remove inline code
    output = output.replace(/`[^`]*`/g, "");
    // remove images ![alt](url)
    output = output.replace(/!\[[^\]]*\]\([^\)]*\)/g, "");
    // remove links [text](url)
    output = output.replace(/\[([^\]]*)\]\([^\)]*\)/g, "$1");
    // remove bold/italic markers
    output = output.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1");
    // collapse whitespace
    output = output.replace(/\s+/g, " ").trim();
    return output;
  };

  const pickFirstSentence = (text: string): string => {
    const normalized = (text || "").replace(/\s+/g, " ").trim();
    if (!normalized) return "";
    const match = normalized.match(/^[\s\S]*?[.!?](?=\s|$)/);
    return match ? match[0].trim() : normalized;
  };

  const ellipsize = (text: string, maxLen = 160): string => {
    if (!text) return "";
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen - 1).trimEnd() + "…";
  };

  const getConversationHighlights = () => {
    const userMessages = messages.filter(
      (m) => m.author === MessageAuthor.User
    );
    const aiMessages = messages.filter(
      (m) => isFigureMessage(m.author) && m.text.trim() !== ""
    );

    // Use evaluation data if available, otherwise fallback to mock data
    if (evaluationData) {
      const overallScore =
        evaluationData.score ?? evaluationData.overall_score ?? 75;
      const mood =
        evaluationData.mood ||
        (overallScore >= 85 ? "Happy" : overallScore >= 70 ? "Sad" : "Angry");
      const quoteSource =
        evaluationData.comments ??
        `${figure.name} found this conversation engaging.`;

      return {
        messageCount: messages.length - 1, // Exclude welcome message
        userMessages: userMessages.length,
        aiMessages: aiMessages.length,
        conversationDuration: Math.max(5, Math.floor(Math.random() * 30) + 10), // Mock duration in minutes
        mood,
        rating: overallScore,
        quote: ellipsize(quoteSource, 210),
      };
    }

    // Fallback to mock data if evaluation is not available yet
    const mood = getRandomMood();
    const rating = Math.floor(60 + Math.random() * 41); // 60–100 mock
    const judgement = getMockJudgement(figure.name, rating, mood);

    return {
      messageCount: messages.length - 1, // Exclude welcome message
      userMessages: userMessages.length,
      aiMessages: aiMessages.length,
      conversationDuration: Math.max(5, Math.floor(Math.random() * 30) + 10), // Mock duration in minutes
      mood,
      rating,
      quote: judgement,
    };
  };

  const getRandomMood = () => {
    const moods = ["Happy", "Sad", "Angry"];
    return moods[Math.floor(Math.random() * moods.length)];
  };
  const getMoodColorClass = (mood: string) => {
    switch (mood) {
      case "Happy":
        return "text-emerald-400";
      case "Sad":
        return "text-blue-300";
      case "Angry":
        return "text-red-400";
      default:
        return "text-foreground";
    }
  };

  const getMoodIconClass = (mood: string) => {
    switch (mood) {
      case "Happy":
        return "ph ph-[smiley--duotone]";
      case "Sad":
        return "ph ph-[smiley-sad--duotone]";
      case "Angry":
        return "ph ph-[smiley-angry--duotone]";
      default:
        return "ph ph-[star--duotone]";
    }
  };

  const getMoodImage = (mood: string) => {
    // Get the figure name to determine the correct mood folder
    const figureName = figure.name.toLowerCase().replace(/\s+/g, "");
    let moodFolder = "Rand"; // Default fallback

    // Map figure names to their corresponding mood folders
    if (figureName.includes("obama")) {
      moodFolder = "Obama";
    } else if (figureName.includes("orwell")) {
      moodFolder = "Orwell";
    } else if (figureName.includes("trump")) {
      moodFolder = "Trump";
    } else if (figureName.includes("rand")) {
      moodFolder = "Rand";
    }

    switch (mood) {
      case "Happy":
        // Trump uses "smile" instead of "happy"
        const happyFileName =
          moodFolder === "Trump"
            ? "trump_smile.webp"
            : `${moodFolder.toLowerCase()}_happy.webp`;
        return `/resources/moods/${moodFolder}/${happyFileName}`;
      case "Sad":
        return `/resources/moods/${moodFolder}/${moodFolder.toLowerCase()}_sad.webp`;
      case "Angry":
        return `/resources/moods/${moodFolder}/${moodFolder.toLowerCase()}_angry.webp`;
      default:
        return "";
    }
  };

  const getMockJudgement = (name: string, rating: number, mood: string) => {
    const templates = [
      `${name} found your conversation ${
        rating >= 85
          ? "insightful and engaging"
          : rating >= 70
          ? "balanced and constructive"
          : "a bit uneven, but promising"
      }`,
      `${
        rating >= 85
          ? "Strong signal"
          : rating >= 70
          ? "Solid effort"
          : "Needs polish"
      }—clear ideas and a ${mood.toLowerCase()} tone.`,
      `Overall, ${name} rates this exchange ${rating}/100 and ${
        rating >= 85
          ? "would continue the thread"
          : rating >= 70
          ? "sees room to go deeper"
          : "suggests refining your prompts"
      }.`,
    ];
    const first = templates[Math.floor(Math.random() * templates.length)];
    const second =
      rating >= 85
        ? "Great flow and clarity."
        : rating >= 70
        ? "Good direction; a few details could be sharper."
        : "Try focusing the next question more narrowly.";
    const includeSecond = Math.random() > 0.5;
    const result = includeSecond ? `${first} ${second}` : first;
    return ellipsize(result, 210);
  };

  const handleSaveScoreCard = async () => {
    if (!scoreCardRef.current) return;
    if (isEvaluating) return; // Do not allow saving while evaluation is in progress

    // Play share sound on click
    playShareSound();

    setIsSaving(true);
    setSaveError(null);

    const errors: string[] = [];

    const downloadBlob = (blob: Blob, fileName: string) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const dataUrlToBlob = async (dataUrl: string) => {
      const res = await fetch(dataUrl);
      return await res.blob();
    };

    const fileName = `${figure.name.replace(/\s+/g, "_")}_ScoreCard_${
      new Date().toISOString().split("T")[0]
    }.png`;

    // Strategy A: html2canvas
    const attemptHtml2Canvas = async () => {
      const html2canvas = await import("html2canvas").then((m) => m.default);

      // Ensure explicit pixel height for the 16:9 box (avoid zero-height capture)
      let previousAspectHeight = "";
      if (aspectRef.current) {
        previousAspectHeight = aspectRef.current.style.height;
        const width =
          aspectRef.current.clientWidth || scoreCardRef.current!.clientWidth;
        if (width) {
          aspectRef.current.style.height = `${Math.round((width * 9) / 16)}px`;
        }
      }
      // Temporarily disable effects that html2canvas struggles with
      const previousUnderlayDisplay =
        blurUnderlayRef.current?.style.display || "";
      const previousBackdropFilter =
        rightPanelRef.current?.style.backdropFilter || "";
      const previousBg = rightPanelRef.current?.style.backgroundColor || "";
      if (blurUnderlayRef.current)
        blurUnderlayRef.current.style.display = "none";
      if (rightPanelRef.current) {
        rightPanelRef.current.style.backdropFilter = "none";
        rightPanelRef.current.style.backgroundColor = "rgba(255,255,255,0.95)";
      }

      try {
        const canvasElement = await html2canvas(scoreCardRef.current!, {
          backgroundColor: "#ffffff",
          scale: Math.max(2, Math.ceil(window.devicePixelRatio || 1)),
          useCORS: true,
          allowTaint: false,
          logging: false,
          imageTimeout: 0,
          removeContainer: true,
        });

        const blob: Blob | null = await new Promise((resolve) =>
          canvasElement.toBlob((b) => resolve(b), "image/png")
        );

        if (blob) {
          downloadBlob(blob, fileName);
          return true;
        } else {
          // Fallback to data URL path
          const dataUrl = canvasElement.toDataURL("image/png");
          const blobFromDataUrl = await dataUrlToBlob(dataUrl);
          downloadBlob(blobFromDataUrl, fileName);
          return true;
        }
      } finally {
        // Restore styles
        if (blurUnderlayRef.current)
          blurUnderlayRef.current.style.display = previousUnderlayDisplay;
        if (rightPanelRef.current) {
          rightPanelRef.current.style.backdropFilter = previousBackdropFilter;
          rightPanelRef.current.style.backgroundColor = previousBg;
        }
        if (aspectRef.current) {
          aspectRef.current.style.height = previousAspectHeight;
        }
      }
    };

    // Strategy B: html-to-image (foreignObject based)
    const attemptHtmlToImage = async () => {
      const { toPng } = await import("html-to-image");

      const filter = (node: HTMLElement) => {
        // Skip elements likely to cause tainting or rendering issues
        if (node instanceof HTMLImageElement) {
          try {
            const srcUrl = new URL(node.src, window.location.href);
            if (srcUrl.origin !== window.location.origin) return false;
          } catch {}
        }
        if (node.dataset && node.dataset.captureIgnore === "true") return false;
        // Exclude elements using backdrop-filter
        if (node.nodeType === 1) {
          const el = node as Element;
          const style = window.getComputedStyle(el);
          if (style.backdropFilter && style.backdropFilter !== "none")
            return false;
        }
        return true;
      };

      const width = scoreCardRef.current!.clientWidth;
      const height = scoreCardRef.current!.clientHeight;
      const pixelRatio = Math.max(2, Math.ceil(window.devicePixelRatio || 1));

      const dataUrl = await toPng(scoreCardRef.current!, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio,
        width,
        height,
        filter: filter as any,
      });

      const blob = await dataUrlToBlob(dataUrl);
      downloadBlob(blob, fileName);
      return true;
    };

    try {
      const okA = await attemptHtml2Canvas().catch((err) => {
        errors.push(`html2canvas failed: ${err?.message || String(err)}`);
        return false;
      });
      if (okA) return;

      const okB = await attemptHtmlToImage().catch((err) => {
        errors.push(`html-to-image failed: ${err?.message || String(err)}`);
        return false;
      });
      if (okB) return;

      const errorText = errors.join("\n");
      console.error("Failed to save score card:", errorText);
      setSaveError(
        `${errorText}\n\nTips: If the twin image is remote without CORS, remove it or host locally. Avoid CSS filters/backdrop-filter on captured nodes.`
      );
      alert("Failed to save score card. See details in the modal.");
    } finally {
      setIsSaving(false);
    }
  };

  const highlights = getConversationHighlights();
  const sessionId = attestationData?.sessionId || "loading...";
  const displaySessionId =
    sessionId.length > 16 ? sessionId.substring(0, 16) + "..." : sessionId;
  const pairLabel = `${figure.name.split(" ")[0].toUpperCase()}/MOOD`;
  const headlinePercent = (() => {
    const total = Math.max(0, highlights.messageCount);
    return `+${total.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}%`;
  })();
  const saveDisabled = isSaving || isEvaluating;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="score-card-title"
    >
      <div
        className="relative bg-white p-2 sm:p-6 m-2 sm:m-4 max-w-5xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slide-up border border-neutral-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#000 0px,#000 1px,transparent 1px,transparent 8px),repeating-linear-gradient(-45deg,#000 0px,#000 1px,transparent 1px,transparent 8px)",
            backgroundSize: "12px 12px, 12px 12px",
          }}
        />
        <div className="relative">
          <div className="flex justify-between items-center mb-2 sm:mb-6">
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 transition-colors"
              aria-label="Close score card"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Score Card Content - 16:9 split layout */}
          <div
            ref={scoreCardRef}
            className="relative w-full border border-neutral-300 bg-white"
          >
            <div
              ref={aspectRef}
              className="aspect-[16/9] relative flex overflow-hidden"
            >
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white/100 to-transparent group-hover:opacity-50 transition-opacity duration-1000 ease-out-circ h-96 pointer-events-none z-20"></div>
              {/* TEE badge */}
              <div className="absolute bottom-0 right-0 p-1 sm:p-4 z-30">
                <div
                  className={`sm:px-2 sm:py-1.5 px-1 py-1 border bg-white/80 text-[11px] ${
                    attestationData?.status === "VERIFIED"
                      ? "border-green-600 text-green-700"
                      : attestationData?.error
                      ? "border-red-600 text-red-700"
                      : "border-yellow-600 text-yellow-700"
                  }`}
                  title={displaySessionId}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className="ph ph-[shield-check--duotone]"
                      aria-hidden
                    ></span>
                    <span className="text-[6px] sm:text-xs">
                      {attestationData?.status === "VERIFIED"
                        ? "TEE Verified"
                        : attestationData?.error
                        ? "TEE Error"
                        : "TEE Verifying"}
                    </span>
                  </div>
                </div>
              </div>
              {/* Background stripes overlay clipped to right diagonal half */}
              <div
                className="pointer-events-none absolute inset-0 z-0 opacity-50"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 8px)",
                  backgroundSize: "10px 10px",
                  clipPath: "polygon(65% 0%, 100% 0%, 100% 100%, 20% 100%)",
                  WebkitClipPath:
                    "polygon(65% 0%, 100% 0%, 100% 100%, 20% 100%)",
                }}
              />
              {/* Left visual area (image) */}
              <div className="relative inset-0 flex-1 overflow-hidden">
                {/* Evaluating image */}
                <img
                  crossOrigin="anonymous"
                  src={figure.imageUrl}
                  alt={figure.name}
                  className={`absolute inset-0 w-full h-full object-cover lg:object-left transition-opacity duration-1000 z-10 ${
                    showFinal ? "opacity-0" : "opacity-100"
                  }`}
                />
                {/* Final mood image */}
                <img
                  crossOrigin="anonymous"
                  src={getMoodImage(highlights.mood) || figure.imageUrl}
                  alt={figure.name}
                  className={`absolute inset-0 w-full h-full object-cover lg:object-left transition-opacity duration-1000 z-10 ${
                    showFinal ? "opacity-100" : "opacity-0"
                  }`}
                />
                {!showFinal && (
                  <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-60 transform -skew-x-12 animate-shimmer"></div>
                  </div>
                )}

                {/* Info on name and title */}
                <div className="absolute bottom-0 right-0 inset-x-0 p-2 sm:p-4 z-30">
                  <div className="text-xs sm:text-lg md:text-xl font-black tracking-wide uppercase">
                    {figure.name}
                  </div>
                  <div className="text-[9px] sm:text-xs md:text-sm opacity-90">
                    {figure.title}
                  </div>
                </div>

                {/* Bottom-right Twin logo */}
                <div className="absolute top-0 p-2 sm:p-4 z-30">
                  <img
                    src="/resources/Twin_Logo.svg"
                    alt="Twin"
                    className="w-12 sm:w-24"
                  />
                </div>
              </div>

              {/* Floating light right panel */}
              <div
                ref={rightPanelRef}
                className="inset-y-0 right-0 w-[50%] sm:w-[40%] max-w-[520px] p-4 md:p-7 flex flex-col overflow-hidden relative z-30"
              >
                {/* (badge moved to absolute top-right) */}
                {/* Rating */}
                <div className="relative min-h-[40px] sm:min-h-[80px]">
                  {/* Evaluating state */}
                  <div
                    className={`absolute inset-0 flex items-center gap-2 text-[0.9rem] sm:text-3xl md:text-4xl mt-1 sm:mt-4 tabular-nums text-neutral-400 transition-opacity duration-500 ${
                      showFinal
                        ? "opacity-0 pointer-events-none"
                        : "opacity-100"
                    }`}
                  >
                    <span className="w-4 h-4 ph ph-[hourglass--duotone] animate-spin"></span>
                    Evaluating...
                  </div>
                  {/* Final state (rating or error) */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      showFinal
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    {evaluationError ? (
                      <div className="flex items-center gap-2 text-[0.9rem] sm:text-3xl md:text-4xl mt-1 sm:mt-4 tabular-nums text-red-400">
                        <span className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 ph ph-[warning--duotone]"></span>
                        Error
                      </div>
                    ) : (
                      <div
                        className={`flex items-center gap-2 text-[1.0rem] sm:text-5xl lg:text-6xl mt-1 sm:mt-4 tabular-nums ${getMoodColorClass(
                          highlights.mood
                        )}`}
                      >
                        <span
                          className={`w-6 h-6 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 ${getMoodIconClass(
                            highlights.mood
                          )}`}
                        ></span>
                        {highlights.rating}/100
                      </div>
                    )}
                  </div>
                </div>

                {/* Hero mood/engagement area */}
                <div className="relative min-h-[72px]">
                  {/* Evaluating message */}
                  <div
                    className={`absolute inset-0 text-[0.9rem] sm:text-xl md:text-2xl font-quote leading-tight z-20 mt-1 sm:mt-8 text-neutral-400 transition-opacity duration-500 ${
                      showFinal
                        ? "opacity-0 pointer-events-none"
                        : "opacity-100"
                    }`}
                  >
                    "Analyzing conversation quality..."
                  </div>
                  {/* Final quote or error */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      showFinal
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    {evaluationError ? (
                      <div className="text-[0.9rem] sm:text-xl md:text-2xl font-quote leading-tight z-20 mt-1 sm:mt-8 text-red-400">
                        "Unable to evaluate conversation"
                      </div>
                    ) : (
                      <div
                        className={`text-[0.9rem] sm:text-2xl lg:text-3xl font-quote leading-tight z-20 mt-1 sm:mt-8 ${getMoodColorClass(
                          highlights.mood
                        )}`}
                      >
                        "{highlights.quote}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error details (if any) */}
        {saveError && (
          <div className="mt-1 sm:mt-3 p-3 border border-red-300 bg-red-50 text-red-800 text-sm break-words">
            <div className="font-semibold mb-1">Export error details</div>
            <pre className="whitespace-pre-wrap text-[12px] leading-snug">
              {saveError}
            </pre>
            <div className="mt-1 sm:mt-2 text-right">
              <button
                onClick={() => {
                  if (saveError) navigator.clipboard.writeText(saveError);
                }}
                className="px-3 py-1 border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 text-xs"
              >
                Copy details
              </button>
            </div>
          </div>
        )}

        {/* Evaluation error details (if any) */}
        {evaluationError && (
          <div className="mt-1 sm:mt-3 p-3 border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm break-words">
            <div className="font-semibold mb-1">Evaluation error</div>
            <p className="text-sm leading-snug">{evaluationError}</p>
            <p className="text-xs mt-2 opacity-75">
              The score card is showing mock data due to evaluation failure.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-1 sm:mt-6 relative">
          <button
            onClick={onClose}
            className="sm:px-4 sm:py-2 px-2 py-1 border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 transition-colors text-xs sm:text-sm"
          >
            Close
          </button>
          <button
            onClick={handleSaveScoreCard}
            disabled={saveDisabled}
            title={
              isEvaluating ? "Please wait for evaluation to finish" : undefined
            }
            className={`relative flex gap-2 items-center py-2 px-4 text-[10px] sm:text-xs md:text-sm overflow-hidden
              ${
                saveDisabled
                  ? "border border-neutral-300 bg-neutral-200 text-neutral-500 cursor-not-allowed"
                  : "border border-amber-300 bg-amber-100 text-neutral-800 hover:bg-neutral-50 active:scale-95 cursor-pointer transition-colors"
              }
            `}
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              <div
                className={`ph ph-[star--duotone] ${
                  saveDisabled ? "text-neutral-400" : "text-amber-400"
                }`}
              />
              {isSaving
                ? "Saving…"
                : isEvaluating
                ? "Evaluating…"
                : "Save Your Score Card"}
            </span>
            {!saveDisabled && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-20 transform -skew-x-12 -translate-x-full animate-shimmer"></div>
            )}
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
    { id: "welcome", text: "", author: figure.name },
  ]);

  const isFigureMessage = (author: MessageAuthor | string) =>
    isFigureAuthor(author, figure.name);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modalPlatform, setModalPlatform] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [hotkeyActive, setHotkeyActive] = useState<"prev" | "next" | null>(
    null
  );
  const hotkeyTimerRef = useRef<number | null>(null);
  const [isScoreCardOpen, setIsScoreCardOpen] = useState(false);
  const [attestationData, setAttestationData] = useState<any>(null);
  const [shareHintVisible, setShareHintVisible] = useState(false);
  const sendSoundRef = useRef<HTMLAudioElement | null>(null);
  const receiveSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Preload send/receive sounds
    const sendAudio = new Audio("/resources/sounds/message-send.wav");
    const receiveAudio = new Audio("/resources/sounds/message-receive.wav");
    sendAudio.preload = "auto";
    receiveAudio.preload = "auto";
    sendSoundRef.current = sendAudio;
    receiveSoundRef.current = receiveAudio;
  }, []);

  const playSound = (
    audioRef: React.MutableRefObject<HTMLAudioElement | null>
  ) => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      void audio.play();
    } catch (_) {
      // Ignore playback errors (e.g., autoplay restrictions)
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      let permanentPrompt = "";

      // Fetch permanent prompt if the figure has an Arweave transaction ID
      // if (figure.arweaveTxId) {
      //   try {
      //     permanentPrompt = await ArweaveService.fetchPermanentPrompt(
      //       figure.arweaveTxId
      //     );
      //   } catch (error) {
      //     console.warn("Failed to fetch permanent prompt:", error);
      //     // Continue with empty permanent prompt if fetch fails
      //   }
      // }

      const session = startChatSession(figure.systemPrompt, permanentPrompt);
      setChatSession(session);
      // Show typing state first for the initial AI message, then reveal welcome text
      const welcomeId = "welcome";
      setMessages([
        {
          id: welcomeId,
          text: "",
          author: figure.name,
        },
      ]);
      const typingTimer = window.setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === welcomeId ? { ...m, text: figure.welcomeMessage } : m
          )
        );
        // Play receive sound when the first figure message (welcome) completes
        playSound(receiveSoundRef);
      }, 700);
      // Cleanup on figure change
      return () => window.clearTimeout(typingTimer);
    };

    initializeChat();
  }, [figure]);

  // Fetch TEE attestation data for score card
  useEffect(() => {
    const fetchAttestation = async () => {
      if (chatSession?.sessionId) {
        try {
          const attestation = await TEEService.getAttestation(
            chatSession.sessionId
          );
          setAttestationData(attestation);
        } catch (error) {
          console.error(
            "Failed to fetch TEE attestation for score card:",
            error
          );
          setAttestationData({ error: "Failed to fetch attestation" });
        }
      }
    };

    fetchAttestation();
  }, [chatSession?.sessionId]);

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
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

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
    // Play send sound when the user submits a message
    playSound(sendSoundRef);
    setUserInput("");
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: aiMessageId, text: "", author: figure.name },
    ]);

    try {
      const response = await sendMessage(chatSession, userInput, figure.config);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, text: response } : msg
        )
      );
      // Play receive sound when the AI's message is finalized
      playSound(receiveSoundRef);
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
      // Still play receive sound on error to indicate response completion
      playSound(receiveSoundRef);
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
              className="w-full sm:w-96 aspect-square object-cover border-t border-l border-b xl:border border-border xl:w-full bg-white"
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
                    title={`View ${figure.name}'s permanent prompt on Load network: ${figure.arweaveTxId}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(
                        `https://load-s3-agent.load.network/${figure.arweaveTxId}`,
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
                  className={`hidden sm:flex py-2 px-3 transition cursor-pointer border border-border text-[10px] sm:text-xs md:text-sm active:scale-95 duration-150 ease-out-quart ${
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
                  className={`hidden sm:flex py-2 px-3 transition cursor-pointer border border-border text-[10px] sm:text-xs md:text-sm active:scale-95 duration-150 ease-out-quart ${
                    hotkeyActive === "next"
                      ? "bg-neutral-200 scale-95"
                      : "hover:bg-neutral-100"
                  }`}
                  aria-label="Next Twin (Arrow Right)"
                >
                  ▶
                </button>
                {/* Share Score Card (disabled until at least 1 user message) */}
                {(() => {
                  const userMessageCount = messages.filter(
                    (m) => m.author === MessageAuthor.User
                  ).length;
                  //const canShare = userMessageCount >= 1;
                  const canShare = userMessageCount >= 1;
                  const showHint = () => {
                    setShareHintVisible(true);
                    window.setTimeout(() => setShareHintVisible(false), 2200);
                  };
                  return (
                    <div className="relative">
                      <button
                        onClick={() => canShare && setIsScoreCardOpen(true)}
                        disabled={!canShare}
                        aria-disabled={!canShare}
                        title={
                          canShare
                            ? "Share your score card"
                            : `Send at least 1 message with ${figure.name} to share your score card`
                        }
                        className={`relative flex gap-2 items-center py-2 px-4 border text-neutral-800 transition-colors text-[10px] sm:text-xs md:text-sm overflow-hidden active:scale-95 ${
                          canShare
                            ? "cursor-pointer border-amber-300 bg-amber-100 hover:bg-neutral-50"
                            : "cursor-not-allowed border-neutral-300 bg-neutral-100 opacity-70"
                        }`}
                      >
                        <span className="relative z-10 inline-flex items-center gap-2">
                          <div
                            className={`ph ph-[star--duotone] ${
                              canShare ? "text-amber-400" : "text-neutral-400"
                            }`}
                          />
                          Share Your Score Card
                        </span>
                        {canShare && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-20 transform -skew-x-12 -translate-x-full animate-shimmer"></div>
                        )}
                      </button>
                      {!canShare && (
                        <button
                          type="button"
                          onClick={showHint}
                          aria-label="Share score card disabled overlay"
                          className="absolute inset-0 bg-transparent"
                        />
                      )}
                      {!canShare && shareHintVisible && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs bg-white border border-neutral-300 shadow z-50 whitespace-nowrap">
                          Please send at least 1 message with {figure.name}.
                        </div>
                      )}
                    </div>
                  );
                })()}
                <button
                  onClick={onBack}
                  className="flex gap-2 items-center py-2 px-4 hover:bg-neutral-100 transition-colors mr-3 cursor-pointer border border-border text-[10px] sm:text-xs md:text-sm active:scale-95 duration-150 ease-out-quart"
                >
                  <BackArrowIcon />
                  Back to Home
                </button>
              </div>
            </div>

            <div
              className="flex-1 p-6 overflow-y-auto space-y-6"
              ref={messagesContainerRef}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-3 ${
                    message.author === MessageAuthor.User
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {isFigureMessage(message.author) && (
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
                      } whitespace-pre-wrap text-[13px] sm:text-sm md:text-base`}
                      aria-live="polite"
                    >
                      {isFigureMessage(message.author) &&
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
                        <p className="whitespace-pre-wrap text-[13px] sm:text-sm md:text-base">
                          <Markdown>{message.text}</Markdown>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
      <ScoreCardModal
        key={figure.id}
        figure={figure}
        messages={messages}
        attestationData={attestationData}
        isOpen={isScoreCardOpen}
        onClose={() => setIsScoreCardOpen(false)}
      />
    </>
  );
};

export default ChatInterface;
