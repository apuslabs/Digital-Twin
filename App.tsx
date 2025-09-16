
import React, { useState, useMemo } from 'react';
import { Category, Figure } from './types';
import { CATEGORIES, FIGURES } from './constants';
import Header from './components/Header';
import FigureSelector from './components/FigureSelector';
import ChatInterface from './components/ChatInterface';
import CompetitionBanner from './components/CompetitionBanner';
import CompetitionPage from './components/CompetitionPage';

type View = 'selector' | 'chat' | 'competition';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.Politics);
  const [selectedFigure, setSelectedFigure] = useState<Figure | null>(null);
  const [currentView, setCurrentView] = useState<View>('selector');

  const filteredFigures = useMemo(() => {
    return FIGURES.filter(figure => figure.category === activeCategory);
  }, [activeCategory]);

  const handleSelectFigure = (figure: Figure) => {
    setSelectedFigure(figure);
    setCurrentView('chat');
  };

  const handleBackToSelector = () => {
    setSelectedFigure(null);
    setCurrentView('selector');
  };

  const handleNavigateToCompetition = () => {
    setCurrentView('competition');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'chat':
        return <ChatInterface figure={selectedFigure!} onBack={handleBackToSelector} />;
      case 'competition':
        return <CompetitionPage figures={FIGURES} onBack={handleBackToSelector} />;
      case 'selector':
      default:
        return (
          <>
            <FigureSelector
              categories={CATEGORIES}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              figures={filteredFigures}
              onSelectFigure={handleSelectFigure}
            />
            <CompetitionBanner onNavigate={handleNavigateToCompetition} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
