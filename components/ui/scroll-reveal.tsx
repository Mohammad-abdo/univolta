"use client";
import React, { useEffect, useRef, useState } from "react";

type Direction = "up" | "down" | "left" | "right" | "fade";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  distance?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

const initialTransform: Record<Direction, (d: number) => string> = {
  up:    (d) => `translateY(${d}px)`,
  down:  (d) => `translateY(-${d}px)`,
  left:  (d) => `translateX(-${d}px)`,
  right: (d) => `translateX(${d}px)`,
  fade:  ()  => "none",
};

/**
 * Intersection-observer-based scroll reveal wrapper.
 * Triggers a fade + slide animation when the element enters the viewport.
 */
export function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  distance = 36,
  duration = 650,
  className = "",
  threshold = 0.12,
}: ScrollRevealProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const transform = initialTransform[direction](distance);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transform,
        transition: `opacity ${duration}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
