import React from "react";

interface StorySlideEvidenceProps {
  isActive: boolean;
}

export const StorySlideEvidence: React.FC<StorySlideEvidenceProps> = () => {
  return (
    <div className="relative w-full h-full bg-[#FDFBF6] overflow-hidden select-none flex items-center justify-center p-1 sm:p-2">
      <img
        src="/sandbox-ide.png"
        alt="Hands-on Python Sandbox & AI Tutor"
        className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
      />
    </div>
  );
};

export default StorySlideEvidence;
