"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

const STORAGE_KEY = "hostopia-connects-feedback";

function getStored(assetId: string): "up" | "down" | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Record<string, "up" | "down">;
    return data[assetId] ?? null;
  } catch {
    return null;
  }
}

function setStored(assetId: string, value: "up" | "down") {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = (raw ? JSON.parse(raw) : {}) as Record<string, "up" | "down">;
    data[assetId] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

interface AssetFeedbackProps {
  assetId: string;
}

export function AssetFeedback({ assetId }: AssetFeedbackProps) {
  const [value, setValue] = useState<"up" | "down" | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setValue(getStored(assetId));
  }, [assetId]);

  const updateStorage = (next: "up" | "down" | null) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = (raw ? JSON.parse(raw) : {}) as Record<string, "up" | "down">;
      if (next) data[assetId] = next;
      else delete data[assetId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  };

  const handleUp = () => {
    const next = value === "up" ? null : "up";
    setValue(next);
    updateStorage(next);
  };

  const handleDown = () => {
    const next = value === "down" ? null : "down";
    setValue(next);
    updateStorage(next);
  };

  if (!mounted) return null;

  return (
    <div
      className="flex items-center gap-2"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <span className="text-xs text-gray-600 mr-1">Was this useful?</span>
      <button
        type="button"
        onClick={handleUp}
        className={`p-1.5 rounded-md transition ${
          value === "up"
            ? "bg-[#2CADB2]/20 text-[#2CADB2]"
            : "text-gray-400 hover:text-[#2CADB2] hover:bg-[#2CADB2]/10"
        }`}
        aria-label="Thumbs up"
      >
        <ThumbsUp size={18} />
      </button>
      <button
        type="button"
        onClick={handleDown}
        className={`p-1.5 rounded-md transition ${
          value === "down"
            ? "bg-red-100 text-red-600"
            : "text-gray-400 hover:text-red-600 hover:bg-red-50"
        }`}
        aria-label="Thumbs down"
      >
        <ThumbsDown size={18} />
      </button>
      {value && (
        <span className="text-xs text-gray-500 ml-1">
          {value === "up" ? "Thanks for your feedback." : "Thanks, we’ll use this to improve."}
        </span>
      )}
    </div>
  );
}
