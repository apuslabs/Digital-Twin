import React, { useState, useMemo, useRef } from "react";
import { TagOption, PostOption } from "../types/app";
import { FIGURES } from "../constants";
import { ShareCategory, CATEGORY_METADATA } from "../types";
import { useTypewriterPost } from "../hooks/useTypewriterPost";
import { makeHashtag, makePrefix } from "../utils/postHelpers";
import { MockWarningTooltip } from "./MockWarningTooltip";

interface XPostMockProps {
  tagOptions: TagOption[];
  onClick?: () => void;
}

export function XPostMock({ tagOptions, onClick }: XPostMockProps) {
  const [hasImage, setHasImage] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const clickedButtonRef = useRef<HTMLButtonElement | null>(null);
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

  const playErrorSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 200;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn("Could not play error sound:", error);
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;

    e.preventDefault();
    e.stopPropagation();

    // Play error sound
    playErrorSound();

    // Store reference to clicked button
    clickedButtonRef.current = e.currentTarget;

    // Show tooltip
    setShowPopup(true);
    onClick();

    // Auto-hide tooltip after 3 seconds
    setTimeout(() => {
      setShowPopup(false);
      clickedButtonRef.current = null;
    }, 3000);
  };

  return (
    <>
      {/* Terminal Window Wrapper */}
      <div className="relative rounded-lg overflow-hidden bg-black border border-neutral-700">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-700">
          {/* Terminal prompt indicator */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-green-400 font-mono">$</span>
          </div>
          {/* Window Title */}
          <div className="flex-1 text-center">
            <span className="text-[10px] text-green-400 font-mono">x.com</span>
          </div>
          {/* Terminal status indicator */}
          <div className="w-12 flex justify-end">
            <span className="text-[8px] text-neutral-500 font-mono">●</span>
          </div>
        </div>

        {/* Content Area */}
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
            className="absolute top-2 right-2 z-20 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] sm:text-[10px] uppercase tracking-wide text-neutral-600 bg-white/80 backdrop-blur-sm"
            style={{ borderColor: "#cfd9de" }}
            aria-label="Mock post preview"
            title="Mock preview (not an actual post)"
          >
            <span className="ph ph-[info--duotone] text-[12px] sm:text-[14px] text-amber-500" />
            Mock preview
          </div>
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
            <div className="select-none text-[32px] sm:text-[44px] font-black tracking-[0.35em] text-black/5 -rotate-12">
              MOCK
            </div>
          </div>

          <div className="relative z-10 flex items-start gap-2 sm:gap-3">
            <div className="hidden sm:block h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent" />
              <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-amber-300/50 to-orange-600/50 blur-sm" />
            </div>

            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={onClick ? handleButtonClick : undefined}
                data-clicked-button
                className="inline-flex items-center gap-1 rounded-full border px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold"
                style={{ borderColor: "#1d9bf0", color: "#1d9bf0" }}
              >
                Everyone
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
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
                className="mt-3 min-h-[60px] text-base sm:text-lg md:text-[20px] leading-6 sm:leading-7 text-[#0f1419] whitespace-pre-wrap"
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
                      onClick={onClick ? handleButtonClick : undefined}
                      data-clicked-button
                      className="absolute top-2 right-2 z-20 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                      aria-label="Close"
                    >
                      <svg
                        className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white"
                        viewBox="0 0 24 24"
                        fill="none"
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
                        clipPath:
                          "polygon(65% 0%, 100% 0%, 100% 100%, 20% 100%)",
                        WebkitClipPath:
                          "polygon(65% 0%, 100% 0%, 100% 100%, 20% 100%)",
                      }}
                    />

                    {/* Left side - Figure image */}
                    <div className="relative flex-1 overflow-hidden">
                      <img
                        src={
                          getCategoryImage(current.tag.label) ||
                          mockFigure.imageUrl
                        }
                        alt={mockFigure.name}
                        className="absolute inset-0 w-full h-full object-cover object-left"
                      />

                      {/* Figure name and title */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-white via-white/95 to-transparent z-10">
                        <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-neutral-900 text-left">
                          {mockFigure.name}
                        </div>
                        <div className="text-[8px] sm:text-[9px] text-neutral-600 text-left">
                          {mockFigure.title}
                        </div>
                      </div>

                      {/* Twin logo */}
                      <div className="absolute top-0 p-2 z-10">
                        <img
                          src="/resources/Twin_Logo.svg"
                          alt="Twin"
                          className="w-8 sm:w-12 h-auto"
                        />
                      </div>
                    </div>

                    {/* Right side - Content */}
                    <div className="w-[40%] p-4 flex flex-col justify-center bg-white/95 relative z-10">
                      {/* Category badge */}
                      <div
                        className="mb-3 flex flex-col items-center justify-center gap-1 px-2 sm:px-3 py-2 border-2 shadow-sm text-center"
                        style={{
                          backgroundColor: current.tag.color,
                          borderColor: current.tag.color,
                          color: "white",
                        }}
                      >
                        <span className="text-lg sm:text-xl">
                          {current.tag.emoji}
                        </span>
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-center">
                          {current.tag.label}
                        </span>
                      </div>

                      {/* Quote */}
                      <div className="text-xs sm:text-sm leading-relaxed text-neutral-800 font-quote">
                        "{makePrefix(current.tag.label)}"
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={onClick ? handleButtonClick : undefined}
                data-clicked-button
                className="mt-2 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold"
                style={{ color: "#1d9bf0" }}
              >
                <svg
                  className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
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

              <div
                className="mt-3"
                style={{ borderTop: "1px solid #eff3f4" }}
              />

              <div className="mt-3 flex items-center justify-between">
                <div
                  className="flex items-center gap-2 sm:gap-4"
                  style={{ color: "#1d9bf0" }}
                >
                  <button
                    type="button"
                    className="p-1"
                    aria-label="Media"
                    onClick={(e) => {
                      if (onClick) {
                        handleButtonClick(e);
                      }
                      setHasImage(!hasImage);
                    }}
                    data-clicked-button
                    style={{ color: hasImage ? "#1d9bf0" : "#536471" }}
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
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

                  <button
                    type="button"
                    className="p-1"
                    aria-label="GIF"
                    onClick={onClick ? handleButtonClick : undefined}
                    data-clicked-button
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
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

                  <button
                    type="button"
                    className="p-1"
                    aria-label="Poll"
                    onClick={onClick ? handleButtonClick : undefined}
                    data-clicked-button
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
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

                  <button
                    type="button"
                    className="p-1"
                    aria-label="Emoji"
                    onClick={onClick ? handleButtonClick : undefined}
                    data-clicked-button
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
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

                  <button
                    type="button"
                    className="p-1"
                    aria-label="Schedule"
                    onClick={onClick ? handleButtonClick : undefined}
                    data-clicked-button
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
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

                  <button
                    type="button"
                    className="p-1"
                    aria-label="Location"
                    onClick={onClick ? handleButtonClick : undefined}
                    data-clicked-button
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
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

                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Character limit indicator (X-style) */}
                  <div
                    className="relative h-6 w-6 sm:h-8 sm:w-8"
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
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 32 32"
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
                        className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[10px] font-semibold"
                        style={{ color: "#1d9bf0" }}
                      >
                        {Math.max(-99, charsRemaining)}
                      </div>
                    )}
                  </div>

                  <div
                    className="hidden sm:block h-6"
                    style={{ width: 1, backgroundColor: "#eff3f4" }}
                  />

                  <button
                    type="button"
                    onClick={onClick ? handleButtonClick : undefined}
                    data-clicked-button
                    className="hidden sm:inline-flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full border"
                    style={{ borderColor: "#cfd9de", color: "#1d9bf0" }}
                    aria-label="More"
                  >
                    <svg
                      className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
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
                    onClick={onClick ? handleButtonClick : undefined}
                    data-clicked-button
                    className="rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white transition-opacity"
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
      </div>
      <MockWarningTooltip show={showPopup} anchorRef={clickedButtonRef} />
    </>
  );
}
