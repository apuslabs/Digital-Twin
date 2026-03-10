import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Category, Figure } from "../../types";
import { loadPrivateTwinWorkspace } from "../../services/twitterApiService";
import ChatInterface from "./ChatInterface";

export const PrivateTwinChatPage: React.FC = () => {
  const navigate = useNavigate();

  const selectedFigure = useMemo(() => {
    const workspace = loadPrivateTwinWorkspace();
    if (!workspace) {
      return null;
    }

    const { raw, dataset } = workspace;
    const { profile } = raw;
    const titleParts = [
      profile.bio,
      profile.location,
      profile.followers !== undefined ? `${profile.followers.toLocaleString()} followers` : "",
    ].filter(Boolean);

    return {
      id: "private",
      name: profile.name,
      title: titleParts.join(" · ") || `@${profile.userName}`,
      imageUrl: profile.profilePicture || "/resources/Twin_LogoMark.svg",
      category: Category.Tech,
      systemPrompt: dataset?.systemPrompt || raw.systemPrompt,
      welcomeMessage: raw.welcomeMessage,
      contributors: 0,
      processId: "",
      arweaveTxId: "",
      config: "{}",
    } satisfies Figure;
  }, []);

  if (!selectedFigure) {
    navigate("/");
    return null;
  }

  return (
    <ChatInterface
      figure={selectedFigure}
      onBack={() => navigate("/private/review")}
    />
  );
};
