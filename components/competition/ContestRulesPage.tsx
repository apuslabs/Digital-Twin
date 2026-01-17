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

const styles = `
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 2px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a3a3a3; }
`;

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
    title: "Weekly review",
    detail: "Entries are reviewed by the Fwd Research marketing team each week.",
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
    <>
      <style>{styles}</style>
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
          <div className="hidden sm:flex items-center justify-center gap-4">
            <img
              src="/resources/Twin_Logo.svg"
              alt="Twin"
              className="h-4 w-auto"
            />
            <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500 translate-y-[1px]">
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
                The Fwd Research marketing team will review submissions for creativity,
                humor, and category fit, then highlight standout posts.
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
          <div className="max-h-[60vh] overflow-y-auto space-y-4 text-xs text-neutral-800 pr-2 custom-scrollbar">
            <div>
              <h3 className="font-semibold text-sm">Contest Sponsor</h3>
              <p className="mt-1">
                This contest is sponsored by Forward Research, Inc. ("Sponsor" or "FWD"). The contest is void where prohibited by law.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm">Eligibility Requirements</h3>
              <div className="mt-1">
                <h4 className="font-medium">Who Can Enter:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Anyone 13+ years old worldwide</li>
                  <li>Entrants under the age of majority in their jurisdiction must have consent from a parent or legal guardian to enter and accept any prize</li>
                  <li>Multiple submissions allowed (maximum 3 per person per week)</li>
                  <li>All submissions must be original content created by the entrant</li>
                </ul>
                <h4 className="font-medium mt-3">Ineligible Participants:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Employees and contractors of Forward Research, Inc. and its affiliated entities</li>
                  <li>Immediate family members of FWD employees and contractors</li>
                  <li>Anyone involved in administering the contest or serving on the Fwd Research marketing team review panel</li>
                </ul>
                <h4 className="font-medium mt-3">Geographic Restrictions:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>The contest is void in any jurisdiction where prohibited by law or subject to local registration requirements</li>
                  <li>The contest is not open to residents of countries or regions subject to comprehensive sanctions administered by Office of Foreign Assets Control ("OFAC"), including but not limited to Cuba, Iran, North Korea, Syria, Russia, Belarus, and the Crimea, Donetsk, and Luhansk regions of Ukraine, and any other jurisdiction subject to U.S., U.K., E.U., or U.N. sanctions</li>
                  <li>Entrants must not appear on any sanctions lists, including OFAC's Specially Designated Nationals (SDN) List</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm">Prize Distribution</h3>
              <div className="mt-1">
                <h4 className="font-medium">Payment Terms:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Winners will be notified via direct message from the @aoTheComputer account</li>
                  <li>Winners have 5 days to respond with a valid Arweave-compatible wallet address</li>
                  <li>Prize amounts represent dollar-equivalent values paid in $AR tokens based on market price at time of distribution</li>
                  <li>Prizes will be distributed within 7 days of receiving wallet address</li>
                  <li>Unclaimed prizes (no response within 5 days) will be forfeited</li>
                  <li>No substitution or transfer of prizes is permitted</li>
                  <li>Team submissions must designate a single recipient; prize splits are the responsibility of the team</li>
                </ul>
                <h4 className="font-medium mt-3">Wallet Compatibility:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Winners must provide an Arweave-compatible wallet address capable of receiving $AR tokens</li>
                  <li>Recommended wallets include Arweave-compatible wallets such as Wander, ArConnect, or similar</li>
                  <li>Sponsor is not responsible if winnings cannot be delivered due to incompatible wallet addresses</li>
                </ul>
                <h4 className="font-medium mt-3">Prize Volatility:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Prize amounts are denominated in USD but paid in $AR tokens</li>
                  <li>The $AR token amount will be calculated based on the market price at the time of distribution</li>
                  <li>Winners accept that the USD value of $AR tokens may fluctuate after receipt</li>
                </ul>
                <h4 className="font-medium mt-3">Tax Obligations:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Winners are solely responsible for any applicable taxes, fees, or reporting obligations associated with prize receipt</li>
                  <li>Prizes are awarded "as is" with no warranty or guarantee, express or implied</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm">Content Guidelines</h3>
              <div className="mt-1">
                <h4 className="font-medium">Allowed Content:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Original conversations and responses from twin.ar.io characters</li>
                  <li>Creative framing and context for character responses</li>
                  <li>Humorous, absurd, or unexpected interactions</li>
                  <li>Educational or philosophical content derived from character conversations</li>
                  <li>Multiple formats (images, screenshots, creative edits)</li>
                </ul>
                <h4 className="font-medium mt-3">Prohibited Content:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Price speculation or financial advice</li>
                  <li>Sexual, offensive, or discriminatory content</li>
                  <li>Political content unrelated to technology or philosophy</li>
                  <li>Plagiarized, stolen, or non-original content</li>
                  <li>Spam or low-effort posts</li>
                  <li>Content promoting competing platforms or services</li>
                  <li>Defamatory or libelous content</li>
                  <li>Content that violates any applicable laws or regulations</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm">Intellectual Property & License Grant</h3>
              <div className="mt-1">
                <h4 className="font-medium">Original Content Requirement:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>All submissions must be original content created by the entrant</li>
                  <li>Entrants confirm they own all rights to their submission or have obtained necessary permissions</li>
                  <li>Submissions must not infringe on any third-party intellectual property rights</li>
                </ul>
                <h4 className="font-medium mt-3">License Grant:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>By entering, participants grant Forward Research, Inc. a perpetual, worldwide, royalty-free, non-exclusive license to use, reproduce, distribute, display, and create derivative works from submitted content in connection with the campaign and related promotional efforts</li>
                  <li>Entrants retain ownership of their original content</li>
                  <li>The Sponsor may use winning submissions in marketing materials, social media, and other promotional contexts</li>
                </ul>
                <h4 className="font-medium mt-3">Platform Compliance:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>All submissions must comply with X (formerly Twitter) platform guidelines and terms of service</li>
                  <li>All submissions must comply with twin.ar.io terms of use</li>
                  <li>Violation of platform rules may result in disqualification</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm">Contest Administration</h3>
              <div className="mt-1">
                <h4 className="font-medium">No Purchase Necessary:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>No purchase or payment of any kind is necessary to enter or win this contest</li>
                  <li>Participation in conversations on twin.ar.io is free</li>
                </ul>
                <h4 className="font-medium mt-3">Rule Modifications:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>The Sponsor reserves the right to modify contest rules with 24-hour notice posted on official channels (@aoTheComputer, @ArweaveEco)</li>
                  <li>Material changes will be communicated through official social media accounts</li>
                </ul>
                <h4 className="font-medium mt-3">Disqualification:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>The Sponsor reserves the right to disqualify any entry that violates contest rules, contains prohibited content, or is otherwise deemed inappropriate</li>
                  <li>The Sponsor may disqualify participants who engage in fraudulent behavior, gaming the system, or other bad-faith conduct</li>
                  <li>Decisions regarding disqualification are final and at the sole discretion of the Sponsor</li>
                </ul>
                <h4 className="font-medium mt-3">Selection Process:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Winners are selected by the FWD marketing team based on creativity, humor, unexpectedness, and alignment with contest categories</li>
                  <li>Selection criteria are subjective and at the discretion of the Fwd Research marketing team</li>
                  <li>The Sponsor's decisions regarding winner selection are final and binding</li>
                </ul>
                <h4 className="font-medium mt-3">Dispute Resolution:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>All disputes, claims, and causes of action arising out of or connected with this contest shall be resolved individually, without resort to any form of class action</li>
                  <li>All issues and questions concerning the construction, validity, interpretation, and enforceability of these rules shall be governed by the laws of the jurisdiction where Forward Research, Inc. is headquartered</li>
                </ul>
                <h4 className="font-medium mt-3">Limitation of Liability:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>The Sponsor is not responsible for technical failures, network outages, or any issues with X platform or twin.ar.io that may affect participation</li>
                  <li>The Sponsor is not liable for any damages or losses related to contest participation or prize receipt</li>
                  <li>Participants agree to release and hold harmless the Sponsor from any claims arising from contest participation</li>
                </ul>
                <h4 className="font-medium mt-3">Data Privacy:</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Winner information (X handles, wallet addresses) will be used solely for prize distribution purposes</li>
                  <li>The Sponsor will not share or sell participant data to third parties</li>
                  <li>Participants should review X platform and Arweave ecosystem privacy policies independently</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm">Publicity Release</h3>
              <p className="mt-1">
                By accepting a prize, winners consent to the use of their name, X handle, and winning submission for publicity purposes without additional compensation, except where prohibited by law.
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </div>
    </>
  );
};

export default ContestRulesPage;
