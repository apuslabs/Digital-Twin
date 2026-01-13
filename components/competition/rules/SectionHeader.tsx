import React from "react";

interface SectionHeaderProps {
  icon: string;
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title }) => {
  return (
    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-wide text-neutral-600">
      <span className={`ph ${icon} text-sm sm:text-base`}></span>
      {title}
    </div>
  );
};
