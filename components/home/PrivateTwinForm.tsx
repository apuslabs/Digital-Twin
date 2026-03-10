import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  extractXUsername,
  fetchPrivateTwinData,
  savePrivateTwinWorkspace,
} from "../../services/twitterApiService";

export const PrivateTwinForm: React.FC = () => {
  const navigate = useNavigate();
  const [xLink, setXLink] = useState("");
  const [personalInfo, setPersonalInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    const userName = extractXUsername(xLink);
    if (!userName) {
      setError("Enter a valid X profile link or username.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const raw = await fetchPrivateTwinData(xLink, personalInfo);
      savePrivateTwinWorkspace({ raw });
      navigate("/private/review");
    } catch (fetchError) {
      console.error("Failed to create private twin workspace", fetchError);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to fetch X profile data."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-border p-6 sm:p-8 max-w-2xl mx-auto w-full animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Create Your Private Digital Twin</h2>
        <p className="text-neutral-500 text-sm">
          Start with a public X profile, then review cleaned data and generated fine-tune examples before chat.
        </p>
      </div>

      <form onSubmit={handleStartTraining} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold uppercase tracking-wider text-neutral-700 font-mono">
            X (Twitter) Profile Link
          </label>
          <input
            type="text"
            placeholder="https://x.com/yourusername"
            className="w-full p-3 border border-border focus:outline-none focus:ring-1 focus:ring-black font-mono text-sm"
            value={xLink}
            onChange={(e) => setXLink(e.target.value)}
          />
        </div>

        {error && (
          <div className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

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
          disabled={isLoading}
          className="w-full py-4 px-6 bg-black text-white font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-400"
        >
          {isLoading ? "Fetching Profile..." : "Start Training My Twin"}
        </button>
      </form>
    </div>
  );
};
