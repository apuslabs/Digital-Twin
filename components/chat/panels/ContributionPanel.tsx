import React, { useState } from "react";
import { Figure } from "../../../types";
import { aoService, QueryResult } from "../../../services/LegacyAOService";
import TEEService from "../../../services/teeService";
import Modal from "../../common/Modal";
import ContributionDetailCard from "../ContributionDetailCard";
import { trackPromptSubmissionWithReward } from "../../../services/analytics";
import { UsersIcon, FileUploadIcon } from "../icons";

interface ContributionPanelProps {
  figure: Figure;
  hideTitle?: boolean;
}

type SubmitStatus = "success" | "error" | "info";

export const ContributionPanel: React.FC<ContributionPanelProps> = ({
  figure,
  hideTitle = false,
}) => {
  const [promptSuggestion, setPromptSuggestion] = useState("");
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("info");
  const [submitMsg, setSubmitMsg] = useState<{
    title: string;
    body: string;
  } | null>(null);
  const [lastReference, setLastReference] = useState<string | null>(null);

  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [attestationData, setAttestationData] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  const getEvaluationResult = (result: QueryResult) => {
    return result?.data?.evaluation || result?.data?.result;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("");
    }
  };

  const handleQueryResult = async () => {
    if (!lastReference) {
      alert("No submission found to query.");
      return;
    }

    try {
      const result = await aoService.queryTaskResult(
        figure.processId,
        lastReference
      );

      if (!result.success) {
        alert(`Error: ${result.error || "Failed to query task result"}`);
        return;
      }

      setQueryResult(result);

      if (result.status === "done") {
        const evaluationResult = getEvaluationResult(result);

        if (
          evaluationResult &&
          evaluationResult.score &&
          evaluationResult.reasoning
        ) {
          const attestationPromise = TEEService.getAttestation(lastReference);
          const walletPromise = aoService.getWalletAddress();

          setIsResultModalOpen(true);

          try {
            const [attestationResult, walletAddr] = await Promise.all([
              attestationPromise,
              walletPromise,
            ]);
            setAttestationData(attestationResult);
            setWalletAddress(walletAddr || "");

            if (evaluationResult.reward_amount) {
              trackPromptSubmissionWithReward({
                characterName: figure.name,
                rewardAmount: evaluationResult.reward_amount,
              });
            }
          } catch (error) {
            console.error("Failed to fetch attestation or wallet data:", error);
            const errorData = { error: "Failed to fetch attestation data" };
            setAttestationData(errorData);
          }

          return;
        }
      }

      setIsResultModalOpen(true);
    } catch (error) {
      console.error("Error querying task result:", error);
      alert("Failed to query task result. See console for details.");
    }
  };

  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!aoService.isWalletConnected()) {
      setSubmitMsg({
        title: "Wallet Required",
        body: "Please connect your Arweave wallet to submit contributions.",
      });
      setSubmitStatus("info");
      setIsSubmitModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      let result;

      if (fileName) {
        const fileInput = document.getElementById(
          "file-upload"
        ) as HTMLInputElement;
        const file = fileInput?.files?.[0];

        if (file) {
          const fileContent = await file.text();
          result = await aoService.submitPromptForEvaluation(
            figure,
            fileContent
          );
        }
      } else if (promptSuggestion.trim()) {
        result = await aoService.submitPromptForEvaluation(
          figure,
          promptSuggestion.trim()
        );
      }

      if (result?.success) {
        setLastReference(result.reference || null);
        setLastMessageId(result.messageId || null);
        setSubmitMsg({
          title: "Success",
          body: `Your contribution has been submitted to ${figure.name}'s agent process for AI evaluation.\n\nMessage ID: ${result.messageId}\n\nYour submission will be reviewed by AI agents and integrated if approved.`,
        });
        setSubmitStatus("success");
        setIsSubmitModalOpen(true);

        setPromptSuggestion("");
        setFileName("");
        const fileInput = document.getElementById(
          "file-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        setSubmitMsg({
          title: "Submission Error",
          body: `Error submitting contribution: ${
            result?.error || "Unknown error"
          }\n\nPlease try again or check your wallet connection.`,
        });
        setSubmitStatus("error");
        setIsSubmitModalOpen(true);
      }
    } catch (error) {
      console.error("Contribution submission error:", error);
      setSubmitMsg({
        title: "Unexpected Error",
        body: "An unexpected error occurred. Please try again.",
      });
      setSubmitStatus("error");
      setIsSubmitModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full relative border border-neutral-300 bg-white p-4 self-start text-neutral-900">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#000 0px,#000 1px,transparent 1px,transparent 8px),repeating-linear-gradient(-45deg,#000 0px,#000 1px,transparent 1px,transparent 8px)",
            backgroundSize: "12px 12px, 12px 12px",
          }}
        />

        <div className="relative space-y-3">
          {!hideTitle && (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 mr-2"></div>
              <h3 className="text-xs font-semibold tracking-wide uppercase text-neutral-700">
                Improve this Digital Twin
              </h3>
            </div>
          )}

          <div className="p-3 border border-neutral-300 bg-white/80">
            <p className="text-[11px] font-semibold mb-1 tracking-wide text-neutral-600 uppercase">
              Community
            </p>
            <p className="text-sm text-neutral-800 flex items-center">
              <UsersIcon />
              <span>
                Join <strong>{figure.contributors.toLocaleString()}</strong>{" "}
                other contributors!
              </span>
            </p>
          </div>

          <div className="p-3 border border-pink-500/30 bg-pink-50">
            <p className="text-[11px] font-semibold mb-1 tracking-wide text-pink-700 uppercase flex items-center gap-2">
              <span className="ph ph-[robot]"></span>
              AI-Powered Quality Control
            </p>
            <p className="text-[12px] text-pink-900/90 mb-2">
              Your contributions are evaluated by AI agents for authenticity and
              quality before being integrated.
            </p>
            <p className="text-[12px] text-pink-900/90">
              <strong className="font-semibold">Arweave Storage:</strong>{" "}
              Approved contributions become part of the permanent digital twin
              stored forever on Arweave.
            </p>
          </div>

          <form onSubmit={handleContributionSubmit} className="space-y-3">
            <div className="p-3 border border-neutral-300 bg-white/80 space-y-2">
              <p className="text-[11px] font-semibold tracking-wide text-neutral-600 uppercase">
                Suggest persona improvements
              </p>
              <textarea
                id="prompt-suggestion"
                rows={5}
                className="w-full border border-neutral-300 bg-white p-2 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all text-sm"
                placeholder={`e.g., "When discussing technology, ${figure.name} should reference specific innovations and speak with technical precision..."`}
                value={promptSuggestion}
                onChange={(e) => setPromptSuggestion(e.target.value)}
              />
            </div>

            <div className="relative text-center text-neutral-500 text-[11px]">
              <span className="px-2 bg-white">or</span>
              <div className="absolute top-1/2 left-0 w-full h-px bg-neutral-300 -z-10"></div>
            </div>

            <div className="p-3 border border-neutral-300 bg-white/80">
              <label
                htmlFor="file-upload"
                className="w-full cursor-pointer p-2 flex items-center justify-center text-sm font-medium text-neutral-700 bg-transparent border border-neutral-300 hover:bg-neutral-50 transition-colors"
              >
                <FileUploadIcon />
                {fileName || "Upload a .txt file"}
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".txt"
                onChange={handleFileChange}
              />
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-blue-600 text-white font-semibold disabled:bg-neutral-300 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={
                (!promptSuggestion.trim() && !fileName) ||
                isSubmitting ||
                !figure.processId
              }
            >
              {isSubmitting ? "Submitting to AO..." : "Submit for AI Review"}
            </button>
            <p className="text-[11px] text-neutral-600 text-center">
              {!figure.processId ? (
                <span className="inline-flex items-center gap-1 text-red-600">
                  <span className="ph ph-[warning]"></span>This figure is not
                  available for contributions yet
                </span>
              ) : !aoService.isWalletConnected() ? (
                <span className="inline-flex items-center gap-1">
                  <span className="ph ph-[warning]"></span>Connect your Arweave
                  wallet to submit contributions
                </span>
              ) : (
                "AI agents will evaluate and integrate approved improvements into permanent Arweave-stored digital twin"
              )}
            </p>
          </form>
        </div>
      </div>

      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={submitMsg?.title || "Notice"}
      >
        {submitStatus === "success" ? (
          <>
            <div className="mb-3 p-3 border flex items-start gap-3 border-green-300 bg-green-50">
              <span
                className="ph ph-[check-circle] text-green-600 text-xl leading-none mt-0.5"
                aria-hidden
              ></span>
              <div className="text-sm text-neutral-900">
                <div className="font-semibold mb-1">Success</div>
                <pre className="whitespace-pre-wrap text-[13px] text-neutral-800">
                  {(submitMsg?.body || "").split("\n\n")[0]}
                </pre>
              </div>
            </div>
            <div className="p-3 border border-neutral-300 bg-white/80 mb-3">
              <div className="flex items-start gap-2 mb-2">
                <span
                  className="ph ph-[hash-straight] text-neutral-700"
                  aria-hidden
                ></span>
                <div className="text-[11px] text-neutral-500 uppercase tracking-wide">
                  Message ID
                </div>
              </div>
              <div className="font-mono text-sm text-neutral-900 break-all mb-2">
                {(submitMsg?.body || "")
                  .split("\n\n")[1]
                  ?.replace(/^Message ID:\s*/, "")}
              </div>
              <p className="text-[13px] text-neutral-700">
                {(submitMsg?.body || "").split("\n\n")[2] || ""}
              </p>
            </div>
          </>
        ) : (
          <div
            className={`mb-3 p-3 border flex items-start gap-3 ${
              submitStatus === "error"
                ? "border-red-300 bg-red-50"
                : "border-neutral-300 bg-white"
            }`}
          >
            <span
              className={`ph ${
                submitStatus === "error"
                  ? "ph-[x-circle] text-red-600"
                  : "ph-[info] text-neutral-700"
              } text-xl leading-none mt-0.5`}
              aria-hidden
            ></span>
            <div className="text-sm text-neutral-900">
              <div className="font-semibold mb-1">
                {submitMsg?.title || "Notice"}
              </div>
              <pre className="whitespace-pre-wrap text-[13px] text-neutral-800">
                {submitMsg?.body}
              </pre>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          {submitStatus === "success" && (
            <button
              onClick={handleQueryResult}
              className="px-4 py-2 border text-sm active:scale-95 transition border-blue-600 text-blue-700 bg-white hover:bg-blue-50"
            >
              Query Result
            </button>
          )}
          <button
            onClick={() => setIsSubmitModalOpen(false)}
            className={`px-4 py-2 border text-sm active:scale-95 transition ${
              submitStatus === "success"
                ? "border-green-600 text-green-700 bg-white hover:bg-green-50"
                : submitStatus === "error"
                ? "border-red-600 text-red-700 bg-white hover:bg-red-50"
                : "border-neutral-300 text-neutral-800 bg-white hover:bg-neutral-50"
            }`}
          >
            Close
          </button>
        </div>
      </Modal>

      {queryResult &&
        queryResult.status === "done" &&
        getEvaluationResult(queryResult) &&
        getEvaluationResult(queryResult)?.score &&
        getEvaluationResult(queryResult)?.reasoning && (
          <ContributionDetailCard
            isOpen={isResultModalOpen}
            onClose={() => setIsResultModalOpen(false)}
            title="Evaluation Result"
            data={{
              figureName: figure.name,
              date: new Date().toLocaleDateString(),
              aiScore: getEvaluationResult(queryResult)?.score,
              aoMessageId: lastMessageId || "",
              reasoning: getEvaluationResult(queryResult)?.reasoning,
              walletAddress: walletAddress,
              attestation: attestationData?.attestation,
              teeStatus: attestationData?.error
                ? "failed"
                : attestationData?.attestation
                ? "verified"
                : "verifying",
            }}
            mode="evaluation"
          />
        )}

      {queryResult &&
        (queryResult.status !== "done" ||
          (queryResult.status === "done" &&
            (!getEvaluationResult(queryResult) ||
              !getEvaluationResult(queryResult)?.score ||
              !getEvaluationResult(queryResult)?.reasoning))) && (
          <Modal
            isOpen={isResultModalOpen}
            onClose={() => setIsResultModalOpen(false)}
            title="Evaluation Status"
          >
            {queryResult.status === "pending" && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-neutral-600">Evaluation in progress...</p>
                <p className="text-sm text-neutral-500 mt-2">
                  The AI agent is currently processing your submission.
                </p>
              </div>
            )}

            {queryResult.status === "processing" && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-neutral-600">Evaluation in progress...</p>
                <p className="text-sm text-neutral-500 mt-2">
                  The AI agent is currently processing your submission.
                </p>
              </div>
            )}

            {queryResult.status === "done" &&
              !getEvaluationResult(queryResult) && (
                <div className="space-y-4">
                  <p className="text-neutral-600">
                    Evaluation completed but results could not be parsed.
                  </p>
                  <div>
                    <span className="text-sm font-medium">Raw Data:</span>
                    <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(queryResult.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

            {queryResult.error && (
              <div>
                <span className="text-sm font-medium text-red-600">Error:</span>
                <div className="mt-1 p-2 bg-red-50 rounded text-sm text-red-800">
                  {queryResult.error}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsResultModalOpen(false)}
                className="px-4 py-2 border border-neutral-300 text-neutral-800 bg-white hover:bg-neutral-50 text-sm active:scale-95 transition"
              >
                Close
              </button>
            </div>
          </Modal>
        )}
    </>
  );
};
