import React from "react";

interface QuoteSectionProps {
  quote: string;
}

export const QuoteSection: React.FC<QuoteSectionProps> = ({ quote }) => {
  return (
    <div className="flex justify-center mb-4 sm:mb-6">
      <p className="text-center text-xl sm:text-2xl md:text-3xl font-quote font-normal text-neutral-700 max-w-lg">
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
};
