import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Category, Figure, ShareCategory, CATEGORY_METADATA } from "../../types";
import { CATEGORIES, FIGURES } from "../../constants";
import { TagOption } from "../../types/app";
import { ContestBanner } from "../competition/ContestBanner";
import FigureSelector from "../chat/FigureSelector";

export const SelectorPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.Politics);
  const navigate = useNavigate();

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

  const handleSelectFigure = (figure: Figure) => {
    navigate(`/chat/${figure.id}`);
  };

  const handleNavigateToCompetition = () => {
    navigate("/outofcontext/");
  };

  return (
    <div className="flex flex-col gap-6">
      <ContestBanner
        tagOptions={tagOptions}
        onNavigateToCompetition={handleNavigateToCompetition}
      />
      <FigureSelector
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        figures={FIGURES}
        onSelectFigure={handleSelectFigure}
        onNavigateToCompetition={handleNavigateToCompetition}
      />
    </div>
  );
};
