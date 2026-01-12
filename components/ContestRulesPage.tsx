import React, { useEffect, useMemo, useState } from "react";
import { CATEGORY_METADATA, ShareCategory } from "../types";
import { FIGURES } from "../constants";
import Modal from "./dialog/Modal";

type ContestRulesPageProps = {
  onBackHome?: () => void;
  onStartRandom?: () => void;
};

const timeline = [
  {
    title: "Submissions open",
    detail: "Live during the competition window.",
  },
  {
    title: "Daily judging",
    detail: "AI agents score and highlight standout chats in real time.",
  },
  {
    title: "Winners posted",
    detail: "Top out-of-context moments published on twin.ar.io/outofcontext.",
  },
];

type TagOption = {
  emoji: string;
  label: string;
  color: string;
};

type PostOption = {
  tag: TagOption;
  text: string;
};

function makeHashtag(tag: TagOption) {
  const compact = tag.label.toUpperCase().replace(/[^A-Z0-9]+/g, "");
  return `#${tag.emoji}${compact}`;
}

function makePrefix(label: string) {
  const upper = label.toUpperCase();
  if (upper.includes("UNHINGED")) return "Wow what a time to be alive.";
  if (upper.includes("WHOLESOME"))
    return "Did not expect this, but it's kind of perfect.";
  if (upper.includes("ODDLY")) return "Why is this so oddly specific?";
  if (upper.includes("CURSED"))
    return "I regret reading this with my own eyes.";
  if (upper.includes("ADVICE")) return "Absolutely do not do this.";
  if (upper.includes("OUT OF CHARACTER"))
    return "This is so out of character it's scary.";
  return "This twin just surprised me.";
}

function useTypewriterPost(postOptions: PostOption[]) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "pause" | "deleting">("typing");

  useEffect(() => {
    if (postOptions.length === 0) return;

    const current = postOptions[activeIndex % postOptions.length];
    const target = current.text;

    const typingDelayMs = 34;
    const deletingDelayMs = 18;
    const pauseDelayMs = 1100;

    const timeout = window.setTimeout(
      () => {
        if (phase === "typing") {
          const next = target.slice(0, typed.length + 1);
          setTyped(next);
          if (next.length >= target.length) setPhase("pause");
          return;
        }

        if (phase === "pause") {
          setPhase("deleting");
          return;
        }

        const next = target.slice(0, Math.max(0, typed.length - 1));
        setTyped(next);
        if (next.length === 0) {
          setActiveIndex((prev) => (prev + 1) % postOptions.length);
          setPhase("typing");
        }
      },
      phase === "typing"
        ? typingDelayMs
        : phase === "pause"
        ? pauseDelayMs
        : deletingDelayMs
    );

    return () => window.clearTimeout(timeout);
  }, [activeIndex, phase, postOptions, typed]);

  const current =
    postOptions.length > 0
      ? postOptions[activeIndex % postOptions.length]
      : null;
  return { current, typed };
}

