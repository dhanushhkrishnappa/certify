import React from "react";

interface StorySlideGapProps {
  isActive: boolean;
}

export const StorySlideGap: React.FC<StorySlideGapProps> = () => {
  return (
    <div className="relative w-full h-full bg-[#FEFCF8] overflow-hidden select-none flex items-center justify-center p-1 sm:p-2">
      <picture className="w-full h-full flex items-center justify-center">
        <source srcSet="/certificate-vs-mastery.webp" type="image/webp" />
        <img
          src="/certificate-vs-mastery.png"
          alt="A certificate isn't the same as mastery — Learning Path Verification"
          decoding="async"
          className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
        />
      </picture>
    </div>
  );
};
