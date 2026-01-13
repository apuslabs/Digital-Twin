import React from "react";
import { Category, Figure } from "../types";

interface FigureSelectorProps {
  categories: Category[];
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  figures: Figure[];
  onSelectFigure: (figure: Figure) => void;
  onNavigateToCompetition: () => void;
}

const ClickIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block h-4 w-4 mx-1"
    viewBox="0 0 20 20"
    aria-hidden="true"
    fill="currentColor"
  >
    <path d="M3 2l12 6-5 1 3 6-2 1-3-6-4 4V2z" />
  </svg>
);

const FigureCard: React.FC<{
  figure: Figure;
  onSelect: (figure: Figure) => void;
}> = ({ figure, onSelect }) => (
  <button
    onClick={() => onSelect(figure)}
    className="group relative border border-border bg-white overflow-hidden cursor-pointer p-2 
      hover:scale-[1.02] hover:shadow-xl hover:shadow-neutral-200/50 hover:border-neutral-300
      active:scale-[0.98]
      focus-visible:outline-2 focus-visible:outline-neutral-400 focus-visible:outline-offset-2
      transition-all duration-300 ease-out-circ
      will-change-transform
      text-left w-full"
    aria-label={`Chat with ${figure.name}`}
  >
    <div className="flex justify-between">
      <div>
        <h3 className="text-base sm:text-lg font-bold">{figure.name}</h3>
        <p className="text-xs sm:text-sm text-neutral-500">{figure.title}</p>
      </div>
      <span
        className="ph ph-[arrow-up-right] mr-2 text-lg transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden
      />
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
        loading="lazy"
        className="w-full h-64 sm:h-72 lg:h-80 xl:h-96 2xl:h-[500px] object-cover object-[50%_20%] overflow-visible transition-transform duration-500 ease-out group-hover:scale-[1.02]"
      />
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white/100 to-transparent group-hover:opacity-40 transition-opacity duration-700 ease-out-circ h-32 transform translate-y-4" />
    </div>
  </button>
);

const FigureSelector: React.FC<FigureSelectorProps> = ({
  figures,
  onSelectFigure,
  onNavigateToCompetition,
}) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <h2 className="font mb-4 flex items-center gap-4">
            <span className="scale-y-125 font-bold text-sm sm:text-lg">
              Select a Digital Twin
            </span>
          </h2>
          <p className="max-w-2xl text-xs sm:text-sm text-neutral-600">
            <ClickIcon /> Click on a twin to start chatting.
          </p>
        </div>
        <div className="flex flex-col gap-4 items-end">
          <p className="text-sm text-neutral-500">Built on ⓐ Arweave.</p>
          <p hidden>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigateToCompetition();
              }}
              className="underline hover:opacity-70"
            >
              Join the community to help improve their AI persona.
            </a>
          </p>
        </div>
      </div>

      {/* Modern CSS Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {figures.map((figure) => (
          <FigureCard
            key={figure.id}
            figure={figure}
            onSelect={onSelectFigure}
          />
        ))}
      </div>
    </div>
  );
};

export default FigureSelector;
