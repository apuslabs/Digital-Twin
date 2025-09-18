import React, { useState, useMemo } from "react";
import { Category, Figure } from "./types";
import { CATEGORIES, FIGURES } from "./constants";
import Header from "./components/Header";
import FigureSelector from "./components/FigureSelector";
import ChatInterface from "./components/ChatInterface";
import CompetitionBanner from "./components/CompetitionBanner";
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

  const handleNavigateToCompetition = () => {
    setCurrentView("competition");
  };

  const renderContent = () => {
    switch (currentView) {
      case "chat":
        return (
          <ChatInterface
            figure={selectedFigure!}
            onBack={handleBackToSelector}
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
              figures={filteredFigures}
              onSelectFigure={handleSelectFigure}
            />
            <CompetitionBanner onNavigate={handleNavigateToCompetition} />
          </div>
        );
    }
  };

  return (
    <div className="bg-surface min-h-screen text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 font-mono">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
