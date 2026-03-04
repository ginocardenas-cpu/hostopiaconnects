"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const DEFAULT_WORDS = ["sell", "train", "launch"];

interface AnimatedRotatingWordProps {
  words?: string[];
  intervalMs?: number;
}

const staticStyle = {
  marginLeft: "0.35em",
  fontFamily: "Montserrat, sans-serif",
  fontSize: "inherit",
  lineHeight: 1 as const,
  fontWeight: 900,
  color: "#2CADB2",
  display: "inline-block",
  verticalAlign: "baseline"
};

export function AnimatedRotatingWord({
  words = DEFAULT_WORDS,
  intervalMs = 2500
}: AnimatedRotatingWordProps) {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => {
      setIndex((i) => (i === words.length - 1 ? 0 : i + 1));
    }, intervalMs);
    return () => clearInterval(id);
  }, [mounted, words, intervalMs]);

  const currentWord = words[index];
  const displayWord = currentWord.charAt(0).toUpperCase() + currentWord.slice(1);

  // Server and initial client: static span so HTML matches and hydration succeeds.
  if (!mounted) {
    return (
      <span
        style={staticStyle}
        aria-live="polite"
        aria-label={words[0]}
      >
        {words[0].charAt(0).toUpperCase() + words[0].slice(1)}
      </span>
    );
  }

  return (
    <motion.span
      key={currentWord}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
      style={staticStyle}
      aria-live="polite"
      aria-label={currentWord}
    >
      {displayWord}
    </motion.span>
  );
}

