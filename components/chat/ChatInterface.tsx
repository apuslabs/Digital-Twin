import React, {
  useState,
  useEffect,
  useRef,
  FormEvent,
  useCallback,
} from "react";
import MessageComposer from "./MessageComposer";
import ContributionDetailCard from "./ContributionDetailCard";
import * as Drawer from "vaul";

import {
  Figure,
  ChatMessage,
  MessageAuthor,
  ShareCategory,
  CATEGORY_METADATA,
} from "../../types";
import {
  startChatSession,
  sendMessageStream,
  Chat,
  evaluateConversation,
} from "../../services/apusService";
import { aoService, QueryResult } from "../../services/LegacyAOService";
import TEEService from "../../services/teeService";
import Markdown from "react-markdown";
import Modal from "../common/Modal";
import {
  BackArrowIcon,
  SendIcon,
  UsersIcon,
  FileUploadIcon,
  ChevronIcon,
  XIcon,
  DiscordIcon,
  TelegramIcon,
  CloseIcon,
} from "./icons";
import { AccordionItem } from "../common/AccordionItem";
import { ContributionPanel } from "./panels/ContributionPanel";
import { ConnectionPanel } from "./panels/ConnectionPanel";
import {
  trackChatPerCharacter,
  trackPromptSubmissionWithReward,
  trackShareButtonClick,
  trackShareAction,
} from "../../services/analytics";

import dreamVideoUrl from "../../resources/videos/Main_Web-banner-alt.mp4?url";

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

  const displaySessionId = sessionId;
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

