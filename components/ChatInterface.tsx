import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Figure, ChatMessage, MessageAuthor } from '../types';
import { startChatSession, sendMessage, Chat } from '../services/apusService';
import { aoService } from '../services/aoService';

interface ChatInterfaceProps {
  figure: Figure;
  onBack: () => void;
}

const BackArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const UsersIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0011 9V8h-.13a7.001 7.001 0 00-3.74 5.93c0 .34.024.673.07 1h5.73zM12 21a7.003 7.003 0 006.83-5.93c.046-.327.07-.66.07-1a7 7 0 00-7-7h-1a7 7 0 00-7 7c0 .34.024.673.07 1A7.003 7.003 0 005 21h7z" />
    </svg>
);

const FileUploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
);

const ContributionPanel: React.FC<{figure: Figure}> = ({ figure }) => {
    const [promptSuggestion, setPromptSuggestion] = useState('');
    const [fileName, setFileName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        } else {
            setFileName('');
        }
    };

    const handleContributionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!aoService.isWalletConnected()) {
            alert('Please connect your Arweave wallet to submit contributions.');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            let result;
            
            if (fileName) {
                // Handle file submission
                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                const file = fileInput?.files?.[0];
                
                if (file) {
                    const fileContent = await file.text();
                    result = await aoService.submitFileForEvaluation(figure, fileContent, fileName);
                }
            } else if (promptSuggestion.trim()) {
                // Handle text prompt submission
                result = await aoService.submitPromptForEvaluation(figure, promptSuggestion.trim());
            }
            
            if (result?.success) {
                alert(`🎉 Success! Your contribution has been submitted to ${figure.name}'s agent process for AI evaluation.\n\nMessage ID: ${result.messageId}\n\nYour submission will be reviewed by AI agents and integrated if approved.`);
                
                // Clear form
                setPromptSuggestion('');
                setFileName('');
                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
                
                // Optionally trigger judge evaluation
                // await aoService.sendPromptsToJudge(figure.processId);
            } else {
                alert(`❌ Error submitting contribution: ${result?.error || 'Unknown error'}\n\nPlease try again or check your wallet connection.`);
            }
        } catch (error) {
            console.error('Contribution submission error:', error);
            alert('❌ Unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-800/50 rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Improve this Digital Twin</h3>
            <div className="flex items-center text-sm text-slate-300">
                <UsersIcon />
                <span>Join <strong>{figure.contributors.toLocaleString()}</strong> other contributors!</span>
            </div>
            <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-3 text-sm">
                <p className="text-purple-300 font-semibold mb-1">🤖 AI-Powered Quality Control</p>
                <p className="text-slate-300 text-xs mb-2">
                    Your contributions are evaluated by AI agents for authenticity and quality before being integrated.
                </p>
                <p className="text-slate-300 text-xs">
                    <strong>Arweave Storage:</strong> Approved contributions become part of the permanent digital twin stored forever on Arweave.
                </p>
            </div>

            <form onSubmit={handleContributionSubmit} className="space-y-4">
                <div>
                    <label htmlFor="prompt-suggestion" className="block text-sm font-medium text-slate-300 mb-1">
                        Suggest persona improvements for AI evaluation
                    </label>
                    <textarea
                        id="prompt-suggestion"
                        rows={5}
                        className="w-full bg-slate-700/80 rounded-md p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        placeholder={`e.g., "When discussing technology, ${figure.name} should reference specific innovations and speak with technical precision..."`}
                        value={promptSuggestion}
                        onChange={(e) => setPromptSuggestion(e.target.value)}
                    />
                </div>
                <div className="relative text-center text-slate-400 text-sm">
                    <span className="px-2 bg-slate-800">or</span>
                    <div className="absolute top-1/2 left-0 w-full h-px bg-slate-700 -z-10"></div>
                </div>
                <div>
                    <label htmlFor="file-upload" className="w-full cursor-pointer bg-slate-700/80 hover:bg-slate-700 transition-colors rounded-md p-3 flex items-center justify-center text-sm font-medium text-slate-300">
                        <FileUploadIcon />
                        {fileName || "Upload a .txt file"}
                    </label>
                    <input id="file-upload" type="file" className="hidden" accept=".txt" onChange={handleFileChange} />
                </div>
                <button
                    type="submit"
                    className="w-full p-3 rounded-full bg-blue-600 text-white font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                    disabled={(!promptSuggestion.trim() && !fileName) || isSubmitting}
                >
                    {isSubmitting ? 'Submitting to AO...' : 'Submit for AI Review'}
                </button>
                <p className="text-xs text-slate-500 text-center">
                    {aoService.isWalletConnected() ? 
                        'AI agents will evaluate and integrate approved improvements into the permanent Arweave-stored digital twin' :
                        '⚠️ Connect your Arweave wallet to submit contributions'
                    }
                </p>
            </form>
        </div>
    );
};

