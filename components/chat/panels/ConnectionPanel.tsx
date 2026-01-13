import React from "react";
import { Figure } from "../../../types";
import { XIcon, DiscordIcon, TelegramIcon } from "../icons";

interface ConnectionPanelProps {
  figure: Figure;
  onConnectClick: (platform: string) => void;
  hideTitle?: boolean;
}

export const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  figure,
  onConnectClick,
  hideTitle = false,
}) => {
  const connections = [
    { platform: "X", icon: <XIcon />, name: "X" },
    { platform: "Discord", icon: <DiscordIcon />, name: "Discord" },
    { platform: "Telegram", icon: <TelegramIcon />, name: "Telegram" },
  ];

  return (
    <div className="w-full bg-slate-800/50 p-6 self-start space-y-4">
      {!hideTitle && <h3 className="text-xl font-bold ">Connect Everywhere</h3>}
      <p className="text-sm text-slate-400">
        Engage with {figure.name}'s digital twin on your favorite platforms.
      </p>
      <div className="space-y-3">
        {connections.map(({ platform, icon, name }) => (
          <button
            key={platform}
            onClick={() => onConnectClick(platform)}
            className="w-full flex items-center justify-center p-3 bg-slate-700/80 text-slate-200 font-semibold hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {icon}
            Connect {figure.name} on {name}
          </button>
        ))}
      </div>
    </div>
  );
};
