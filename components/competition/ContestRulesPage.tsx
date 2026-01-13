import React, { useMemo, useState } from "react";
import { CATEGORY_METADATA, ShareCategory } from "../../types";
import { TagOption } from "../../types/app";
import Modal from "../common/Modal";
import { XPostMock } from "../common/XPostMock";
import { SectionHeader } from "./rules/SectionHeader";
import { StepGuide } from "./rules/StepGuide";
import { ChecklistItem } from "./rules/ChecklistItem";
import { TimelineSection } from "./rules/TimelineSection";
import { QuoteSection } from "./rules/QuoteSection";
import { checklistItems } from "./rules/checklistData";

type ContestRulesPageProps = {
  onBackHome?: () => void;
  onStartRandom?: () => void;
};

const timeline = [
  {
    title: "Submissions open",
    detail: "Live during the competition window.",
  },
  {
    title: "Daily judging",
    detail: "AI agents score and highlight standout chats in real time.",
  },
  {
    title: "Winners posted",
    detail: "Top out-of-context moments published on twin.ar.io/outofcontext.",
  },
];

const ContestRulesPage: React.FC<ContestRulesPageProps> = ({
  onBackHome,
  onStartRandom,
}) => {
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

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

  return (
    <div className="sm:mx-auto max-w-2xl animate-fade-in text-neutral-900 px-0 py-0 sm:px-4">
      <div className="relative overflow-hidden sm:border sm:border-border bg-white pt-2 pb-4 px-4 sm:p-6 md:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#000 0px,#000 1px,transparent 1px,transparent 10px),repeating-linear-gradient(-45deg,#000 0px,#000 1px,transparent 1px,transparent 10px)",
            backgroundSize: "14px 14px, 14px 14px",
          }}
        />

        <div className="relative flex flex-col gap-4">
          <div className="hidden sm:flex items-center justify-center gap-2">
            <img
              src="/resources/Twin_Logo.svg"
              alt="Twin"
              className="h-4 w-auto"
            />
            <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              OUT OF CONTEXT
            </span>
          </div>
        </div>

        <div className="relative mt-4 sm:mt-8">
          <div>
            <div>
              <SectionHeader icon="ph-[sparkle]" title="How to enter" />
              <h2 className="mt-2 text-base sm:text-lg font-semibold">
                SHARE YOUR OUT OF CONTEXT MOMENTS ON X.
              </h2>
              <p className="mt-2 text-xs sm:text-xs text-neutral-700">
                AI judges score entries, category winners get highlighted, and
                the best posts live forever on Arweave.
              </p>
            </div>

            <StepGuide tagOptions={tagOptions} />

            <div className="mt-8 grayscale hover:grayscale-0 transition-[filter] duration-300">
              <XPostMock
                tagOptions={tagOptions}
                onClick={() => {
                  // Handler is managed inside XPostMock component
                }}
              />
            </div>
          </div>
        </div>

        {/* Checklist Section */}
        <div className="relative mt-8 sm:mt-10">
          <QuoteSection quote="The twins are requesting you to read through this checklist." />

          <div className="border border-border bg-white/70 p-4 md:p-5 shadow-sm backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {checklistItems.map((item) => (
                <ChecklistItem
                  key={item.id}
                  id={item.id}
                  icon={item.icon}
                  iconColor={item.iconColor}
                  title={item.title}
                  description={item.description}
                  isExpanded={expandedItem === item.id}
                  onToggle={() => {
                    setExpandedItem(expandedItem === item.id ? null : item.id);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-10">
          <div>
            <SectionHeader icon="ph-[calendar]" title="Timeline" />
            <TimelineSection items={timeline} />
          </div>
        </div>

        <div className="relative mt-10">
          <button
            type="button"
            onClick={() => onStartRandom?.()}
            className="relative flex min-h-[60px] sm:min-h-[auto] w-full items-center gap-3 border border-neutral-800 bg-neutral-900 p-4 sm:p-4 cursor-pointer text-left hover:bg-neutral-800 active:bg-neutral-800 touch-manipulation hover:shadow-lg hover:shadow-neutral-900/20 active:scale-[0.98] transition-[background-color,box-shadow,transform] duration-300 ease-out-circ overflow-hidden"
          >
            <img
              src="/resources/UI_loop.gif"
              className="absolute inset-0 w-full h-full object-cover object-[20%_65%] opacity-50 pointer-events-none"
              aria-hidden="true"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/60 via-neutral-900/50 to-neutral-900/60" />
            <div className="relative z-10 flex h-8 w-8 sm:h-6 sm:w-6 shrink-0 items-center justify-center text-white">
              <span className="ph ph-[rocket-launch] text-[16px] sm:text-[18px]" />
            </div>
            <div className="relative z-10 min-w-0 flex-1">
              <p className="text-xs sm:text-[11px] uppercase tracking-wide text-white">
                Start competition
              </p>
              <p className="mt-1 text-xs sm:text-xs text-neutral-200 leading-relaxed">
                Chat with a Digital Twin to generate your Out of Context card.
              </p>
            </div>
            <div className="relative z-10 flex items-center min-w-[24px] min-h-[24px] sm:min-w-0 sm:min-h-0 text-white">
              <span className="ph ph-[arrow-up-right] text-[16px] sm:text-[18px]" />
            </div>
          </button>
        </div>

        <div className="relative mt-4">
          <button
            type="button"
            onClick={() => setIsLegalOpen(true)}
            className="group relative flex min-h-[60px] sm:min-h-[auto] gap-3 border border-border bg-neutral-50 p-4 sm:p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] cursor-pointer text-left w-full hover:bg-neutral-100 active:bg-neutral-100 touch-manipulation hover:border-neutral-300 active:border-neutral-300 active:scale-[0.98] transition-[background-color,border-color,transform] duration-300 ease-out-circ"
          >
            <div className="flex h-8 w-8 sm:h-6 sm:w-6 shrink-0 items-center justify-center text-neutral-600">
              <span className="ph ph-[scales] text-[16px] sm:text-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-[11px] uppercase tracking-wide text-neutral-500">
                Legal requirements
              </p>
              <p className="mt-1 text-xs sm:text-xs text-neutral-700 leading-relaxed">
                Review terms and conditions before submitting.
              </p>
            </div>
            <div className="flex items-center min-w-[24px] min-h-[24px] sm:min-w-0 sm:min-h-0 text-neutral-600">
              <span className="ph ph-[arrow-up-right] text-[16px] sm:text-[18px]" />
            </div>
          </button>
        </div>

        <Modal
          isOpen={isLegalOpen}
          onClose={() => setIsLegalOpen(false)}
          title="Legal"
        >
          <div className="space-y-3 text-xs text-neutral-800">
            <p className="text-neutral-700">
              Placeholder legal requirements. Replace with final terms before
              launch.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-700">
              <li>
                By submitting content, you confirm you have the rights to share
                it and that it doesn&apos;t violate others&apos; rights.
              </li>
              <li>
                Do not submit personal data (including wallet addresses) or
                confidential information. You are responsible for redaction.
              </li>
              <li>
                Submissions may be reviewed, scored, and publicly displayed as
                part of the competition.
              </li>
              <li>
                Submissions must comply with applicable laws and must not
                include harassment, hate speech, or illegal content.
              </li>
              <li>
                The competition is provided &quot;as is&quot; without
                warranties. Organizers may modify rules or disqualify entries at
                any time.
              </li>
            </ul>
            <p className="text-[11px] text-neutral-500">
              Note: This copy is a mock. Add your official terms, privacy
              policy, eligibility, and licensing language.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ContestRulesPage;
