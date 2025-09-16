import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Figure } from '../types';
import { aoService } from '../services/aoService';

interface CompetitionPageProps {
  figures: Figure[];
  onBack: () => void;
}
interface Winner {
    id: number;
    walletAddress: string;
    contribution: string;
    figureName: string;
    date: string;
    aiScore: number;
    arweaveTxId: string;
    attestation: string;
    aoMessageId: string;
}
const MOCK_WINNERS = [
  {
    id: 1,
    walletAddress: '0x1A2b3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R',
    contribution: 'You must always talk about the incredible ratings of your show, The Apprentice. It was a huge success, number one for many years. Everyone agrees. When you criticize someone, call them a "total disaster" or "very nasty".',
    figureName: 'Donald Trump',
    date: '2024-07-15',
    aiScore: 92,
    arweaveTxId: 'FhD4xbfkCkCb19BGUMduQCqmtirFCIcDUAeC0fenzbE',
    attestation: 'TEE-APUS-2024-07-15T14:32:18Z-VERIFIED',
    aoMessageId: 'AO-MSG-4f8x9m2q7n5w1e6r3t8y0u9i4o5p7a2s5d8f6g1h3j9k2l6z4c1v7b'
  },
  {
    id: 2,
    walletAddress: '0x9Z8y7X6w5V4u3T2s1R0q9P8o7N6m5L4k3J2i',
    contribution: 'Remember to frequently reference your daughters, Sasha and Malia, and your wife, Michelle. Speak about the responsibilities of parenthood and leadership. Use phrases like, "Now, I\'ve said this before, and I\'ll say it again..." to emphasize a point.',
    figureName: 'Barack Obama',
    date: '2024-07-14',
    aiScore: 88,
    arweaveTxId: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1',
    attestation: 'TEE-APUS-2024-07-14T16:45:33Z-VERIFIED',
    aoMessageId: 'AO-MSG-7z5y3x1w9v8u7t6s5r4q3p2o1n0m9l8k7j6i5h4g3f2e1d0c9b8a'
  }
];

const BackArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const FileUploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const WinnersHistory: React.FC<{ onWinnerClick: (winner: Winner) => void }> = ({ onWinnerClick }) => (
    <div className="bg-slate-800/50 rounded-xl shadow-2xl p-6 h-full">
        <h3 className="text-xl font-bold mb-2 text-white">🏆 AI-Approved Winners</h3>
        <p className="text-xs text-slate-400 mb-4">Top contributions rated by AI agents</p>
        <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
            {MOCK_WINNERS.map(winner => (
                <div 
                    key={winner.id} 
                    className="bg-slate-700/50 p-4 rounded-lg animate-fade-in cursor-pointer hover:bg-slate-700/70 transition-colors"
                    onClick={() => onWinnerClick(winner)}
                >
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400 uppercase tracking-wide">Winner Address</span>
                            <p className="text-sm font-mono text-blue-300" title={winner.walletAddress}>
                                {winner.walletAddress.substring(0, 8)}...{winner.walletAddress.substring(winner.walletAddress.length - 6)}
                            </p>
                        </div>
                        <span className="text-xs text-green-400">✓ AI Approved</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-slate-400">Contribution for: <strong>{winner.figureName}</strong></p>
                        <span className="text-xs text-slate-500">{winner.date}</span>
                    </div>
                    <blockquote className="text-sm text-slate-300 border-l-2 border-blue-500 pl-3 italic">
                       "{winner.contribution.length > 100 ? winner.contribution.substring(0, 100) + '...' : winner.contribution}"
                    </blockquote>
                    <p className="text-xs text-slate-500 mt-2">📦 Stored permanently on Arweave</p>
                    <p className="text-xs text-blue-400 mt-1">Click to view details →</p>
                </div>
            ))}
        </div>
        <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 2px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #718096; }
        `}</style>
    </div>
);

const WinnerDetailModal: React.FC<{ winner: Winner; onClose: () => void; }> = ({ winner, onClose }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
           window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="bg-slate-800 rounded-xl shadow-2xl p-6 m-4 max-w-2xl w-full transform transition-all duration-300 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-700">
                    <h2 id="modal-title" className="text-2xl font-bold text-white">Contribution Details</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Close modal">
                        <CloseIcon />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-slate-400">Winner Address</p>
                            <p className="text-blue-300 font-mono break-all" title={winner.walletAddress}>{winner.walletAddress}</p>
                        </div>
                        <div>
                            <p className="text-slate-400">Contribution For</p>
                            <p className="text-white font-semibold">{winner.figureName}</p>
                        </div>
                        <div>
                            <p className="text-slate-400">Date</p>
                            <p className="text-white">{winner.date}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch gap-4">
                        <div className="flex-1 bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                            <p className="text-sm text-slate-400 mb-1">AI Evaluated Score</p>
                            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{winner.aiScore}</p>
                        </div>
                        <div className="flex-1 bg-slate-700/50 p-4 rounded-lg">
                            <p className="text-sm text-slate-400 mb-2">Arweave Transaction ID</p>
                            <p className="text-xs text-slate-500 mb-1">Contribution data storage</p>
                            <a href="#" className="text-sm font-mono text-blue-300 break-all hover:underline" title={winner.arweaveTxId}>
                                {winner.arweaveTxId.substring(0,18)}...
                            </a>
                        </div>
                        <div className="flex-1 bg-slate-700/50 p-4 rounded-lg">
                            <p className="text-sm text-slate-400 mb-2">AO Message ID</p>
                            <p className="text-xs text-slate-500 mb-1">Judge verification link</p>
                            <a href="#" className="text-sm font-mono text-orange-300 break-all hover:underline" title={winner.aoMessageId}>
                                {winner.aoMessageId.substring(0,18)}...
                            </a>
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 mb-2 text-sm">Contribution Data</p>
                        <div className="max-h-48 overflow-y-auto bg-slate-900/70 p-4 rounded-md custom-scrollbar">
                            <p className="text-slate-300 whitespace-pre-wrap font-light">{winner.contribution}</p>
                        </div>
                    </div>
                    <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            <p className="text-green-300 font-semibold text-sm">🔒 TEE Protected Attestation</p>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">This evaluation was verified in a Trusted Execution Environment</p>
                        <p className="text-sm font-mono text-green-200 bg-slate-900/50 p-2 rounded break-all">{winner.attestation}</p>
                        <p className="text-xs text-slate-500 mt-2">✓ Cryptographically verified • ✓ Tamper-proof evaluation • ✓ Privacy preserved</p>
                    </div>
                </div>

                 <div className="mt-6 pt-4 border-t border-slate-700 text-right">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


const CompetitionPage: React.FC<CompetitionPageProps> = ({ figures, onBack }) => {
    const [selectedFigureId, setSelectedFigureId] = useState<string>(figures[0]?.id || '');
    const [contributionText, setContributionText] = useState('');
    const [fileName, setFileName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
            setContributionText(''); // Clear text input if a file is selected
        } else {
            setFileName('');
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContributionText(e.target.value);
        if (fileName) {
            setFileName(''); // Clear file if user starts typing
            const fileInput = document.getElementById('competition-file-upload') as HTMLInputElement;
            if(fileInput) fileInput.value = '';
        }
    };

    const handleContributionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const selectedFigure = figures.find(f => f.id === selectedFigureId);
        if (!selectedFigure) {
            alert('Please select a valid figure.');
            return;
        }
        
        if (!aoService.isWalletConnected()) {
            alert('Please connect your Arweave wallet to submit contributions.');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            let result;
            
            if (fileName) {
                // Handle file submission
                const fileInput = document.getElementById('competition-file-upload') as HTMLInputElement;
                const file = fileInput?.files?.[0];
                
                if (file) {
                    const fileContent = await file.text();
                    result = await aoService.submitFileForEvaluation(selectedFigure, fileContent, fileName);
                }
            } else if (contributionText.trim()) {
                // Handle text submission
                result = await aoService.submitPromptForEvaluation(selectedFigure, contributionText.trim());
            }
            
            if (result?.success) {
                alert(`🎉 Success! Your contribution for ${selectedFigure.name} has been submitted to their agent process.\n\nMessage ID: ${result.messageId}\n\nSubmission will be evaluated by AI agents for quality and authenticity.`);
                
                // Clear form
                setContributionText('');
                setFileName('');
                const fileInput = document.getElementById('competition-file-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            } else {
                alert(`❌ Error submitting contribution: ${result?.error || 'Unknown error'}\n\nPlease try again or check your wallet connection.`);
            }
        } catch (error) {
            console.error('Competition submission error:', error);
            alert('❌ Unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSubmittable = contributionText.trim().length > 0 || fileName !== '';

    return (
        <>
            <div className="max-w-6xl mx-auto animate-fade-in">
                <div className="flex items-center mb-6">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700/50 transition-colors mr-3">
                        <BackArrowIcon />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold">AI-Judged Contribution Center</h2>
                        <p className="text-slate-400 mt-1">Submissions evaluated by AI agents • Permanent Arweave storage</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-slate-800/50 rounded-xl shadow-2xl p-6 sm:p-8">
                            <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                                <h4 className="text-blue-300 font-semibold mb-2">🤖 How AI Judging Works</h4>
                                <p className="text-slate-300 text-sm mb-2">
                                    Advanced AI agents evaluate submissions based on authenticity, quality, and relevance to the digital twin's persona.
                                </p>
                                <p className="text-slate-300 text-sm">
                                    <strong>Arweave Permanent Storage:</strong> All approved contributions are permanently stored on the Arweave blockchain, ensuring your data remains accessible forever.
                                </p>
                            </div>
                            
                            <p className="text-slate-400 mb-6">
                                Submit high-quality persona data to improve digital twins. AI agents score submissions automatically, and top contributors earn APUS token rewards.
                            </p>

                            <form onSubmit={handleContributionSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="figure-select" className="block text-sm font-medium text-slate-300 mb-2">
                                        1. Select a Digital Twin to contribute to
                                    </label>
                                    <select
                                        id="figure-select"
                                        value={selectedFigureId}
                                        onChange={(e) => setSelectedFigureId(e.target.value)}
                                        className="w-full bg-slate-700/80 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    >
                                        {figures.map(figure => (
                                            <option key={figure.id} value={figure.id}>
                                                {figure.name} - {figure.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="contribution-text" className="block text-sm font-medium text-slate-300 mb-2">
                                        2. Provide persona data
                                    </label>
                                    <textarea
                                        id="contribution-text"
                                        rows={10}
                                        className="w-full bg-slate-700/80 rounded-md p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="Paste text, dialogue, interview transcripts, or any other relevant data here..."
                                        value={contributionText}
                                        onChange={handleTextChange}
                                    />
                                </div>
                                
                                <div className="relative text-center text-slate-400 text-sm">
                                    <span className="px-2 bg-slate-800">or upload a file</span>
                                    <div className="absolute top-1/2 left-0 w-full h-px bg-slate-700 -z-10"></div>
                                </div>

                                <div>
                                    <label htmlFor="competition-file-upload" className="w-full cursor-pointer bg-slate-700/80 hover:bg-slate-700 transition-colors rounded-md p-3 flex items-center justify-center font-medium text-slate-300">
                                        <FileUploadIcon />
                                        {fileName || "Upload a .txt file"}
                                    </label>
                                    <input id="competition-file-upload" type="file" className="hidden" accept=".txt" onChange={handleFileChange} />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full p-3 rounded-full bg-blue-600 text-white font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                                    disabled={!isSubmittable || isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting to AO...' : 'Submit for AI Evaluation'}
                                </button>
                                <p className="text-xs text-slate-500 text-center mt-2">
                                    {aoService.isWalletConnected() ? 
                                        'Submissions will be automatically evaluated by AI agents and stored on Arweave if approved' :
                                        '⚠️ Connect your Arweave wallet to submit contributions'
                                    }
                                </p>
                            </form>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                         <WinnersHistory onWinnerClick={setSelectedWinner} />
                    </div>
                </div>
            </div>
            {selectedWinner && (
                <WinnerDetailModal winner={selectedWinner} onClose={() => setSelectedWinner(null)} />
            )}
        </>
    );
};

export default CompetitionPage;
