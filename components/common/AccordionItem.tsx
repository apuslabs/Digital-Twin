import React, { useState, useRef, useEffect } from "react";

interface AccordionItemProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  title,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        setHeight(isOpen ? contentRef.current.scrollHeight : 0);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [isOpen, children]);

  return (
    <div className="border border-border bg-white">
      <button
        type="button"
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-neutral-100 focus:outline-none"
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        id={`${id}-header`}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="text-xs">{title}</span>
        <span
          className={`transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden="true"
        >
          <ChevronIcon />
        </span>
      </button>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-header`}
        className="overflow-hidden"
        style={{ height, transition: "height 250ms ease" }}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
};

const ChevronIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
      clipRule="evenodd"
    />
  </svg>
);
