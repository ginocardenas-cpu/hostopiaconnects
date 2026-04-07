"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  active?: boolean;
}

function InteractiveHoverButton({
  text = "Button",
  active,
  className,
  ...props
}: InteractiveHoverButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "group relative w-32 cursor-pointer overflow-hidden rounded-full border p-2 text-center font-semibold transition-colors",
        active
          ? "border-[#2CADB2] bg-[#2CADB2] text-white"
          : "bg-background border-border text-foreground hover:border-[#2CADB2]/50",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0",
          active && "translate-x-12 opacity-0",
        )}
      >
        {text}
      </span>
      <div
        className={cn(
          "absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100",
          active && "-translate-x-1 opacity-100",
        )}
      >
        <span className={active ? "text-white" : "text-primary-foreground"}>
          {text}
        </span>
        <ArrowRight
          className={active ? "text-white" : "text-primary-foreground"}
          size={16}
        />
      </div>
      <div
        className={cn(
          "absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8]",
          active
            ? "left-[0%] top-[0%] h-full w-full scale-[1.8] bg-white/20"
            : "bg-primary group-hover:bg-primary",
        )}
      />
    </button>
  );
}

export { InteractiveHoverButton };
