
import React from 'react';

interface CompetitionBannerProps {
  onNavigate: () => void;
}

const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 011.05-4.319l3.45-6.9a.75.75 0 011.336 0l3.45 6.9A9.75 9.75 0 0116.5 18.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18.75v1.5a2.25 2.25 0 002.25 2.25h1.5A2.25 2.25 0 0015 20.25v-1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13.5H9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.5h-1.5a2.25 2.25 0 00-2.25 2.25v1.5H15M3 13.5h1.5a2.25 2.25 0 012.25 2.25v1.5H9" />
    </svg>
);


const CompetitionBanner: React.FC<CompetitionBannerProps> = ({ onNavigate }) => {
  return (
    <div 
      className="mt-12 p-8 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 shadow-2xl shadow-purple-600/20 cursor-pointer transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in"
      onClick={onNavigate}
      style={{ animationDelay: '200ms' }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="hidden sm:block">
            <TrophyIcon />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">AI-Judged Data Competition</h2>
            <p className="text-blue-200 mt-1 max-w-lg">
              Submit data contributions judged by advanced AI agents. Top-quality submissions permanently stored on Arweave earn APUS token rewards.
            </p>
          </div>
        </div>
        <button className="bg-white text-blue-600 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-slate-100 transition-colors shrink-0">
          Contribute Now
        </button>
      </div>
    </div>
  );
};

export default CompetitionBanner;
