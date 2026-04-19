"use client";
import { useState, useEffect } from "react";

interface RotatingTextProps {
  words: string[];
  interval?: number;
  className?: string;
}

/**
 * Reactbits-inspired rotating word carousel.
 * Fades & slides out the current word, then fades & slides in the next.
 */
export function RotatingText({ words, interval = 2600, className = "" }: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"visible" | "leaving">("visible");

  useEffect(() => {
    if (words.length <= 1) return;

    const timer = setInterval(() => {
      setPhase("leaving");
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setPhase("visible");
      }, 380);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        opacity: phase === "visible" ? 1 : 0,
        transform: phase === "visible" ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.94)",
        transition: "opacity 0.38s cubic-bezier(0.4,0,0.2,1), transform 0.38s cubic-bezier(0.4,0,0.2,1)",
        minWidth: "1ch",
      }}
    >
      {words[index]}
    </span>
  );
}
