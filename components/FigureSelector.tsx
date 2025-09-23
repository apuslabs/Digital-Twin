import React, { useCallback, useEffect, useRef, useState } from "react";
import { Category, Figure } from "../types";
import useEmblaCarousel from "embla-carousel-react";
import TwinLogoMark from "@/resources/Twin_LogoMark.svg";

interface FigureSelectorProps {
  categories: Category[];
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  figures: Figure[];
  onSelectFigure: (figure: Figure) => void;
}

// Tabs removed per new design (carousel only)

const UsersIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 mr-1.5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0011 9V8h-.13a7.001 7.001 0 00-3.74 5.93c0 .34.024.673.07 1h5.73zM12 21a7.003 7.003 0 006.83-5.93c.046-.327.07-.66.07-1a7 7 0 00-7-7h-1a7 7 0 00-7 7c0 .34.024.673.07 1A7.003 7.003 0 005 21h7z" />
  </svg>
);

const FigureCard: React.FC<{
  figure: Figure;
  onSelect: (figure: Figure) => void;
  showEnterHint?: boolean;
}> = ({ figure, onSelect, showEnterHint = false }) => (
  <div
    onClick={() => onSelect(figure)}
    className="group border border-border bg-white overflow-hidden cursor-pointer p-2 hover:scale-[1.02] transition-transform duration-200 ease-out-circ"
  >
    <div className="flex justify-between">
      <div>
        <h3 className="text-lg font-bold">{figure.name}</h3>
        <p className="text-sm text-neutral-500">{figure.title}</p>
      </div>
      <div className="flex items-center text-xs text-neutral-500">
        <UsersIcon />
        <span>{figure.contributors.toLocaleString()} contributors</span>
      </div>
    </div>
    <div className="relative">
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
        className="w-full h-48 sm:h-[50vh] object-cover object-top"
      />
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white/100 to-transparent group-hover:opacity-50 transition-opacity duration-1000 ease-out-circ h-48"></div>
      {showEnterHint && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center">
          <span className="px-3 py-1 border border-border bg-white text-neutral-900 text-xs">
            ⏎ Enter to Start Chat
          </span>
        </div>
      )}
    </div>
  </div>
);

const FigureSelector: React.FC<FigureSelectorProps> = ({
  figures,
  onSelectFigure,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const tweenFactor = useRef(0.84);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const setTweenFactor = useCallback((api: any) => {
    tweenFactor.current = 0.5 * api.scrollSnapList().length;
  }, []);

  const numberWithinRange = (n: number, min: number, max: number) =>
    Math.min(Math.max(n, min), max);

  const tweenOpacity = useCallback(
    (api: any, eventName?: string) => {
      if (!api) return;
      const engine = api.internalEngine();
      const scrollProgress = api.scrollProgress();
      const slidesInView: number[] = api.slidesInView();
      const isScrollEvent = eventName === "scroll";

      api.scrollSnapList().forEach((scrollSnap: number, snapIndex: number) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach((slideIndex: number) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem: any) => {
              const target = loopItem.target();
              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);
                if (sign === -1)
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                if (sign === 1)
                  diffToTarget = scrollSnap + (1 - scrollProgress);
              }
            });
          }

          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
          const baseOpacity = numberWithinRange(tweenValue, 0, 1);
          const boostedOpacity =
            hoveredIndex === slideIndex
              ? Math.min(1, baseOpacity + 0.3)
              : baseOpacity;
          api.slideNodes()[slideIndex].style.opacity =
            boostedOpacity.toString();
        });
      });
    },
    [hoveredIndex]
  );

  const onSelect = useCallback((api: any) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  const onInit = useCallback(
    (api: any) => {
      setScrollSnaps(api.scrollSnapList());
      onSelect(api);
      setTweenFactor(api);
      tweenOpacity(api);
    },
    [onSelect, setTweenFactor, tweenOpacity]
  );

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    emblaApi
      .on("reInit", onInit)
      .on("select", onSelect)
      .on("reInit", tweenOpacity)
      .on("scroll", tweenOpacity)
      .on("slideFocus", tweenOpacity);
  }, [emblaApi, onInit, onSelect, tweenOpacity]);

  useEffect(() => {
    if (!emblaApi) return;
    tweenOpacity(emblaApi);
  }, [hoveredIndex, emblaApi, tweenOpacity]);

  // Keyboard controls: Enter selects active, ArrowLeft/ArrowRight navigate
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

      if (e.key === "Enter") {
        const figure = figures[selectedIndex];
        if (figure) onSelectFigure(figure);
        return;
      }
      if (e.key === "ArrowLeft") {
        emblaApi?.scrollPrev();
        return;
      }
      if (e.key === "ArrowRight") {
        emblaApi?.scrollNext();
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [figures, selectedIndex, onSelectFigure, emblaApi]);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h2 className="font mb-4 flex items-center gap-2">
            <img
              src={TwinLogoMark}
              alt="Twin Logo Mark"
              aria-hidden="true"
              className="h-4 w-auto"
            />
            <span className="scale-y-125 font-bold">Choose a Digital Twin</span>
          </h2>
          <p className="mb-8 max-w-2xl">
            Select a public figure to chat with their permanent digital twin,
            built on Arweave.{" "}
            <a href="/competition" className="underline hover:opacity-70">
              Join the community to help improve their AI persona.
            </a>
          </p>
        </div>
      </div>

      <div className="embla w-full mx-auto relative">
        <div className="embla__viewport overflow-hidden p-4" ref={emblaRef}>
          <div className="embla__container flex -ml-4 touch-pan-y">
            {figures.map((figure, index) => (
              <div
                key={figure.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="embla__slide translate-z-0 shrink-0 basis-[50%] min-w-0 pl-4"
              >
                <FigureCard
                  figure={figure}
                  onSelect={onSelectFigure}
                  showEnterHint={selectedIndex === index}
                />
              </div>
            ))}
          </div>
        </div>
        {/* Overlay navigation controls */}
        <button
          className="absolute -left-7 top-1/2 -translate-y-1/2 z-10 w-14 h-32 border border-border bg-white text-neutral-800 flex items-center justify-center shadow-xl hover:bg-neutral-100 active:scale-95 transition disabled:opacity-20 disabled:pointer-events-none before:content-[''] before:absolute before:-inset-8 before:bg-transparent cursor-w-resize"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!emblaApi || emblaApi.canScrollPrev() === false}
          aria-label="Previous"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" />
          </svg>
        </button>
        <button
          className="absolute -right-7 top-1/2 -translate-y-1/2 z-10 w-14 h-32 border border-border bg-white text-neutral-800 flex items-center justify-center shadow-xl hover:bg-neutral-100 active:scale-95 transition disabled:opacity-20 disabled:pointer-events-none before:content-[''] before:absolute before:-inset-8 before:bg-transparent cursor-e-resize"
          onClick={() => emblaApi?.scrollNext()}
          disabled={!emblaApi || emblaApi.canScrollNext() === false}
          aria-label="Next"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FigureSelector;
