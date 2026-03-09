import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Category, Figure, ShareCategory, CATEGORY_METADATA } from "../../types";
import { CATEGORIES, FIGURES } from "../../constants";
import { TagOption } from "../../types/app";
import { ContestBanner } from "../competition/ContestBanner";
import FigureSelector from "../chat/FigureSelector";
import { PrivateTwinForm } from "./PrivateTwinForm";

export const SelectorPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.Politics);
  const [activeTab, setActiveTab] = useState<"public" | "private">("public");
  const navigate = useNavigate();

  const tagOptions = useMemo<TagOption[]>(() => {
    return Object.values(ShareCategory).map((category) => {
      const meta = CATEGORY_METADATA[category];
      if (!meta) return { emoji: '', label: category, color: '#000' };
      return {
        emoji: meta.emoji,
        label: meta.label,
        color: meta.color,
      };
    });
  }, []);

  const handleSelectFigure = (figure: Figure) => {
    navigate(`/chat/${figure.id}`);
  };

  const handleNavigateToCompetition = () => {
    navigate("/outofcontext/");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[2000px] mx-auto">
      <ContestBanner
        tagOptions={tagOptions}
        onNavigateToCompetition={handleNavigateToCompetition}
      />

      <div className="flex flex-col gap-6 px-4 sm:px-0">
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setActiveTab("public")}
            className={`px-6 py-3 font-bold text-xs sm:text-sm uppercase tracking-widest transition-all relative ${
              activeTab === "public" ? "text-black" : "text-neutral-400"
            }`}
          >
            Public Twins
            {activeTab === "public" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("private")}
            className={`px-6 py-3 font-bold text-xs sm:text-sm uppercase tracking-widest transition-all relative ${
              activeTab === "private" ? "text-black" : "text-neutral-400"
            }`}
          >
            Private Twin
            {activeTab === "private" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
            )}
          </button>
        </div>

        {activeTab === "public" ? (
          <FigureSelector
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            figures={FIGURES}
            onSelectFigure={handleSelectFigure}
            onNavigateToCompetition={handleNavigateToCompetition}
          />
        ) : (
          <PrivateTwinForm />
        )}
      </div>
    </div>
  );
};
