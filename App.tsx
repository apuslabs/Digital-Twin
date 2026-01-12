import React, { useState, useMemo, useEffect } from "react";
import { Category, Figure } from "./types";
import { CATEGORIES, FIGURES } from "./constants";
import Header from "./components/Header";
import FigureSelector from "./components/FigureSelector";
import ChatInterface from "./components/ChatInterface";
import HowToBanner from "./components/HowToBanner";
import CompetitionPage from "./components/CompetitionPage";
import ContestRulesPage from "./components/ContestRulesPage";

const dreamVideoUrl = new URL(
  "./resources/videos/network-is-dreaming.mp4",
  import.meta.url
).href;

type View = "selector" | "chat" | "competition" | "contest";

const isContestRoute = () => {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.toLowerCase();
  return path.includes("contest") || path.includes("outofcontext");
};

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>(
    Category.Politics
  );
  const [selectedFigure, setSelectedFigure] = useState<Figure | null>(null);
  const [currentView, setCurrentView] = useState<View>(() =>
    isContestRoute() ? "contest" : "selector"
  );

  useEffect(() => {
    const handlePopState = () => {
      if (isContestRoute()) {
        setCurrentView("contest");
        return;
      }
      setCurrentView("selector");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/");
    }
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
      case "contest":
        return <ContestRulesPage onBackHome={handleBackToSelector} onStartRandom={handleStartRandom} />;
      case "selector":
      default:
        return (
          <div className="flex flex-col gap-6">
            <video
              src={dreamVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full rounded-md border border-border"
            />
            <FigureSelector
              categories={CATEGORIES}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              figures={FIGURES}
              onSelectFigure={handleSelectFigure}
              onNavigateToCompetition={handleNavigateToCompetition}
            />
            <HowToBanner onStartRandom={handleStartRandom} />
            {/* <CompetitionBanner onNavigate={handleNavigateToCompetition} /> */}
          </div>
        );
    }
  };

  return (
    <div className="bg-surface min-h-screen text-foreground">
      <Header 
        onLogoClick={handleBackToSelector} 
        isHomePage={currentView === "selector"}
      />
      <main className={`mx-auto px-4 py-8 font-mono ${
        currentView === "selector" ? "max-w-[2000px]" : "container"
      }`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
