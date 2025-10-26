import React, { useState, useMemo } from "react";
import { Category, Figure } from "./types";
import { CATEGORIES, FIGURES } from "./constants";
import Header from "./components/Header";
import FigureSelector from "./components/FigureSelector";
import ChatInterface from "./components/ChatInterface";
import HowToBanner from "./components/HowToBanner";
import CompetitionPage from "./components/CompetitionPage";

type View = "selector" | "chat" | "competition";

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>(
    Category.Politics
  );
  const [selectedFigure, setSelectedFigure] = useState<Figure | null>(null);
  const [currentView, setCurrentView] = useState<View>("selector");

  const filteredFigures = useMemo(() => {
    return FIGURES.filter((figure) => figure.category === activeCategory);
  }, [activeCategory]);

  const handleSelectFigure = (figure: Figure) => {
    setSelectedFigure(figure);
    setCurrentView("chat");
  };

  const handleBackToSelector = () => {
    setSelectedFigure(null);
    setCurrentView("selector");
  };

  const handleNextTwin = () => {
    if (!selectedFigure) return;
    const currentIndex = FIGURES.findIndex((f) => f.id === selectedFigure.id);
    const nextIndex = (currentIndex + 1) % FIGURES.length;
    setSelectedFigure(FIGURES[nextIndex]);
  };

  const handlePrevTwin = () => {
    if (!selectedFigure) return;
    const currentIndex = FIGURES.findIndex((f) => f.id === selectedFigure.id);
    const prevIndex = (currentIndex - 1 + FIGURES.length) % FIGURES.length;
    setSelectedFigure(FIGURES[prevIndex]);
  };

  const handleNavigateToCompetition = () => {
    setCurrentView("competition");
  };

  const handleStartRandom = () => {
    const pool = filteredFigures.length > 0 ? filteredFigures : FIGURES;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const figure = pool[randomIndex];
    setSelectedFigure(figure);
    setCurrentView("chat");
  };

  const renderContent = () => {
    switch (currentView) {
      case "chat":
        return (
          <ChatInterface
            figure={selectedFigure!}
            onBack={handleBackToSelector}
            onNextTwin={handleNextTwin}
            onPrevTwin={handlePrevTwin}
          />
        );
      case "competition":
        return (
          <CompetitionPage figures={FIGURES} onBack={handleBackToSelector} />
        );
      case "selector":
      default:
        return (
          <div className="flex flex-col gap-6">
            <FigureSelector
              categories={CATEGORIES}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              figures={FIGURES}
              onSelectFigure={handleSelectFigure}
              onNavigateToCompetition={handleNavigateToCompetition}
            />
            <HowToBanner onStartRandom={handleStartRandom} />
          </div>
        );
    }
  };

  return (
    <div className="bg-surface min-h-screen text-foreground">
      <Header onLogoClick={handleBackToSelector} />
      <main className="container mx-auto px-4 py-8 font-mono">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
