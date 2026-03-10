import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Figure } from "../../types";
import { FIGURES } from "../../constants";
import ChatInterface from "./ChatInterface";

export const ChatPage: React.FC = () => {
  const { figureId } = useParams<{ figureId: string }>();
  const navigate = useNavigate();

  const selectedFigure = useMemo(() => {
    return FIGURES.find((f) => f.id === figureId) || null;
  }, [figureId]);

  if (!selectedFigure) {
    navigate("/");
    return null;
  }

  const handleBackToSelector = () => {
    navigate("/");
  };

  const handleNextTwin = () => {
    const currentIndex = FIGURES.findIndex((f) => f.id === selectedFigure.id);
    const nextIndex = (currentIndex + 1) % FIGURES.length;
    navigate(`/chat/${FIGURES[nextIndex].id}`);
  };

  const handlePrevTwin = () => {
    const currentIndex = FIGURES.findIndex((f) => f.id === selectedFigure.id);
    const prevIndex = (currentIndex - 1 + FIGURES.length) % FIGURES.length;
    navigate(`/chat/${FIGURES[prevIndex].id}`);
  };

  return (
    <ChatInterface
      figure={selectedFigure}
      onBack={handleBackToSelector}
      onNextTwin={handleNextTwin}
      onPrevTwin={handlePrevTwin}
    />
  );
};
