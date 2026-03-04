"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const DEFAULT_WORDS = ["sell", "train", "launch"];

interface AnimatedRotatingWordProps {
  words?: string[];
  intervalMs?: number;
}

export function AnimatedRotatingWord({
  words = DEFAULT_WORDS,
  intervalMs = 2500
}: AnimatedRotatingWordProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i === words.length - 1 ? 0 : i + 1));
    }, intervalMs);
    return () => clearInterval(id);
  }, [words, intervalMs]);

  const currentWord = words[index];

  return (
    <motion.span
      key={currentWord}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
      style={{
        marginLeft: "0.35em",
        fontFamily: "Montserrat, sans-serif",
        fontSize: "inherit",
        lineHeight: 1,
        fontWeight: 900,
        color: "#2CADB2",
        display: "inline-block",
        verticalAlign: "baseline"
      }}
      aria-live="polite"
      aria-label={currentWord}
    >
      {currentWord.charAt(0).toUpperCase() + currentWord.slice(1)}
    </motion.span>
  );
}

