import React, { useState, useEffect } from "react";

export const Footer: React.FC = () => {
  const [utcTime, setUtcTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now.toISOString().split("T")[0]);
      setUtcTime(now.toISOString().split("T")[1].split(".")[0] + " UTC");
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="mx-auto px-4 py-2 font-mono border-t border-border">
      <div className="max-w-[2000px] mx-auto text-xs text-neutral-600">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span>{currentDate}</span>
            <span>{utcTime}</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://apus.network"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 transition-colors"
            >
              APUS
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 transition-colors"
            >
              X
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
