import React from "react";

interface StorySlideSocraticMethodProps {
  isActive: boolean;
}

export const StorySlideSocraticMethod: React.FC<StorySlideSocraticMethodProps> = () => {
  return (
    <div className="relative w-full h-full bg-[#FEFCF7] overflow-hidden select-none flex items-center justify-center p-1 sm:p-2">
      <img
        src="/socratic-dialogue.png"
        alt="AI Tutor — Socratic Dialogue"
        className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
      />
    </div>
  );
};

export default StorySlideSocraticMethod;
