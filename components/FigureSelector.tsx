import React from 'react';
import { Category, Figure } from '../types';

interface FigureSelectorProps {
  categories: Category[];
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  figures: Figure[];
  onSelectFigure: (figure: Figure) => void;
}

const Tabs: React.FC<Pick<FigureSelectorProps, 'categories' | 'activeCategory' | 'onCategoryChange'>> = ({ categories, activeCategory, onCategoryChange }) => (
  <div className="mb-8 flex justify-center flex-wrap gap-2">
    {categories.map((category) => (
      <button
        key={category}
        onClick={() => onCategoryChange(category)}
        className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 ${
          activeCategory === category
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        }`}
      >
        {category}
      </button>
    ))}
  </div>
);

const UsersIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0011 9V8h-.13a7.001 7.001 0 00-3.74 5.93c0 .34.024.673.07 1h5.73zM12 21a7.003 7.003 0 006.83-5.93c.046-.327.07-.66.07-1a7 7 0 00-7-7h-1a7 7 0 00-7 7c0 .34.024.673.07 1A7.003 7.003 0 005 21h7z" />
    </svg>
);


const FigureCard: React.FC<{figure: Figure; onSelect: (figure: Figure) => void;}> = ({ figure, onSelect }) => (
    <div
        onClick={() => onSelect(figure)}
        className="bg-slate-800/50 rounded-lg overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-600/20 cursor-pointer"
    >
        <div className="relative">
            <img src={figure.imageUrl} alt={figure.name} className="w-full h-48 sm:h-56 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 w-full">
                <h3 className="text-lg font-bold text-white">{figure.name}</h3>
                <p className="text-sm text-blue-300">{figure.title}</p>
                <div className="flex items-center text-xs text-slate-300 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <UsersIcon />
                    <span>{figure.contributors.toLocaleString()} contributors</span>
                </div>
            </div>
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
      <h2 className="text-3xl font-bold text-center mb-4">Choose a Digital Twin</h2>
      <p className="text-slate-400 text-center mb-8 max-w-2xl mx-auto">
        Select a public figure to chat with their permanent digital twin, built on Arweave. Join the community to help improve their AI persona.
      </p>
      <Tabs categories={categories} activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {figures.map((figure) => (
          <FigureCard key={figure.id} figure={figure} onSelect={onSelectFigure} />
        ))}
      </div>
    </div>
  );
};

export default FigureSelector;