function XPostMock({ tagOptions }: { tagOptions: TagOption[] }) {
  const [hasImage, setHasImage] = useState(true);
  const MAX_CHARS = 200;

  const postOptions = useMemo<PostOption[]>(() => {
    return tagOptions.map((tag) => {
      const hashtag = makeHashtag(tag);
      const prefix = makePrefix(tag.label);
      return {
        tag,
        text: `${prefix} ${hashtag} `,
      };
    });
  }, [tagOptions]);

  const { current, typed } = useTypewriterPost(postOptions);
  const charsUsed = typed.length;
  const charsRemaining = MAX_CHARS - charsUsed;
  const progress = Math.max(0, Math.min(1, charsUsed / MAX_CHARS));
  const ringSize = 32;
  const ringRadius = 13;
  const ringCircumference = 2 * Math.PI * ringRadius;

  // Pick a random figure for the mock Out of Context card
  const mockFigure = useMemo(() => {
    return FIGURES[Math.floor(Math.random() * FIGURES.length)];
  }, []);

  const getCategoryImage = (tagLabel: string) => {
    if (!tagLabel || !mockFigure) return mockFigure?.imageUrl || "";

    // Find matching ShareCategory by label
    const matchingCategory = Object.values(ShareCategory).find(
      (cat) =>
        CATEGORY_METADATA[cat].label.toUpperCase() === tagLabel.toUpperCase()
    );

    if (!matchingCategory) return mockFigure.imageUrl;

    const categoryMeta = CATEGORY_METADATA[matchingCategory];
    const moodImage = categoryMeta.moodImage;
    const figureName = mockFigure.name.toLowerCase().replace(/\s+/g, "");
    let moodFolder = "Rand";

    if (figureName === "ao") moodFolder = "AO";
    else if (figureName.includes("obama")) moodFolder = "Obama";
    else if (figureName.includes("orwell")) moodFolder = "Orwell";
    else if (figureName.includes("trump")) moodFolder = "Trump";
    else if (figureName.includes("rand")) moodFolder = "Rand";
    else if (figureName.includes("satoshi") || figureName.includes("nakamoto"))
      moodFolder = "Satoshi";

    switch (moodImage) {
      case "happy":
        return moodFolder === "Trump"
          ? `/resources/moods/${moodFolder}/trump_smile.webp`
          : `/resources/moods/${moodFolder}/${moodFolder.toLowerCase()}_happy.webp`;
      case "sad":
        return `/resources/moods/${moodFolder}/${moodFolder.toLowerCase()}_sad.webp`;
      case "angry":
        return `/resources/moods/${moodFolder}/${moodFolder.toLowerCase()}_angry.webp`;
      default:
        return mockFigure.imageUrl;
    }
  };

  return (
    <div
      className="relative rounded-none bg-white p-4"
      style={{
        border: "1px solid #cfd9de",
        fontFamily:
          'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
      }}
    >
      {/* Mock signal: badge + subtle watermark */}
      <div
        className="absolute top-2 right-2 z-20 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide text-neutral-600 bg-white/80 backdrop-blur-sm"
        style={{ borderColor: "#cfd9de" }}
        aria-label="Mock post preview"
        title="Mock preview (not an actual post)"
      >
        <span className="ph ph-[info--duotone] text-[14px] text-amber-500" />
        Mock preview
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <div className="select-none text-[44px] font-black tracking-[0.35em] text-black/5 -rotate-12">
          MOCK
        </div>
      </div>

      <div className="relative z-10 flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-neutral-900" />

        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold"
            style={{ borderColor: "#1d9bf0", color: "#1d9bf0" }}
          >
            Everyone
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="#1d9bf0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div
            className="mt-3 min-h-[60px] text-[20px] leading-7 text-[#0f1419] whitespace-pre-wrap"
            aria-label="Post text (auto-demo typing)"
          >
            {typed || ""}
            <span className="inline-block w-[8px] text-[#0f1419] animate-pulse">
              |
            </span>
          </div>

          {/* Image Attachment Preview - Mock Out of Context Card */}
          {hasImage && current && mockFigure && (
            <div
              className="mt-3 rounded-2xl overflow-hidden border"
              style={{ borderColor: "#cfd9de" }}
            >
              <div className="relative aspect-[16/9] flex overflow-hidden bg-white">
                {/* X button - top right */}
                <button
                  type="button"
                  className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  aria-label="Close"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-white"
                  >
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Background stripes overlay */}
                <div
                  className="pointer-events-none absolute inset-0 z-0 opacity-30"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 8px)",
                    backgroundSize: "10px 10px",
                    clipPath: "polygon(65% 0%, 100% 0%, 100% 100%, 20% 100%)",
                    WebkitClipPath:
                      "polygon(65% 0%, 100% 0%, 100% 100%, 20% 100%)",
                  }}
                />

                {/* Left side - Figure image */}
                <div className="relative flex-1 overflow-hidden">
                  <img
                    src={
                      getCategoryImage(current.tag.label) || mockFigure.imageUrl
                    }
                    alt={mockFigure.name}
                    className="absolute inset-0 w-full h-full object-cover object-left"
                  />

                  {/* Figure name and title */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-white via-white/95 to-transparent z-10">
                    <div className="text-xs font-bold uppercase tracking-wide text-neutral-900 text-left">
                      {mockFigure.name}
                    </div>
                    <div className="text-[9px] text-neutral-600 text-left">
                      {mockFigure.title}
                    </div>
                  </div>

                  {/* Twin logo */}
                  <div className="absolute top-0 p-2 z-10">
                    <img
                      src="/resources/Twin_Logo.svg"
                      alt="Twin"
                      className="w-12 h-auto"
                    />
                  </div>
                </div>

                {/* Right side - Content */}
                <div className="w-[40%] p-4 flex flex-col justify-center bg-white/95 relative z-10">
                  {/* Category badge */}
                  <div
                    className="mb-3 flex flex-col items-center justify-center gap-1 px-3 py-2 border-2 shadow-sm text-center"
                    style={{
                      backgroundColor: current.tag.color,
                      borderColor: current.tag.color,
                      color: "white",
                    }}
                  >
                    <span className="text-xl">{current.tag.emoji}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">
                      {current.tag.label}
                    </span>
                  </div>

                  {/* Quote */}
                  <div className="text-sm leading-relaxed text-neutral-800 font-quote">
                    "{makePrefix(current.tag.label)}"
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: "#1d9bf0" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 2a10 10 0 100 20 10 10 0 000-20z"
                stroke="#1d9bf0"
                strokeWidth="2"
              />
              <path
                d="M2 12h20"
                stroke="#1d9bf0"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 2c2.8 2.7 4.5 6.2 4.5 10S14.8 19.3 12 22c-2.8-2.7-4.5-6.2-4.5-10S9.2 4.7 12 2z"
                stroke="#1d9bf0"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            Everyone can reply
          </button>

          <div className="mt-3" style={{ borderTop: "1px solid #eff3f4" }} />

          <div className="mt-3 flex items-center justify-between">
            <div
              className="flex items-center gap-4"
              style={{ color: "#1d9bf0" }}
            >
              <button
                type="button"
                className="p-1"
                aria-label="Media"
                onClick={() => setHasImage(!hasImage)}
                style={{ color: hasImage ? "#1d9bf0" : "#536471" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v11A2.5 2.5 0 0117.5 20h-11A2.5 2.5 0 014 17.5v-11z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 14l2.5-2.5L16.5 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 12l1.5-1.5L20 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="9" r="1.5" fill="currentColor" />
                </svg>
              </button>

              <button type="button" className="p-1" aria-label="GIF">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7.5A3.5 3.5 0 017.5 4h9A3.5 3.5 0 0120 7.5v9A3.5 3.5 0 0116.5 20h-9A3.5 3.5 0 014 16.5v-9z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 12h3v4H8a2 2 0 010-4z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13 12h3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13 16v-4h3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button type="button" className="p-1" aria-label="Poll">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 18V10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 18V6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18 18v-8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <button type="button" className="p-1" aria-label="Emoji">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8.5 14.5c1 1 2.1 1.5 3.5 1.5s2.5-.5 3.5-1.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="9" cy="10" r="1" fill="currentColor" />
                  <circle cx="15" cy="10" r="1" fill="currentColor" />
                </svg>
              </button>

              <button type="button" className="p-1" aria-label="Schedule">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 7v5l3 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button type="button" className="p-1" aria-label="Location">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21s7-4.4 7-11a7 7 0 10-14 0c0 6.6 7 11 7 11z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="10"
                    r="2.5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Character limit indicator (X-style) */}
              <div
                className="relative h-8 w-8"
                aria-label={`Characters remaining: ${Math.max(
                  -MAX_CHARS,
                  charsRemaining
                )}`}
                title={`Characters remaining: ${Math.max(
                  -MAX_CHARS,
                  charsRemaining
                )}`}
              >
                <svg
                  width={ringSize}
                  height={ringSize}
                  viewBox="0 0 32 32"
                  className="absolute inset-0"
                  aria-hidden="true"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r={ringRadius}
                    stroke="#cfd9de"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r={ringRadius}
                    stroke="#1d9bf0"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringCircumference * (1 - progress)}
                    transform="rotate(-90 16 16)"
                  />
                </svg>
                {charsUsed > 0 && charsRemaining <= 20 && (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold"
                    style={{ color: "#1d9bf0" }}
                  >
                    {Math.max(-99, charsRemaining)}
                  </div>
                )}
              </div>

              <div
                className="h-6"
                style={{ width: 1, backgroundColor: "#eff3f4" }}
              />

              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border"
                style={{ borderColor: "#cfd9de", color: "#1d9bf0" }}
                aria-label="More"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity"
                style={{
                  backgroundColor: typed.length > 0 ? "#0f1419" : "#0f1419",
                  opacity: typed.length > 0 ? 1 : 0.5,
                  cursor: typed.length > 0 ? "pointer" : "not-allowed",
                }}
                disabled={typed.length === 0}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ContestRulesPage: React.FC<ContestRulesPageProps> = ({
  onBackHome,
  onStartRandom,
}) => {
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const tagOptions = useMemo<TagOption[]>(() => {
    return Object.values(ShareCategory).map((category) => {
      const meta = CATEGORY_METADATA[category];
      return {
        emoji: meta.emoji,
        label: meta.label,
        color: meta.color,
      };
    });
  }, []);

  return (
    <div className="mx-auto max-w-2xl animate-fade-in text-neutral-900 px-4">
      <div className="relative overflow-hidden border border-border bg-white p-6 md:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#000 0px,#000 1px,transparent 1px,transparent 10px),repeating-linear-gradient(-45deg,#000 0px,#000 1px,transparent 1px,transparent 10px)",
            backgroundSize: "14px 14px, 14px 14px",
          }}
        />

        <div className="relative flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/resources/Twin_Logo.svg"
              alt="Twin"
              className="h-4 w-auto"
            />
            <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              OUT OF CONTEXT
            </span>
          </div>
        </div>

        <div className="relative mt-8">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-600">
              <span className="ph ph-[sparkle]"></span>
              Sharing
            </div>
            <h2 className="mt-2 text-lg font-semibold">
              Share your out of context moments with a twin.
            </h2>
            <p className="mt-2 text-xs text-neutral-700">
              AI judges score entries, category winners get highlighted, and the
              best posts live forever on Arweave.
            </p>
            <div className="mt-4">
              <XPostMock tagOptions={tagOptions} />
            </div>
          </div>
        </div>

        <div className="relative mt-10">
          <div className="border border-border bg-white/70 p-4 md:p-5 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-600">
                <span className="ph ph-[check-circle]"></span>
                Quick checklist
              </div>
              <p className="text-[11px] text-neutral-500">
                Keep submissions clean and easy to judge.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => {
                  const newExpanded = new Set(expandedItems);
                  if (newExpanded.has(1)) {
                    newExpanded.delete(1);
                  } else {
                    newExpanded.add(1);
                  }
                  setExpandedItems(newExpanded);
                }}
                className="group relative flex items-center h-full gap-3 border border-border bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] cursor-pointer text-left"
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center transition-[color] duration-300 ease-out ${
                    expandedItems.has(1) ? "text-red-500" : "text-neutral-600"
                  }`}
                >
                  <span className="ph ph-[eye-slash] text-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                    Redact sensitive info
                  </p>
                  <div
                    className={`grid overflow-hidden will-change-[grid-template-rows,opacity,filter] ${
                      expandedItems.has(1)
                        ? "opacity-100 blur-0"
                        : "opacity-0 blur-[2px]"
                    }`}
                    style={{
                      gridTemplateRows: expandedItems.has(1) ? "1fr" : "0fr",
                      transition:
                        "grid-template-rows 200ms cubic-bezier(.165, .84, .44, 1), opacity 200ms cubic-bezier(.165, .84, .44, 1), filter 100ms cubic-bezier(.165, .84, .44, 1)",
                    }}
                  >
                    <div className="min-h-0 pt-2 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Use image editing tools or blur features to cover up any
                        wallet addresses, transaction IDs, or other personally
                        identifiable information. This protects your privacy and
                        keeps submissions safe for public viewing.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`transition-transform ${
                      expandedItems.has(1) ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newExpanded = new Set(expandedItems);
                  if (newExpanded.has(2)) {
                    newExpanded.delete(2);
                  } else {
                    newExpanded.add(2);
                  }
                  setExpandedItems(newExpanded);
                }}
                className="group relative flex items-center h-full gap-3 border border-border bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] cursor-pointer text-left"
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center transition-[color] duration-300 ease-out ${
                    expandedItems.has(2) ? "text-blue-500" : "text-neutral-600"
                  }`}
                >
                  <span className="ph ph-[info] text-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                    Tag your moment
                  </p>
                  <div
                    className={`grid overflow-hidden will-change-[grid-template-rows,opacity,filter] ${
                      expandedItems.has(2)
                        ? "opacity-100 blur-0"
                        : "opacity-0 blur-[2px]"
                    }`}
                    style={{
                      gridTemplateRows: expandedItems.has(2) ? "1fr" : "0fr",
                      transition:
                        "grid-template-rows 200ms cubic-bezier(.165, .84, .44, 1), opacity 200ms cubic-bezier(.165, .84, .44, 1), filter 100ms cubic-bezier(.165, .84, .44, 1)",
                    }}
                  >
                    <div className="min-h-0 pt-2 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Include the name of the Digital Twin you were chatting
                        with (e.g., "Satoshi", "Obama", "Ayn Rand"). Select the
                        category tag that best matches the moment—whether
                        it&apos;s unhinged, wholesome, oddly specific, cursed,
                        advice, or out of character. This helps judges quickly
                        understand your submission.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`transition-transform ${
                      expandedItems.has(2) ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newExpanded = new Set(expandedItems);
                  if (newExpanded.has(3)) {
                    newExpanded.delete(3);
                  } else {
                    newExpanded.add(3);
                  }
                  setExpandedItems(newExpanded);
                }}
                className="group relative flex items-center h-full gap-3 border border-border bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] cursor-pointer text-left"
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center transition-[color] duration-300 ease-out ${
                    expandedItems.has(3) ? "text-amber-500" : "text-neutral-600"
                  }`}
                >
                  <span className="ph ph-[sparkle] text-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                    One moment per entry
                  </p>
                  <div
                    className={`grid overflow-hidden will-change-[grid-template-rows,opacity,filter] ${
                      expandedItems.has(3)
                        ? "opacity-100 blur-0"
                        : "opacity-0 blur-[2px]"
                    }`}
                    style={{
                      gridTemplateRows: expandedItems.has(3) ? "1fr" : "0fr",
                      transition:
                        "grid-template-rows 200ms cubic-bezier(.165, .84, .44, 1), opacity 200ms cubic-bezier(.165, .84, .44, 1), filter 100ms cubic-bezier(.165, .84, .44, 1)",
                    }}
                  >
                    <div className="min-h-0 pt-2 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Focus on quality over quantity. Each submission should
                        highlight a single standout moment from your
                        conversation. If you have multiple great moments, submit
                        them separately. This makes judging easier and gives
                        each moment its best chance to shine.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`transition-transform ${
                      expandedItems.has(3) ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newExpanded = new Set(expandedItems);
                  if (newExpanded.has(4)) {
                    newExpanded.delete(4);
                  } else {
                    newExpanded.add(4);
                  }
                  setExpandedItems(newExpanded);
                }}
                className="group relative flex items-center h-full gap-3 border border-border bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] cursor-pointer text-left"
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center transition-[color] duration-300 ease-out ${
                    expandedItems.has(4)
                      ? "text-emerald-500"
                      : "text-neutral-600"
                  }`}
                >
                  <span className="ph ph-[smiley] text-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                    Keep it fun and clean
                  </p>
                  <div
                    className={`grid overflow-hidden will-change-[grid-template-rows,opacity,filter] ${
                      expandedItems.has(4)
                        ? "opacity-100 blur-0"
                        : "opacity-0 blur-[2px]"
                    }`}
                    style={{
                      gridTemplateRows: expandedItems.has(4) ? "1fr" : "0fr",
                      transition:
                        "grid-template-rows 200ms cubic-bezier(.165, .84, .44, 1), opacity 200ms cubic-bezier(.165, .84, .44, 1), filter 100ms cubic-bezier(.165, .84, .44, 1)",
                    }}
                  >
                    <div className="min-h-0 pt-2 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        This competition is meant to be fun and entertaining.
                        Keep submissions lighthearted and respectful. Any
                        content that includes hate speech, harassment, doxxing,
                        or other harmful material will be disqualified.
                        Let&apos;s keep the community positive and enjoyable for
                        everyone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`transition-transform ${
                      expandedItems.has(4) ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newExpanded = new Set(expandedItems);
                  if (newExpanded.has(5)) {
                    newExpanded.delete(5);
                  } else {
                    newExpanded.add(5);
                  }
                  setExpandedItems(newExpanded);
                }}
                className="group relative flex items-center h-full gap-3 border border-border bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] cursor-pointer text-left"
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center transition-[color] duration-300 ease-out ${
                    expandedItems.has(5)
                      ? "text-indigo-500"
                      : "text-neutral-600"
                  }`}
                >
                  <span className="ph ph-[target] text-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                    What counts in the competition
                  </p>
                  <div
                    className={`grid overflow-hidden will-change-[grid-template-rows,opacity,filter] ${
                      expandedItems.has(5)
                        ? "opacity-100 blur-0"
                        : "opacity-0 blur-[2px]"
                    }`}
                    style={{
                      gridTemplateRows: expandedItems.has(5) ? "1fr" : "0fr",
                      transition:
                        "grid-template-rows 200ms cubic-bezier(.165, .84, .44, 1), opacity 200ms cubic-bezier(.165, .84, .44, 1), filter 100ms cubic-bezier(.165, .84, .44, 1)",
                    }}
                  >
                    <div className="min-h-0 pt-2 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Screenshots or snippets from your Twin chats that feel
                        out-of-context, unhinged, eerily accurate, or just
                        hilariously wrong.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`transition-transform ${
                      expandedItems.has(5) ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newExpanded = new Set(expandedItems);
                  if (newExpanded.has(6)) {
                    newExpanded.delete(6);
                  } else {
                    newExpanded.add(6);
                  }
                  setExpandedItems(newExpanded);
                }}
                className="group relative flex items-center h-full gap-3 border border-border bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] cursor-pointer text-left"
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center transition-[color] duration-300 ease-out ${
                    expandedItems.has(6)
                      ? "text-purple-500"
                      : "text-neutral-600"
                  }`}
                >
                  <span className="ph ph-[gavel] text-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                    How judging works
                  </p>
                  <div
                    className={`grid overflow-hidden will-change-[grid-template-rows,opacity,filter] ${
                      expandedItems.has(6)
                        ? "opacity-100 blur-0"
                        : "opacity-0 blur-[2px]"
                    }`}
                    style={{
                      gridTemplateRows: expandedItems.has(6) ? "1fr" : "0fr",
                      transition:
                        "grid-template-rows 200ms cubic-bezier(.165, .84, .44, 1), opacity 200ms cubic-bezier(.165, .84, .44, 1), filter 100ms cubic-bezier(.165, .84, .44, 1)",
                    }}
                  >
                    <div className="min-h-0 pt-2 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        AI judges evaluate for originality, entertainment, and
                        alignment with the chosen category. Winners are pinned
                        during the event.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`transition-transform ${
                      expandedItems.has(6) ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="relative mt-10">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-600">
              <span className="ph ph-[calendar]"></span>
              Timeline
            </div>
            <h2 className="mt-2 text-lg font-semibold">
              Quick schedule for the competition window.
            </h2>
            <div className="mt-4 relative">
              <div>
                {timeline.map((item, index) => {
                  const isFirst = index === 0;
                  const isLast = index === timeline.length - 1;

                  return (
                    <div
                      key={item.title}
                      className={`relative pl-10 ${!isLast ? "pb-3" : ""}`}
                    >
                      {/* Rail segments (stop at the center of first/last marker) */}
                      {!isFirst && (
                        <div className="absolute left-[10px] top-0 h-[26px] w-px bg-border z-0" />
                      )}
                      {!isLast && (
                        <div className="absolute left-[10px] top-[26px] bottom-0 w-px bg-border z-0" />
                      )}

                      {/* Step marker (small square) */}
                      <div className="absolute left-0 top-4 z-10 flex h-5 w-5 items-center justify-center bg-neutral-900 text-[10px] font-semibold text-white">
                        {index + 1}
                      </div>

                      <div className="border border-border bg-white/80 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                        <p className="text-xs font-semibold text-neutral-900 leading-tight">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-neutral-700">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-10">
          <button
            type="button"
            onClick={() => onStartRandom?.()}
            className="relative flex h-full w-full items-center gap-3 border border-neutral-800 bg-neutral-900 p-4 cursor-pointer text-left hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-900/20 active:scale-[0.98] transition-[background-color,box-shadow,transform] duration-300 ease-out-circ"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center text-white">
              <span className="ph ph-[rocket-launch] text-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wide text-white">
                Start competition
              </p>
              <p className="mt-1 text-xs text-neutral-200 leading-relaxed">
                Chat with a Digital Twin to generate your Out of Context card.
              </p>
            </div>
            <div className="flex items-center text-white">
              <span className="ph ph-[arrow-up-right] text-[18px]" />
            </div>
          </button>
        </div>

        <div className="relative mt-4">
          <button
            type="button"
            onClick={() => setIsLegalOpen(true)}
            className="group relative flex h-full gap-3 border border-border bg-neutral-50 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] cursor-pointer text-left w-full hover:bg-neutral-100 hover:border-neutral-300 active:scale-[0.98] transition-[background-color,border-color,transform] duration-300 ease-out-circ"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center text-neutral-600">
              <span className="ph ph-[scales] text-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                Legal requirements
              </p>
              <p className="mt-1 text-xs text-neutral-700 leading-relaxed">
                Review terms and conditions before submitting.
              </p>
            </div>
            <div className="flex items-center text-neutral-600">
              <span className="ph ph-[arrow-up-right] text-[18px]" />
            </div>
          </button>
        </div>

        <Modal
          isOpen={isLegalOpen}
          onClose={() => setIsLegalOpen(false)}
          title="Legal"
        >
          <div className="space-y-3 text-xs text-neutral-800">
            <p className="text-neutral-700">
              Placeholder legal requirements. Replace with final terms before
              launch.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700">
              <li>
                By submitting content, you confirm you have the rights to share
                it and that it doesn&apos;t violate others&apos; rights.
              </li>
              <li>
                Do not submit personal data (including wallet addresses) or
                confidential information. You are responsible for redaction.
              </li>
              <li>
                Submissions may be reviewed, scored, and publicly displayed as
                part of the competition.
              </li>
              <li>
                Submissions must comply with applicable laws and must not
                include harassment, hate speech, or illegal content.
              </li>
              <li>
                The competition is provided &quot;as is&quot; without
                warranties. Organizers may modify rules or disqualify entries at
                any time.
              </li>
            </ul>
            <p className="text-[11px] text-neutral-500">
              Note: This copy is a mock. Add your official terms, privacy
              policy, eligibility, and licensing language.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ContestRulesPage;