const OutOfContextCardModal: React.FC<{
  figure: Figure;
  messages: ChatMessage[];
  attestationData: any;
  isOpen: boolean;
  onClose: () => void;
}> = ({ figure, messages, attestationData, isOpen, onClose }) => {
  const outOfContextCardRef = useRef<HTMLDivElement>(null);
  const aspectRef = useRef<HTMLDivElement>(null);
  const blurUnderlayRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const contextInputRef = useRef<HTMLTextAreaElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(
    null
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const shareSoundRef = useRef<HTMLAudioElement | null>(null);
  const [showFinal, setShowFinal] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ShareCategory | null>(null);
  const [contextInput, setContextInput] = useState<string>("");

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

          const conversationData = userMessages.join("\n\n");
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
      setSelectedCategory(null);
      setContextInput("");
    }
  }, [isOpen]);

  // When evaluation completes, trigger crossfade to final visuals
  useEffect(() => {
    if (isOpen && !isEvaluating) {
      const id = window.setTimeout(() => setShowFinal(true), 50);
      return () => window.clearTimeout(id);
    }
  }, [isOpen, isEvaluating]);

  // Auto-resize textarea when content changes
  useEffect(() => {
    const textarea = contextInputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [contextInput]);

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
    // Use evaluation data if available, otherwise fallback to mock data
    if (evaluationData) {
      const quoteSource =
        evaluationData.comments ??
        evaluationData.comment ??
        `${figure.name} found this conversation engaging.`;

      return {
        quote: ellipsize(quoteSource, 210),
      };
    }

    // Fallback to mock data if evaluation is not available yet
    const mockJudgement = `${figure.name} found this conversation engaging and thought-provoking.`;

    return {
      quote: ellipsize(mockJudgement, 210),
    };
  };

  const getCategoryImage = (category: ShareCategory | null) => {
    if (!category) return figure.imageUrl;

    const categoryMeta = CATEGORY_METADATA[category];
    const moodImage = categoryMeta.moodImage;

    // Get the figure name to determine the correct mood folder
    const figureName = figure.name.toLowerCase().replace(/\s+/g, "");
    let moodFolder = "Rand"; // Default fallback

    // Map figure names to their corresponding mood folders
    if (figureName === "ao") {
      moodFolder = "AO";
    } else if (figureName.includes("obama")) {
      moodFolder = "Obama";
    } else if (figureName.includes("orwell")) {
      moodFolder = "Orwell";
    } else if (figureName.includes("trump")) {
      moodFolder = "Trump";
    } else if (figureName.includes("rand")) {
      moodFolder = "Rand";
    } else if (
      figureName.includes("satoshi") ||
      figureName.includes("nakamoto")
    ) {
      moodFolder = "Satoshi";
    }

    switch (moodImage) {
      case "happy":
        // Trump uses "smile" instead of "happy"
        const happyFileName =
          moodFolder === "Trump"
            ? "trump_smile.webp"
            : `${moodFolder.toLowerCase()}_happy.webp`;
        return `/resources/moods/${moodFolder}/${happyFileName}`;
      case "sad":
        return `/resources/moods/${moodFolder}/${moodFolder.toLowerCase()}_sad.webp`;
      case "angry":
        return `/resources/moods/${moodFolder}/${moodFolder.toLowerCase()}_angry.webp`;
      default:
        return figure.imageUrl;
    }
  };

  const handleSaveOutOfContextCard = async () => {
    if (!outOfContextCardRef.current) return;
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

    const fileName = `${figure.name.replace(/\s+/g, "_")}_OutOfContextCard_${
      new Date().toISOString().split("T")[0]
    }.png`;

    // Download directly and track analytics
    const downloadOutOfContextCard = (blob: Blob) => {
      // Track download action
      trackShareAction({
        actionType: "download",
        characterName: figure.name,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    // Strategy A: html2canvas
    const attemptHtml2Canvas = async () => {
      const html2canvas = await import("html2canvas").then((m) => m.default);

      // Ensure explicit pixel height for the 16:9 box (avoid zero-height capture)
      let previousAspectHeight = "";
      if (aspectRef.current) {
        previousAspectHeight = aspectRef.current.style.height;
        const width =
          aspectRef.current.clientWidth ||
          outOfContextCardRef.current!.clientWidth;
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
        const canvasElement = await html2canvas(outOfContextCardRef.current!, {
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
          downloadOutOfContextCard(blob);
          return true;
        } else {
          // Fallback to data URL path
          const dataUrl = canvasElement.toDataURL("image/png");
          const blobFromDataUrl = await dataUrlToBlob(dataUrl);
          downloadOutOfContextCard(blobFromDataUrl);
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

      const width = outOfContextCardRef.current!.clientWidth;
      const height = outOfContextCardRef.current!.clientHeight;
      const pixelRatio = Math.max(2, Math.ceil(window.devicePixelRatio || 1));

      const dataUrl = await toPng(outOfContextCardRef.current!, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio,
        width,
        height,
        filter: filter as any,
      });

      const blob = await dataUrlToBlob(dataUrl);
      downloadOutOfContextCard(blob);
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
      console.error("Failed to save Out of Context card:", errorText);
      setSaveError(
        `${errorText}\n\nTips: If the twin image is remote without CORS, remove it or host locally. Avoid CSS filters/backdrop-filter on captured nodes.`
      );
      alert("Failed to save Out of Context card. See details in the modal.");
    } finally {
      setIsSaving(false);
    }
  };

  const highlights = getConversationHighlights();
  const saveDisabled = isSaving || isEvaluating || !selectedCategory;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="out-of-context-card-title"
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
              aria-label="Close Out of Context card"
            >
              <CloseIcon />
            </button>
            <a
              href="#/outofcontext/"
              onClick={(e) => {
                e.preventDefault();
                window.open(
                  `${window.location.origin}${window.location.pathname}#/outofcontext/`,
                  "_blank",
                  "width=800,height=600,scrollbars=yes,resizable=yes"
                );
              }}
              className="text-[10px] sm:text-xs font-semibold text-neutral-600 hover:text-neutral-900 underline transition-colors"
            >
              Read Out of Context contest rules
            </a>
          </div>

          {/* Category Selection */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm sm:text-base font-semibold mb-4 text-neutral-800 tracking-tight">
              Tag your submission
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {(
                Object.keys(ShareCategory) as Array<keyof typeof ShareCategory>
              ).map((key) => {
                const category = ShareCategory[key];
                const meta = CATEGORY_METADATA[category];
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`group flex flex-col items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-4 border-2 text-center transition-all duration-200 ${
                      isSelected
                        ? "text-white shadow-lg scale-[1.02]"
                        : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50 hover:shadow-md active:scale-[0.98]"
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: meta.color,
                            borderColor: meta.color,
                          }
                        : undefined
                    }
                  >
                    <span
                      className={`text-2xl sm:text-3xl transition-transform ${
                        isSelected ? "scale-110" : "group-hover:scale-110"
                      }`}
                    >
                      {meta.emoji}
                    </span>
                    <span
                      className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider leading-tight ${
                        isSelected ? "text-white" : "text-neutral-700"
                      }`}
                    >
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context Input */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm sm:text-base font-semibold mb-3 text-neutral-800 tracking-tight">
              I asked {figure.name.split(" ")[0]} about...{" "}
              <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <textarea
                ref={contextInputRef}
                value={contextInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 60) {
                    setContextInput(value);
                  }
                }}
                placeholder="e.g., cryptocurrency regulations"
                maxLength={60}
                rows={1}
                className="w-full px-4 pb-4 pt-2 sm:px-5 sm:py-5 border-2 border-neutral-200 bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all text-sm sm:text-base resize-none overflow-hidden"
                style={{ minHeight: "56px" }}
              />
              <div className="absolute right-3 bottom-3 text-xs text-neutral-400 font-mono">
                {contextInput.length}/60
              </div>
            </div>
          </div>

          {/* Out of Context Card Content - 16:9 split layout */}
          <div
            ref={outOfContextCardRef}
            className="relative w-full border border-neutral-300 bg-white"
          >
            <div
              ref={aspectRef}
              className="aspect-[16/9] relative flex overflow-hidden"
            >
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white/100 to-transparent group-hover:opacity-50 transition-opacity duration-1000 ease-out-circ h-96 pointer-events-none z-20"></div>
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
                {/* Final category image */}
                <img
                  crossOrigin="anonymous"
                  src={getCategoryImage(selectedCategory) || figure.imageUrl}
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
                className="inset-y-0 right-0 w-[50%] sm:w-[40%] max-w-[520px] p-5 md:p-8 flex flex-col justify-between overflow-hidden relative z-30"
              >
                {/* Content area */}
                <div className="flex-1 flex flex-col justify-center min-h-0">
                  {/* Evaluating state */}
                  {!showFinal && isEvaluating && (
                    <div className="text-[0.9rem] sm:text-xl md:text-2xl font-quote leading-tight text-neutral-400">
                      "Analyzing conversation quality..."
                    </div>
                  )}

                  {/* Final content */}
                  {showFinal && (
                    <>
                      {evaluationError ? (
                        <div className="text-[0.9rem] sm:text-xl md:text-2xl font-quote leading-tight text-red-400">
                          "Unable to evaluate conversation"
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {/* Category Badge */}
                          {selectedCategory && (
                            <div className="mb-2 sm:mb-8">
                              <div
                                className="flex flex-col items-center justify-center gap-2 px-2 py-1 sm:px-5 sm:py-3 border-2 shadow-sm w-full"
                                style={{
                                  backgroundColor:
                                    CATEGORY_METADATA[selectedCategory].color,
                                  borderColor:
                                    CATEGORY_METADATA[selectedCategory].color,
                                  color: "white",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize:
                                      "clamp(0.3rem, 1vw + 0.2rem, 10.0rem)",
                                  }}
                                >
                                  {CATEGORY_METADATA[selectedCategory].emoji}
                                </span>
                                <span
                                  className="font-bold uppercase tracking-wider"
                                  style={{
                                    fontSize:
                                      "clamp(0.3rem, 1vw + 0.2rem, 1rem)",
                                  }}
                                >
                                  {CATEGORY_METADATA[selectedCategory].label}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Context line */}
                          {contextInput && (
                            <div
                              className="mb-2 sm:mb-5 text-neutral-400 font-medium italic"
                              style={{
                                fontSize: "clamp(0.1rem, 0.1rem + 1vw, 1rem)",
                              }}
                            >
                              I asked {figure.name.split(" ")[0]} about{" "}
                              {contextInput}
                            </div>
                          )}

                          {/* Character quote */}
                          <div
                            className="font-quote leading-relaxed text-neutral-800"
                            style={{
                              fontSize: "clamp(0.1rem, 0.3rem + 1vw, 1.875rem)",
                            }}
                          >
                            "{highlights.quote}"
                          </div>
                        </div>
                      )}
                    </>
                  )}
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
              The Out of Context card is showing mock data due to evaluation
              failure.
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
            onClick={handleSaveOutOfContextCard}
            disabled={saveDisabled}
            title={
              isEvaluating
                ? "Please wait for evaluation to finish"
                : !selectedCategory
                ? "Please select a category to continue"
                : undefined
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
                : "Save Your Out of Context Card"}
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
  const [isOutOfContextCardOpen, setIsOutOfContextCardOpen] = useState(false);
  const [attestationData, setAttestationData] = useState<any>(null);
  const [shareHintVisible, setShareHintVisible] = useState(false);
  const [showShareOverlay, setShowShareOverlay] = useState(false);
  const [overlayDismissed, setOverlayDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);
  const sendSoundRef = useRef<HTMLAudioElement | null>(null);
  const receiveSoundRef = useRef<HTMLAudioElement | null>(null);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [isBannerCollapsing, setIsBannerCollapsing] = useState(false);

  const getShareOverlayPreview = useCallback(() => {
    type Preview = {
      mood: "Happy" | "Sad" | "Angry";
      score: number;
      response: string;
      moodImage: string;
    };

    const key = (figure.id || figure.name || "").toLowerCase().trim();

    // Helper to get mood image path
    const getMoodImagePath = (charKey: string, mood: string) => {
      const folderMap: Record<string, string> = {
        ao: "AO",
        satoshi: "Satoshi",
        trump: "Trump",
        obama: "Obama",
        orwell: "Orwell",
        rand: "Rand",
      };
      const folder = folderMap[charKey] || "Rand";
      const moodLower = mood.toLowerCase();
      if (mood === "Happy" && charKey === "trump") {
        return `/resources/moods/${folder}/trump_smile.webp`;
      }
      return `/resources/moods/${folder}/${folder.toLowerCase()}_${moodLower}.webp`;
    };

    // Deterministic, per-character defaults (no AI evaluation / no compute).
    const byId: Record<string, Omit<Preview, "moodImage">> = {
      ao: {
        mood: "Happy",
        score: 92,
        response: "Clean prompts. Strong signal. I'd talk to you again.",
      },
      satoshi: {
        mood: "Happy",
        score: 88,
        response:
          "Good curiosity. Thoughtful questions that show genuine interest.",
      },
      trump: {
        mood: "Happy",
        score: 91,
        response: "Big energy. Great conversation. Keep it up!",
      },
      obama: {
        mood: "Happy",
        score: 88,
        response: "Thoughtful questions. Solid pace. Nice conversational flow.",
      },
      orwell: {
        mood: "Happy",
        score: 87,
        response:
          "Sharp insights. Well-articulated thoughts that cut to the core.",
      },
      rand: {
        mood: "Happy",
        score: 89,
        response: "Clear intent. Strong principles. Excellent exchange.",
      },
    };

    // Try exact id match; fallback to substring matches on name.
    const addMoodImage = (
      charKey: string,
      data: Omit<Preview, "moodImage">
    ): Preview => ({
      ...data,
      moodImage: getMoodImagePath(charKey, data.mood),
    });

    const direct = byId[key];
    if (direct) return addMoodImage(key, direct);
    if (key.includes("satoshi") || key.includes("nakamoto"))
      return addMoodImage("satoshi", byId.satoshi);
    if (key.includes("obama")) return addMoodImage("obama", byId.obama);
    if (key.includes("orwell")) return addMoodImage("orwell", byId.orwell);
    if (key.includes("trump")) return addMoodImage("trump", byId.trump);
    if (key.includes("rand")) return addMoodImage("rand", byId.rand);

    // Generic fallback
    return {
      mood: "Happy",
      score: 85,
      response: "Good exchange. A solid conversation worth sharing.",
      moodImage: getMoodImagePath("rand", "Happy"),
    } satisfies Preview;
  }, [figure.id, figure.name]);

  // Typewriter effect constants and refs
  const TYPING_SPEED = 8; // ms per character
  const charQueueRef = useRef<string[]>([]);
  const isTypingRef = useRef(false);
  const displayedContentRef = useRef("");
  const aiMessageIdRef = useRef<string | null>(null);
  const currentMessagesRef = useRef<ChatMessage[]>([]);

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

  // Process character queue for typewriter animation
  const processCharQueue = useCallback(() => {
    if (!isTypingRef.current || charQueueRef.current.length === 0) {
      if (charQueueRef.current.length === 0) {
        isTypingRef.current = false;
      }
      return;
    }

    const char = charQueueRef.current.shift();
    if (char !== undefined) {
      displayedContentRef.current += char;

      const updatedMessages = currentMessagesRef.current.map((msg) =>
        msg.id === aiMessageIdRef.current
          ? { ...msg, text: displayedContentRef.current }
          : msg
      );
      currentMessagesRef.current = updatedMessages;
      setMessages(updatedMessages);
    }

    if (charQueueRef.current.length > 0) {
      setTimeout(processCharQueue, TYPING_SPEED);
    } else {
      isTypingRef.current = false;
    }
  }, []);

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

      const session = startChatSession(
        figure.systemPrompt,
        permanentPrompt,
        figure.id
      );
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
        // Handle both static string and dynamic function for welcomeMessage
        const welcomeText =
          typeof figure.welcomeMessage === "function"
            ? figure.welcomeMessage()
            : figure.welcomeMessage;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === welcomeId ? { ...m, text: welcomeText } : m
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

  // Fetch TEE attestation data for Out of Context card
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
            "Failed to fetch TEE attestation for Out of Context card:",
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

  // Reset banner when figure changes
  useEffect(() => {
    setIsBannerVisible(true);
    setIsBannerCollapsing(false);
  }, [figure.id]);

  // Collapse banner after first user message
  useEffect(() => {
    const userMessageCount = messages.filter(
      (m) => m.author === MessageAuthor.User
    ).length;

    if (userMessageCount >= 1 && isBannerVisible && !isBannerCollapsing) {
      setIsBannerCollapsing(true);
      // After animation completes, hide the banner
      const timer = setTimeout(() => {
        setIsBannerVisible(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [messages, isBannerVisible, isBannerCollapsing]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Show overlay after 3 user messages (only if not dismissed)
  useEffect(() => {
    const userMessageCount = messages.filter(
      (m) => m.author === MessageAuthor.User
    ).length;
    if (userMessageCount >= 3 && !showShareOverlay && !overlayDismissed) {
      // Update button position when showing overlay
      if (shareButtonRef.current) {
        const rect = shareButtonRef.current.getBoundingClientRect();
        setButtonPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
      setShowShareOverlay(true);
    }
  }, [messages, showShareOverlay, overlayDismissed]);

  // Update button position on scroll/resize when overlay is visible
  useEffect(() => {
    if (!showShareOverlay || !shareButtonRef.current) return;

    const updatePosition = () => {
      if (shareButtonRef.current) {
        const rect = shareButtonRef.current.getBoundingClientRect();
        setButtonPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showShareOverlay]);

  const handleConnectClick = (platform: string) => {
    setModalPlatform(platform);
  };

  const handleCloseModal = () => {
    setModalPlatform(null);
  };

  const dismissShareOverlay = () => {
    setShowShareOverlay(false);
    setOverlayDismissed(true);
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
    const newMessages = [
      ...messages,
      userMessage,
      { id: aiMessageId, text: "", author: figure.name },
    ];
    setMessages(newMessages);

    // Reset typewriter animation state
    charQueueRef.current = [];
    isTypingRef.current = false;
    displayedContentRef.current = "";
    aiMessageIdRef.current = aiMessageId;
    currentMessagesRef.current = newMessages;

    try {
      await sendMessageStream(
        chatSession,
        userInput,
        figure.config,
        (chunk) => {
          for (const char of chunk) {
            charQueueRef.current.push(char);
          }

          if (!isTypingRef.current) {
            isTypingRef.current = true;
            processCharQueue();
          }
        }
      );

      // Wait for typing animation to complete
      await new Promise<void>((resolve) => {
        const checkQueue = () => {
          if (charQueueRef.current.length === 0 && !isTypingRef.current) {
            resolve();
          } else {
            setTimeout(checkQueue, 50);
          }
        };
        checkQueue();
      });

      // Play receive sound when the AI's message is finalized
      playSound(receiveSoundRef);

      // Track chat per character (1. Chats per character)
      const totalMessages = messages.length + 2; // +1 for user message, +1 for AI response
      trackChatPerCharacter(figure.name, totalMessages);
    } catch (error) {
      charQueueRef.current = [];
      isTypingRef.current = false;

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

  // Render overlay content (shared between mobile drawer and desktop tooltip)
  const renderOverlayContent = ({
    isMobile = false,
  }: { isMobile?: boolean } = {}) => {
    const preview = getShareOverlayPreview();
    const moodColor =
      preview.mood === "Happy"
        ? "text-emerald-500"
        : preview.mood === "Sad"
        ? "text-blue-400"
        : "text-red-500";
    const moodEmoji =
      preview.mood === "Happy"
        ? "ph-[smiley--duotone]"
        : preview.mood === "Sad"
        ? "ph-[smiley-sad--duotone]"
        : "ph-[smiley-angry--duotone]";

    return (
      <>
        {/* Header text or Button */}
        {isMobile ? (
          <div className="px-4 py-3 w-full">
            <button
              onClick={() => {
                trackShareButtonClick({
                  characterName: figure.name,
                  tooltipShown: true,
                });
                dismissShareOverlay();
                setIsOutOfContextCardOpen(true);
              }}
              className="relative w-full flex gap-2 items-center justify-center py-2 px-4 border text-neutral-800 transition-colors text-[10px] sm:text-xs md:text-sm overflow-hidden active:scale-95 cursor-pointer border-amber-300 bg-amber-100 hover:bg-neutral-50"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                <div className="ph ph-[star--duotone] text-amber-400" />
                Share Your Out of Context Card
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-20 transform -skew-x-12 -translate-x-full animate-shimmer"></div>
            </button>
          </div>
        ) : (
          <div className="px-4 py-3 font-mono text-xs text-neutral-800">
            Click Button for {figure.name} to give you
            <br />
            their score on your conversation.
          </div>
        )}

        {/* Preview card mimicking the actual Out of Context card */}
        <div className="mx-3 mb-3 bg-white border border-neutral-200 overflow-hidden relative">
          {/* Darkening overlay and EXAMPLE label */}
          <div className="absolute inset-0 bg-black/30 z-10 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
            <div className="relative w-full h-8">
              <div className="absolute top-2 left-2 font-mono text-[10px] font-bold text-white uppercase tracking-widest">
                EXAMPLE
              </div>
            </div>
          </div>
          {/* Card content - 16:9-ish layout */}
          <div className="relative flex" style={{ aspectRatio: "16/9" }}>
            {/* Left side - mood image */}
            <div className="relative w-1/2 overflow-hidden">
              <img
                src={preview.moodImage}
                alt={`${figure.name} ${preview.mood} mood`}
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              {/* Twin logo */}
              <div className="absolute top-2 left-2">
                <img
                  src="/resources/Twin_Logo.svg"
                  alt="Twin"
                  className="w-12"
                />
              </div>
              {/* Name and title at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-white/90 to-transparent">
                <div className="text-xs font-bold uppercase tracking-wide text-neutral-900 text-left">
                  {figure.name}
                </div>
                <div className="text-[9px] text-neutral-600 text-left">
                  {figure.title}
                </div>
              </div>
            </div>

            {/* Right side - score and quote */}
            <div className="w-1/2 p-3 flex flex-col justify-between">
              {/* Score */}
              <div
                className={`flex items-center gap-1 text-2xl font-light ${moodColor}`}
              >
                <span className={`ph ${moodEmoji} text-2xl`}></span>
                <span className="tabular-nums">{preview.score}/100</span>
              </div>

              {/* Quote */}
              <div
                className={`text-xs italic leading-snug ${moodColor} font-quote text-left mb-7`}
                style={{ marginTop: 0, marginBottom: "28px" }}
              >
                "{preview.response}"
              </div>

              {/* TEE badge */}
              <div className="flex justify-end">
                <div className="text-[8px] px-1.5 py-0.5 border border-green-500 text-green-600 flex items-center gap-0.5">
                  <span className="ph ph-[shield-check]"></span>
                  TEE Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Mobile: Vaul Drawer from bottom (only on mobile) */}
      {isMobile && (
        <Drawer.Root
          open={showShareOverlay && isMobile}
          onOpenChange={(open) => {
            if (!open) {
              dismissShareOverlay();
            } else if (isMobile) {
              setShowShareOverlay(true);
            }
          }}
          dismissible={true}
        >
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-[10000] bg-black/40" />
            <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[10001] bg-white border-t border-neutral-300 shadow-2xl rounded-t-[16px] max-h-[80vh] flex flex-col">
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-neutral-300 rounded-full" />
              </div>
              {/* Close button removed on mobile as per request */}

              <div className="overflow-y-auto pb-4 flex-1">
                <div className="text-center">
                  {renderOverlayContent({ isMobile: true })}
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}

      {/* Desktop: Dark overlay and tooltip (hidden on mobile) */}
      {showShareOverlay && buttonPosition && (
        <div className="hidden md:block">
          <div
            className="fixed inset-0 bg-black/50 z-[9998] animate-fade-in cursor-pointer"
            onClick={dismissShareOverlay}
            style={{
              clipPath: `polygon(
                0% 0%,
                0% 100%,
                ${buttonPosition.left}px 100%,
                ${buttonPosition.left}px ${buttonPosition.top}px,
                ${buttonPosition.left + buttonPosition.width}px ${
                buttonPosition.top
              }px,
                ${buttonPosition.left + buttonPosition.width}px ${
                buttonPosition.top + buttonPosition.height
              }px,
                ${buttonPosition.left}px ${
                buttonPosition.top + buttonPosition.height
              }px,
                ${buttonPosition.left}px 100%,
                100% 100%,
                100% 0%
              )`,
            }}
          />
          {/* Fixed tooltip below button */}
          <div
            className="fixed bg-white border shadow-xl z-[10001] text-center"
            style={{
              top: buttonPosition.top + buttonPosition.height + 12,
              left: buttonPosition.left + buttonPosition.width / 2,
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: 350,
              height: "fit-content",
              borderColor: "var(--color-white)",
            }}
          >
            {/* Pointer triangle (border + fill) */}
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderBottom: "10px solid var(--color-white)",
              }}
              aria-hidden="true"
            />
            <div
              className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderBottom: "8px solid rgba(255, 255, 255, 1)",
              }}
              aria-hidden="true"
            />
            <button
              onClick={dismissShareOverlay}
              className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
              aria-label="Dismiss tooltip"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
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
            </button>

            {renderOverlayContent()}
          </div>
        </div>
      )}

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
                {figure.id !== "ao" && (
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
                          `https://gateway.s3-node-1.load.network/resolve/${figure.arweaveTxId}`,
                          "_blank"
                        );
                      }}
                    >
                      {figure.arweaveTxId.substring(0, 12)}...
                    </a>
                  </div>
                )}
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
                {/* Share Out of Context Card (disabled until at least 1 user message) */}
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
                  const handleShareClick = () => {
                    if (canShare) {
                      // Track share button click with tooltip context
                      trackShareButtonClick({
                        characterName: figure.name,
                        tooltipShown: showShareOverlay,
                      });

                      dismissShareOverlay();
                      setIsOutOfContextCardOpen(true);
                    }
                  };
                  return (
                    <div className="relative">
                      <button
                        ref={shareButtonRef}
                        onClick={handleShareClick}
                        disabled={!canShare}
                        aria-disabled={!canShare}
                        title={
                          canShare
                            ? "Share your Out of Context card"
                            : `Send at least 1 message with ${figure.name} to share your Out of Context card`
                        }
                        className={`relative flex gap-2 items-center py-2 px-4 border transition-colors text-[10px] sm:text-xs md:text-sm overflow-hidden active:scale-95 ring-1 group ${
                          canShare
                            ? "cursor-pointer border-border bg-black text-white ring-white/10 hover:opacity-90"
                            : "cursor-not-allowed border-neutral-300 bg-neutral-100 text-neutral-400 opacity-70"
                        }`}
                        style={{ zIndex: showShareOverlay ? 9999 : "auto" }}
                      >
                        {canShare && (
                          <>
                            <div className="absolute top-0 left-0 w-full h-full z-[1]">
                              <video
                                src={dreamVideoUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="h-full w-full object-cover object-left opacity-30 grayscale scale-150"
                                aria-label="Network is dreaming"
                              />
                            </div>
                            {/* Border shine effect on hover - only on border */}
                            <div
                              className="absolute -inset-[1px] z-[3] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-sm"
                              style={{
                                background:
                                  "linear-gradient(90deg, transparent 0%, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%, transparent 100%)",
                                backgroundSize: "200% 100%",
                                WebkitMask:
                                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                WebkitMaskComposite: "xor",
                                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                maskComposite: "exclude",
                                padding: "1px",
                                animation: "shimmer 2s ease-in-out infinite",
                              }}
                            ></div>
                          </>
                        )}
                        <span className="relative z-[2] inline-flex items-center gap-2">
                          <div
                            className={`ph ph-[sparkle--duotone] ${
                              canShare ? "text-white" : "text-neutral-400"
                            }`}
                          />
                          Share Your Out of Context Card
                        </span>
                      </button>
                      {!canShare && (
                        <button
                          type="button"
                          onClick={showHint}
                          aria-label="Share Out of Context card disabled overlay"
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

            {/* Thin Banner */}
            {isBannerVisible && (
              <div
                className={`relative w-full px-4 py-2 bg-black border-b border-border shrink-0 ring-1 ring-white/10 overflow-hidden transition-all duration-300 ease-in-out ${
                  isBannerCollapsing
                    ? "max-h-0 py-0 opacity-0 -mb-0"
                    : "max-h-20 opacity-100"
                }`}
              >
                <div className="absolute top-0 left-0 w-full h-full z-[1]">
                  <video
                    src={dreamVideoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover object-left opacity-30 grayscale scale-150"
                    aria-label="Network is dreaming"
                  />
                </div>
                <p className="relative z-[2] text-xs text-white text-center">
                  Keep chatting and share for $1,300 in $AR token prizes.{" "}
                  <a
                    href="#/outofcontext/"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(
                        `${window.location.origin}${window.location.pathname}#/outofcontext/`,
                        "_blank",
                        "width=800,height=600,scrollbars=yes,resizable=yes"
                      );
                    }}
                    className="underline hover:text-neutral-300 transition-colors font-semibold"
                  >
                    See rules
                  </a>
                </p>
              </div>
            )}

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
        <div className="hidden w-full xl:max-w-xs xl:w-88 space-y-3 self-start">
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
      <OutOfContextCardModal
        key={figure.id}
        figure={figure}
        messages={messages}
        attestationData={attestationData}
        isOpen={isOutOfContextCardOpen}
        onClose={() => setIsOutOfContextCardOpen(false)}
      />
    </>
  );
};

export default ChatInterface;
