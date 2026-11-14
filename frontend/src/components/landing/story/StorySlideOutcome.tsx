import React from "react";

interface StorySlideOutcomeProps {
  isActive: boolean;
}

export const StorySlideOutcome: React.FC<StorySlideOutcomeProps> = () => {
  return (
    <div className="relative w-full h-full bg-[#FEFDF8] overflow-hidden select-none flex items-center justify-center p-1 sm:p-2">
      <picture className="w-full h-full flex items-center justify-center">
        <source srcSet="/evidence-credential.webp" type="image/webp" />
        <img
          src="/evidence-credential.png"
          alt="Evidence & Verifiable Credential"
          decoding="async"
          className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
        />
      </picture>
    </div>
  );
};

export default StorySlideOutcome;
