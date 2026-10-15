import React, { useState, useEffect, useRef } from "react";
import { FlexCarousel, type FlexCarouselHandle, type FlexCarouselItem } from "./FlexCarousel.js";
import { api } from "../../services/api.js";

export interface UnifiedCourseCardItem extends FlexCarouselItem {
  slug: string;
}

const COURSES: UnifiedCourseCardItem[] = [
  {
    slug: "python-fundamentals",
    src: "/courses/card-python-fundamentals.jpg",
    alt: "Python Fundamentals",
    title: "",
    subtitle: "",
  },
  {
    slug: "web-development-foundations",
    src: "/courses/card-web-development-foundations.jpg",
    alt: "Web Development Foundations",
    title: "",
    subtitle: "",
  },
  {
    slug: "data-structures-problem-solving",
    src: "/courses/card-data-structures-problem-solving.jpg",
    alt: "Data Structures & Algorithmic Problem Solving",
    title: "",
    subtitle: "",
  },
  {
    slug: "genai-llm-application-engineering",
    src: "/courses/card-genai-llm-application-engineering.jpg",
    alt: "GenAI & LLM Application Engineering",
    title: "",
    subtitle: "",
  },
  {
    slug: "sql-relational-database-design",
    src: "/courses/card-sql-relational-database-design.jpg",
    alt: "SQL & Relational Database Architecture",
    title: "",
    subtitle: "",
  },
];

interface DraggableCurriculumCarouselProps {
  onExploreCourses: () => void;
  onSelectCourse?: (slug: string) => void;
}

export const DraggableCurriculumCarousel: React.FC<DraggableCurriculumCarouselProps> = ({
  onExploreCourses,
  onSelectCourse,
}) => {
  const [items] = useState<UnifiedCourseCardItem[]>(COURSES);
  const carouselRef = useRef<FlexCarouselHandle>(null);

  useEffect(() => {
    let mounted = true;
    api
      .listCourses()
      .then((data) => {
        if (!mounted || !data.courses || data.courses.length === 0) return;
      })
      .catch(() => {
        // Fall back gracefully to curated static catalog
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleNavigateToCourse = (slug: string) => {
    if (onSelectCourse) {
      onSelectCourse(slug);
    } else {
      onExploreCourses();
    }
  };

  return (
    <section id="courses" className="relative pt-16 pb-20 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-12 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Editorial Section Header with tight, balanced spacing to the carousel */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-300/30 bg-purple-950/40 backdrop-blur-md mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse" />
            <span className="font-mono text-[10.5px] uppercase tracking-widest text-purple-200 font-semibold">
              Curated Tracks
            </span>
          </div>
          <h2 className="font-['Newsreader',Georgia,serif] text-3xl sm:text-5xl text-white font-normal leading-tight">
            Courses built for real understanding.
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#D1D5DB] font-normal max-w-2xl mx-auto leading-relaxed">
            Explore curated courses, learn with AI, and demonstrate what you know.
          </p>
        </div>

        {/* React Bits FlexCarousel: Unified Single-Card Presentation with proper card gap and zero external bottom text */}
        <div style={{ width: "100%", height: "540px", position: "relative" }} className="mt-1">
          <FlexCarousel
            ref={carouselRef}
            items={items}
            preset="liquid"
            intro="rise"
            cardHeight={0.82}
            gap={36}
            squeeze={0.29}
            focusOnClick
            captions={false}
            radius={20}
            roundness={0.85}
            bend={0}
            autoplay
            interval={2}
            onSelect={(index, item) => {
              const selected = item?.slug || items[index]?.slug;
              if (selected) {
                handleNavigateToCourse(selected);
              }
            }}
          />
        </div>
      </div>
    </section>
  );
};