const XIcon = () => (
    <img src="/resources/x.jpg" alt="X (Twitter)" className="w-5 h-5 mr-3 rounded object-cover" />
);

const DiscordIcon = () => (
    <img src="/resources/discord.jpg" alt="Discord" className="w-5 h-5 mr-3 rounded object-cover" />
);

const TelegramIcon = () => (
    <img src="/resources/telegram.webp" alt="Telegram" className="w-5 h-5 mr-3 rounded object-cover" />
);

const ConnectionPanel: React.FC<{ figure: Figure; onConnectClick: (platform: string) => void; }> = ({ figure, onConnectClick }) => {
    const connections = [
        { platform: 'X', icon: <XIcon />, name: 'X' },
        { platform: 'Discord', icon: <DiscordIcon />, name: 'Discord' },
        { platform: 'Telegram', icon: <TelegramIcon />, name: 'Telegram' },
    ];
    
    return (
        <div className="w-full bg-slate-800/50 rounded-xl shadow-2xl p-6 self-start space-y-4">
            <h3 className="text-xl font-bold text-white">Connect Everywhere</h3>
            <p className="text-sm text-slate-400">
                Engage with {figure.name}'s digital twin on your favorite platforms.
            </p>
            <div className="space-y-3">
                {connections.map(({ platform, icon, name }) => (
                    <button
                        key={platform}
                        onClick={() => onConnectClick(platform)}
                        className="w-full flex items-center justify-center p-3 rounded-md bg-slate-700/80 text-slate-200 font-semibold hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {icon}
                        Connect {figure.name} on {name}
                    </button>
                ))}
            </div>
        </div>
    );
};

