import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generatePrivateTwinDataset } from "../../services/privateTwinDatasetService";
import {
  loadPrivateTwinWorkspace,
  savePrivateTwinWorkspace,
} from "../../services/twitterApiService";
import { PrivateTwinDataset, PrivateTwinWorkspace } from "../../types/app";

const cardClassName = "border border-border bg-white p-5";

export const PrivateTwinReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<PrivateTwinWorkspace | null>(() =>
    loadPrivateTwinWorkspace()
  );
  const [dataset, setDataset] = useState<PrivateTwinDataset | null>(
    workspace?.dataset || null
  );
  const [isGenerating, setIsGenerating] = useState(!workspace?.dataset);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentWorkspace = loadPrivateTwinWorkspace();
    if (!currentWorkspace) {
      navigate("/");
      return;
    }

    setWorkspace(currentWorkspace);
    if (currentWorkspace.dataset) {
      setDataset(currentWorkspace.dataset);
      setIsGenerating(false);
      return;
    }

    let cancelled = false;
    const run = async () => {
      setIsGenerating(true);
      setError("");
      try {
        const generated = await generatePrivateTwinDataset(currentWorkspace.raw);
        if (cancelled) {
          return;
        }

        const nextWorkspace = { ...currentWorkspace, dataset: generated };
        savePrivateTwinWorkspace(nextWorkspace);
        setWorkspace(nextWorkspace);
        setDataset(generated);
      } catch (generationError) {
        if (cancelled) {
          return;
        }
        setError(
          generationError instanceof Error
            ? generationError.message
            : "Failed to generate training dataset."
        );
      } finally {
        if (!cancelled) {
          setIsGenerating(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const raw = workspace?.raw;

  const trainingPreview = useMemo(() => {
    if (!dataset) {
      return "";
    }

    return dataset.trainingExamples
      .slice(0, 4)
      .map((example) => JSON.stringify(example))
      .join("\n");
  }, [dataset]);

  if (!raw) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-0">
      <div className={cardClassName}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              Private Twin Data Prep
            </p>
            <h1 className="mt-2 text-3xl font-bold">{raw.profile.name}</h1>
            <p className="mt-1 text-sm text-neutral-500">@{raw.profile.userName}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="border border-border px-4 py-3 text-xs font-bold uppercase tracking-widest text-neutral-700 transition hover:bg-neutral-50"
            >
              Back
            </button>
            <button
              onClick={() => navigate("/private/chat")}
              disabled={!dataset}
              className="bg-black px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              Go To Chat
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-6">
          <section className={cardClassName}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Fetched Public Data</h2>
              <span className="text-xs uppercase tracking-widest text-neutral-500">
                {raw.posts.length} posts
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="border border-neutral-200 p-4">
                <p className="text-xs uppercase tracking-widest text-neutral-500">Profile</p>
                <p className="mt-3 text-sm"><strong>Bio:</strong> {raw.profile.bio || "N/A"}</p>
                <p className="mt-2 text-sm"><strong>Location:</strong> {raw.profile.location || "N/A"}</p>
                <p className="mt-2 text-sm"><strong>Followers:</strong> {raw.profile.followers?.toLocaleString() || "N/A"}</p>
                <p className="mt-2 text-sm"><strong>Input Link:</strong> {raw.sourceLink}</p>
              </div>

              <div className="border border-neutral-200 p-4">
                <p className="text-xs uppercase tracking-widest text-neutral-500">User Context</p>
                <p className="mt-3 text-sm whitespace-pre-wrap">
                  {raw.personalContext || "No extra context provided."}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {raw.posts.slice(0, 12).map((post, index) => (
                <article key={post.id} className="border border-neutral-200 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                      Post {index + 1}
                    </span>
                    <span className="text-xs text-neutral-400">{post.createdAt || "Unknown date"}</span>
                  </div>
                  <p className="text-sm leading-6 text-neutral-800">{post.text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className={cardClassName}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Training Dataset</h2>
              <span className="text-xs uppercase tracking-widest text-neutral-500">
                {isGenerating ? "Generating" : dataset ? "Ready" : "Waiting"}
              </span>
            </div>

            {isGenerating && (
              <div className="mt-4 border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-semibold">Running one round of data cleaning and synthesis...</p>
                <p className="mt-2 text-sm text-neutral-600">
                  The LLM is distilling voice traits, building a production prompt, and generating standard fine-tune chat examples.
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {dataset && (
              <div className="mt-4 space-y-4">
                <div className="border border-neutral-200 p-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">Persona Summary</p>
                  <p className="mt-3 text-sm leading-6 text-neutral-800">{dataset.personaSummary}</p>
                </div>

                <div className="border border-neutral-200 p-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">Style Guide</p>
                  <div className="mt-3 space-y-2 text-sm text-neutral-800">
                    {dataset.styleGuide.map((rule, index) => (
                      <p key={`${rule}-${index}`}>{index + 1}. {rule}</p>
                    ))}
                  </div>
                </div>

                <div className="border border-neutral-200 p-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">Dataset Stats</p>
                  <p className="mt-3 text-sm text-neutral-800">
                    {dataset.trainingExamples.length} examples generated with model {dataset.model || "unknown"}.
                  </p>
                  <p className="mt-2 text-sm text-neutral-800">
                    Timestamp: {dataset.generatedAt}
                  </p>
                </div>

                <div className="border border-neutral-200 p-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">Fine-Tune Preview</p>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5 text-neutral-800">
                    {trainingPreview}
                  </pre>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
