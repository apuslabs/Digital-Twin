import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Category, Figure } from "../../types";
import { FIGURES } from "../../constants";
import ContestRulesPage from "./ContestRulesPage";

export const ContestPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory] = useState<Category>(Category.Politics);

  const filteredFigures = useMemo(() => {
    return FIGURES.filter((figure) => figure.category === activeCategory);
  }, [activeCategory]);

  const handleBackToSelector = () => {
    navigate("/");
  };

  const handleStartRandom = () => {
    const pool = filteredFigures.length > 0 ? filteredFigures : FIGURES;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const figure = pool[randomIndex];
    navigate(`/chat/${figure.id}`);
  };

  return (
    <ContestRulesPage
      onBackHome={handleBackToSelector}
      onStartRandom={handleStartRandom}
    />
  );
};
