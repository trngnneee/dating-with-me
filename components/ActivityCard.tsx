"use client";

import React from "react";
import * as Icons from "lucide-react";

interface ActivityCardProps {
  id: string;
  title: string;
  iconName: keyof typeof Icons;
  description: string;
  selected: boolean;
  onClick: () => void;
}

export default function ActivityCard({
  title,
  iconName,
  description,
  selected,
  onClick,
}: ActivityCardProps) {
  const IconComponent = Icons[iconName] as React.ComponentType<{ className?: string }>;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-300 w-full group cursor-pointer text-center ${
        selected
          ? "bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200 scale-102 border-2 border-rose-300"
          : "glass hover:bg-white/60 text-slate-700 hover:scale-101 border border-white/30"
      }`}
    >
      {/* Decorative Sparkle for selected item */}
      {selected && (
        <span className="absolute top-2 right-2 text-yellow-300 animate-sparkle">
          ✨
        </span>
      )}

      {/* Icon */}
      <div
        className={`p-3 rounded-full mb-3 transition-colors duration-300 ${
          selected
            ? "bg-white/20 text-white"
            : "bg-rose-100 text-rose-500 group-hover:bg-rose-200"
        }`}
      >
        {IconComponent && <IconComponent className="w-6 h-6" />}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-base mb-1 tracking-wide font-sans">
        {title}
      </h3>

      {/* Description */}
      <p
        className={`text-xs ${
          selected ? "text-rose-100" : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </button>
  );
}
