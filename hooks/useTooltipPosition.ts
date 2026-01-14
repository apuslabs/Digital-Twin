import { useEffect, useState, RefObject } from "react";

interface Position {
  top: number;
  left: number;
}

export function useTooltipPosition(
  anchorRef: RefObject<HTMLElement>,
  enabled: boolean
): Position | null {
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    if (!enabled || !anchorRef.current) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      if (!anchorRef.current) return;

      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 10, // Position above the button
        left: rect.left + rect.width / 2, // Center horizontally
      });
    };

    // Initial position
    updatePosition();

    // Update on scroll and resize
    let rafId: number;
    const handleUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);

    // Use ResizeObserver to watch for button position changes
    const resizeObserver = new ResizeObserver(handleUpdate);
    resizeObserver.observe(anchorRef.current);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
      resizeObserver.disconnect();
    };
  }, [enabled, anchorRef]);

  return position;
}
