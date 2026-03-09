import React, { useState, useEffect } from "react";

export const PrivateTwinForm: React.FC = () => {
  const [xLink, setXLink] = useState("");
  const [personalInfo, setPersonalInfo] = useState("");
  const [step, setStep] = useState<"idle" | "training" | "completed">("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (step === "training") {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep("completed");
            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleStartTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (xLink || personalInfo) {
      setStep("training");
      setProgress(0);
    }
  };

  return (
    <div className="bg-white border border-border p-6 sm:p-8 max-w-2xl mx-auto w-full animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Create Your Private Digital Twin</h2>
        <p className="text-neutral-500 text-sm">
          We use your X activity and context to fine-tune a personal LLM via LoRA.
        </p>
      </div>

      {step === "idle" && (
        <form onSubmit={handleStartTraining} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wider text-neutral-700 font-mono">
              X (Twitter) Profile Link
            </label>
            <input
              type="url"
              placeholder="https://x.com/yourusername"
              className="w-full p-3 border border-border focus:outline-none focus:ring-1 focus:ring-black font-mono text-sm"
              value={xLink}
              onChange={(e) => setXLink(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wider text-neutral-700 font-mono">
              Personal Context
            </label>
            <textarea
              rows={5}
              placeholder="Writing style, topics, traits..."
              className="w-full p-3 border border-border focus:outline-none focus:ring-1 focus:ring-black font-mono text-sm resize-none"
              value={personalInfo}
              onChange={(e) => setPersonalInfo(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 bg-black text-white font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all active:scale-[0.98]"
          >
            Start Training My Twin
          </button>
        </form>
      )}

      {step === "training" && (
        <div className="py-12 space-y-8">
          <div className="w-full bg-neutral-100 h-1 relative">
            <div 
              className="absolute top-0 left-0 h-full bg-black transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <div className="text-center">
            <p className="font-bold text-lg mb-1">Fine-tuning LoRA weights...</p>
            <p className="text-neutral-500 text-xs font-mono">{Math.round(progress)}% Complete</p>
          </div>
        </div>
      )}

      {step === "completed" && (
        <div className="py-12 text-center space-y-6">
          <div className="w-16 h-16 bg-neutral-100 flex items-center justify-center mx-auto rounded-full">
            <span className="text-2xl">✓</span>
          </div>
          <h3 className="text-2xl font-bold">Twin Ready!</h3>
          <button
            onClick={() => alert("Chat Ready!")}
            className="w-full py-4 px-6 bg-black text-white font-bold uppercase tracking-widest hover:bg-neutral-800"
          >
            Go to Private Chat
          </button>
        </div>
      )}
    </div>
  );
};
