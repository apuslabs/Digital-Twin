import React, { useState, useMemo } from "react";
import {
  HashRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { Category, Figure, ShareCategory, CATEGORY_METADATA } from "./types";
import { CATEGORIES, FIGURES } from "./constants";
import { TagOption } from "./types/app";
import Header from "./components/layout/Header";
import FigureSelector from "./components/chat/FigureSelector";
import ChatInterface from "./components/chat/ChatInterface";
import ContestRulesPage from "./components/competition/ContestRulesPage";
import { ContestBanner } from "./components/competition/ContestBanner";
import { Footer } from "./components/layout/Footer";

// Selector Page Component
const SelectorPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>(
    Category.Politics
  );
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

// Chat Page Component
const ChatPage: React.FC = () => {
  const { figureId } = useParams<{ figureId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedFigure = useMemo(() => {
    return FIGURES.find((f) => f.id === figureId) || null;
  }, [figureId]);

  if (!selectedFigure) {
    navigate("/");
    return null;
  }

  const handleBackToSelector = () => {
    navigate("/");
  };

  const handleNextTwin = () => {
    const currentIndex = FIGURES.findIndex((f) => f.id === selectedFigure.id);
    const nextIndex = (currentIndex + 1) % FIGURES.length;
    navigate(`/chat/${FIGURES[nextIndex].id}`);
  };

  const handlePrevTwin = () => {
    const currentIndex = FIGURES.findIndex((f) => f.id === selectedFigure.id);
    const prevIndex = (currentIndex - 1 + FIGURES.length) % FIGURES.length;
    navigate(`/chat/${FIGURES[prevIndex].id}`);
  };

  return (
    <ChatInterface
      figure={selectedFigure}
      onBack={handleBackToSelector}
      onNextTwin={handleNextTwin}
      onPrevTwin={handlePrevTwin}
    />
  );
};

// Contest Page Component
const ContestPage: React.FC = () => {
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

// Main App Layout Component
const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/" || location.pathname === "";

  const handleBackToSelector = () => {
    navigate("/");
  };

  return (
    <div className="bg-shader min-h-screen text-foreground">
      <Header onLogoClick={handleBackToSelector} isHomePage={isHomePage} />
      <main
        className={`sm:mx-auto px-0 sm:px-4 py-0 sm:py-8 font-mono relative z-10 ${
          isHomePage ? "max-w-[2000px]" : "container"
        }`}
      >
        <Routes>
          <Route path="/" element={<SelectorPage />} />
          <Route path="/chat/:figureId" element={<ChatPage />} />
          <Route path="/outofcontext/" element={<ContestPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

// Main App Component with HashRouter
const App: React.FC = () => {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
};

export default App;
