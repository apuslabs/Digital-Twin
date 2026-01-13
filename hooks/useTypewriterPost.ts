import { useState, useEffect } from "react";
import { PostOption } from "../types/app";

export function useTypewriterPost(postOptions: PostOption[]) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "pause" | "deleting">("typing");

  useEffect(() => {
    if (postOptions.length === 0) return;

    const current = postOptions[activeIndex % postOptions.length];
    const target = current.text;

    const typingDelayMs = 34;
    const deletingDelayMs = 18;
    const pauseDelayMs = 1100;

    const timeout = window.setTimeout(
      () => {
        if (phase === "typing") {
          const next = target.slice(0, typed.length + 1);
          setTyped(next);
          if (next.length >= target.length) setPhase("pause");
          return;
        }

        if (phase === "pause") {
          setPhase("deleting");
          return;
        }

        const next = target.slice(0, Math.max(0, typed.length - 1));
        setTyped(next);
        if (next.length === 0) {
          setActiveIndex((prev) => (prev + 1) % postOptions.length);
          setPhase("typing");
        }
      },
      phase === "typing"
        ? typingDelayMs
        : phase === "pause"
        ? pauseDelayMs
        : deletingDelayMs
    );

    return () => window.clearTimeout(timeout);
  }, [activeIndex, phase, postOptions, typed]);

  const current =
    postOptions.length > 0
      ? postOptions[activeIndex % postOptions.length]
      : null;
  return { current, typed };
}