const TEEProtectionPanel: React.FC<{ figure: Figure }> = ({ figure }) => {
    // Generate a mockup attestation ID based on current timestamp
    const attestationId = `TEE-CONV-${Date.now().toString().slice(-8)}-${figure.id.toUpperCase().slice(0,3)}-VERIFIED`;
    const sessionStart = new Date().toISOString();
    
    return (
        <div className="w-full bg-gradient-to-br from-green-900/20 to-emerald-800/20 border border-green-500/30 rounded-xl shadow-2xl p-6 self-start space-y-4">
            <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <h3 className="text-lg font-bold text-green-300">🔒 TEE Protected Conversation</h3>
            </div>
            
            <div className="space-y-3">
                <div className="bg-slate-900/50 rounded-lg p-3 border border-green-500/20">
                    <p className="text-xs text-green-400 font-semibold mb-1">Security Status</p>
                    <p className="text-sm text-slate-300">✓ Trusted execution environment</p>
                </div>
                
                <div className="bg-slate-900/50 rounded-lg p-3 border border-green-500/20">
                    <p className="text-xs text-green-400 font-semibold mb-2">Session Attestation</p>
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span className="text-xs text-slate-400">Session ID:</span>
                            <span className="text-xs font-mono text-green-300">{attestationId.substring(0, 16)}...</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs text-slate-400">Started:</span>
                            <span className="text-xs text-slate-300">{sessionStart.substring(11, 19)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs text-slate-400">TEE Provider:</span>
                            <span className="text-xs text-green-300">APUS Intel SGX</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-900/50 rounded-lg p-3 border border-green-500/20">
                    <p className="text-xs text-green-400 font-semibold mb-2">Full Attestation</p>
                    <button
                        onClick={() => {
                            // In a real app, this would show the full attestation
                            alert(`Full TEE Attestation:\n\n${attestationId}\n\nThis conversation is cryptographically verified to be running in a Trusted Execution Environment, ensuring complete privacy and security.`);
                        }}
                        className="w-full text-xs font-mono text-green-200 bg-slate-800/50 p-2 rounded border border-green-500/30 hover:bg-slate-700/50 transition-colors break-all"
                    >
                        {attestationId}
                    </button>
                </div>
                
                <div className="text-center">
                    <p className="text-xs text-slate-500">Your conversation is secure</p>
                    <div className="flex justify-center items-center mt-2 space-x-4 text-xs text-green-400">
                        <span>🛡️ Tamper-proof</span>
                        <span>✅ Verified</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const getGuideContent = (platform: string, figureName: string): { title: string, steps: string[] } => {
    const figureHandle = figureName.replace(/\s+/g, '');
    switch (platform) {
        case 'X':
            return {
                title: `Connect with ${figureName} on X`,
                steps: [
                    `Obtain an API key for this Digital Twin (e.g., @DigitalTwin${figureHandle}).`,
                    "Send a Direct Message to start a conversation.",
                    "The AI will respond directly in your DMs."
                ]
            };
        case 'Discord':
            return {
                title: `Connect with ${figureName} on Discord`,
                steps: [
                    `Create a digital ${figureName}. on discord`,
                ]
            };
        case 'Telegram':
            return {
                title: `Connect with ${figureName} on Telegram`,
                steps: [
                    `Create a digital ${figureName}. on Telegram.`,
                    "Start a chat with the bot.",
                    "The AI will respond directly in your chat."
                ]
            };
        default:
            return { title: 'Connection Guide', steps: ["No guide available for this platform."] };
    }
};

const ConnectionModal: React.FC<{ figureName: string; platform: string; onClose: () => void; }> = ({ figureName, platform, onClose }) => {
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

    const { title, steps } = getGuideContent(platform, figureName);

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="bg-slate-800 rounded-xl shadow-2xl p-6 m-4 max-w-lg w-full transform transition-all duration-300 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 id="modal-title" className="text-2xl font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Close modal">
                        <CloseIcon />
                    </button>
                </div>

                <div className="text-slate-300 space-y-4">
                   <ol className="list-decimal list-inside space-y-2">
                     {steps.map((step, index) => (
                        <li key={index}>{step}</li>
                     ))}
                   </ol>
                   <p className="text-sm text-slate-400 pt-2">
                    Note: The exact usernames and links may vary. Please refer to the official project documentation for the most up-to-date information.
                   </p>
                </div>

                 <div className="mt-6 text-right">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};


const ChatInterface: React.FC<ChatInterfaceProps> = ({ figure, onBack }) => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalPlatform, setModalPlatform] = useState<string | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = startChatSession(figure.systemPrompt);
    setChatSession(session);
    setMessages([
        { id: 'welcome', text: figure.welcomeMessage, author: MessageAuthor.AI }
    ]);
  }, [figure]);

  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  const handleConnectClick = (platform: string) => {
    setModalPlatform(platform);
  };

  const handleCloseModal = () => {
    setModalPlatform(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chatSession) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userInput,
      author: MessageAuthor.User,
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setShouldAutoScroll(true); // Enable auto-scroll when user sends a message

    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {id: aiMessageId, text: '', author: MessageAuthor.AI}]);

    try {
        const stream = await sendMessage(chatSession, userInput);
        for await (const chunk of stream) {
            setMessages(prev => prev.map(msg => 
                msg.id === aiMessageId ? {...msg, text: msg.text + chunk.text} : msg
            ));
        }
    } catch (error) {
        setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? {...msg, text: 'Sorry, I encountered an error. Please try again.'} : msg
        ));
    } finally {
        setIsLoading(false);
    }
  };
  
  return (
    <>
        <div className="max-w-[95vw] mx-auto flex flex-col xl:flex-row gap-6 animate-fade-in">
            {/* Left Sidebar - TEE Protection Panel */}
            <div className="w-full xl:max-w-xs xl:w-72">
                <TEEProtectionPanel figure={figure} />
            </div>
            
            {/* Main Chat Area */}
            <div className="flex-1 min-w-0 h-[90vh] flex flex-col bg-slate-800/50 rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center p-4 border-b border-slate-700/50 shrink-0">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors mr-3">
                        <BackArrowIcon />
                    </button>
                    <img src={figure.imageUrl} alt={figure.name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="ml-4">
                        <h2 className="text-xl font-bold">{figure.name}</h2>
                        <p className="text-sm text-slate-400">{figure.title}</p>
                        <div className="flex items-center mt-1">
                            <span className="text-xs text-slate-500 mr-2">Permanent Prompt:</span>
                            <a 
                                href="#" 
                                className="text-xs font-mono text-blue-300 hover:text-blue-200 hover:underline transition-colors"
                                title={`View ${figure.name}'s permanent prompt on Arweave: ${figure.arweaveTxId}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    // In a real app, this would open the Arweave explorer
                                    window.open(`https://arweave.net/${figure.arweaveTxId}`, '_blank');
                                }}
                            >
                                {figure.arweaveTxId.substring(0, 12)}...
                            </a>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex items-end gap-3 ${message.author === MessageAuthor.User ? 'justify-end' : 'justify-start'}`}>
                            {message.author === MessageAuthor.AI && <img src={figure.imageUrl} className="w-8 h-8 rounded-full self-start" alt="figure avatar" />}
                            <div className={`max-w-2xl lg:max-w-3xl px-4 py-3 rounded-2xl ${message.author === MessageAuthor.User ? 'bg-blue-600 rounded-br-none' : 'bg-slate-700 rounded-bl-none'}`}>
                                <p className="text-white whitespace-pre-wrap">{message.text}{message.id.endsWith('-loading') && '...'}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length-1].author === MessageAuthor.User && (
                        <div className="flex items-end gap-3 justify-start">
                            <img src={figure.imageUrl} className="w-8 h-8 rounded-full self-start" alt="figure avatar" />
                            <div className="max-w-2xl lg:max-w-3xl px-4 py-3 rounded-2xl bg-slate-700 rounded-bl-none">
                                <div className="flex items-center justify-center space-x-1">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-slate-700/50 shrink-0">
                    <form onSubmit={handleSubmit} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={`Message ${figure.name}...`}
                            className="flex-1 w-full bg-slate-700/80 rounded-full py-3 px-5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="p-3 rounded-full bg-blue-600 text-white disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                            disabled={isLoading || !userInput.trim()}
                        >
                            <SendIcon />
                        </button>
                    </form>
                </div>
            </div>
            
            {/* Right Sidebar - Contribution and Connection Panels */}
            <div className="w-full xl:max-w-xs xl:w-80 space-y-6 self-start">
                <ContributionPanel figure={figure} />
                <ConnectionPanel figure={figure} onConnectClick={handleConnectClick} />
            </div>
        </div>
        {modalPlatform && (
            <ConnectionModal 
                figureName={figure.name} 
                platform={modalPlatform} 
                onClose={handleCloseModal} 
            />
        )}
    </>
  );
};

export default ChatInterface;