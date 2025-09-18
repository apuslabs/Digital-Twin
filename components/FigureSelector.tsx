import React from "react";
import { Category, Figure } from "../types";
import TwinLogoMark from "@/resources/Twin_LogoMark.svg";
import TrumpImg from "@/resources/trump.png";
import ObamaImg from "@/resources/obama.png";

interface FigureSelectorProps {
  categories: Category[];
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  figures: Figure[];
  onSelectFigure: (figure: Figure) => void;
}

const Tabs: React.FC<
  Pick<
    FigureSelectorProps,
    "categories" | "activeCategory" | "onCategoryChange"
  >
> = ({ categories, activeCategory, onCategoryChange }) => (
  <div className="mb-8 flex flex-wrap gap-2 border border-border p-2 bg-white w-fit">
    {categories.map((category) => (
      <button
        key={category}
        onClick={() => onCategoryChange(category)}
        className={`px-4 h-fit py-1 font-mono uppercase text-xs sm:text-sm transition-[colors,transform,opacity] active:scale-[0.98] active:opacity-80 duration-150 cursor-pointer ${
          activeCategory === category
            ? "bg-foreground text-white shadow-lg"
            : "bg-transparent text-black hover:bg-foreground/25"
        }`}
      >
        {category}
      </button>
    ))}
  </div>
);

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
}> = ({ figure, onSelect }) => (
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
        src={
          figure.name === "Donald Trump"
            ? TrumpImg
            : figure.name === "Barack Obama"
            ? ObamaImg
            : figure.imageUrl
        }
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
    </div>
  </div>
);

const FigureSelector: React.FC<FigureSelectorProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  figures,
  onSelectFigure,
}) => {
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

          {/* 
          // NOTE: Commented out for now because we don't have categories yet.
          
          <Tabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
          /> */}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
