import React, { useState } from "react";

export interface CourseCardData {
  slug: string;
  image: string;
  fallbackImage: string;
  badgeTrack: string;
  level: string;
  title: string;
  description: string;
  modules: string;
  duration: string;
  highlight: string;
}

const CourseCardMedia: React.FC<{
  webpSrc: string;
  fallbackSrc: string;
  title: string;
  badgeTrack: string;
}> = ({ webpSrc, fallbackSrc, title, badgeTrack }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="h-[125px] sm:h-[135px] w-full overflow-hidden relative bg-[#1E1A2E] shrink-0">
      {/* Animated shimmer skeleton while image is loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#181424] via-[#2D2345] to-[#181424] animate-pulse" />
      )}

      {!hasError ? (
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          <img
            src={fallbackSrc}
            alt={title}
            draggable={false}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover select-none pointer-events-none transition-all duration-500 ease-out hover:scale-105 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </picture>
      ) : (
        /* Themed geometric fallback if offline */
        <div className="w-full h-full bg-gradient-to-br from-[#1C162E] via-[#2A1D45] to-[#120F24] p-3 flex flex-col justify-between">
          <div className="w-6 h-6 rounded-md bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 font-mono text-[10px] font-bold">
            {badgeTrack.slice(0, 2).toUpperCase()}
          </div>
          <span className="font-['Newsreader',Georgia,serif] text-xs text-purple-100 font-medium line-clamp-1">
            {title}
          </span>
        </div>
      )}
    </div>
  );
};

const COURSES_DATA: CourseCardData[] = [
  {
    slug: "web-development-foundations",
    image: "/courses/web-dev-master-photo.webp",
    fallbackImage: "/courses/web-dev-master-photo.jpg",
    badgeTrack: "FOUNDATION TRACK",
    level: "Beginner",
    title: "Web Development Foundations",
    description:
      "Learn modern web development with hands-on projects, component architecture, and responsive real-world applications.",
    modules: "12 Modules",
    duration: "48 hrs",
    highlight: "Practical Projects",
  },
  {
    slug: "python-fundamentals",
    image: "/courses/python-fundamentals.webp",
    fallbackImage: "/courses/python-fundamentals.jpg",
    badgeTrack: "FOUNDATION TRACK",
    level: "Beginner",
    title: "Python Fundamentals",
    description:
      "Master Python from first principles. Build real projects, solve algorithmic problems, and prove deep conceptual understanding.",
    modules: "8 Modules",
    duration: "36 hrs",
    highlight: "Hands-on Sandbox",
  },
  {
    slug: "data-structures-problem-solving",
    image: "/courses/data-structures-problem-solving.webp",
    fallbackImage: "/courses/data-structures-problem-solving.jpg",
    badgeTrack: "CORE TRACK",
    level: "Intermediate",
    title: "Data Structures & Problem Solving",
    description:
      "Build defensible computer science intuition with guided visualization, algorithmic proofs, and robust edge-case mastery.",
    modules: "14 Modules",
    duration: "52 hrs",
    highlight: "Algorithmic Defense",
  },
  {
    slug: "genai-llm-application-engineering",
    image: "/courses/genai-llm-application-engineering.webp",
    fallbackImage: "/courses/genai-llm-application-engineering.jpg",
    badgeTrack: "SPECIALIZED TRACK",
    level: "Intermediate",
    title: "GenAI & LLM Engineering",
    description:
      "Architect autonomous agent systems, fine-tune models, and deploy production-grade retrieval-augmented generation pipelines.",
    modules: "10 Modules",
    duration: "40 hrs",
    highlight: "Production AI Labs",
  },
  {
    slug: "sql-relational-database-design",
    image: "/courses/sql-relational-database-design.webp",
    fallbackImage: "/courses/sql-relational-database-design.jpg",
    badgeTrack: "CORE TRACK",
    level: "Beginner",
    title: "SQL & Relational Databases",
    description:
      "Design schema architectures, optimize complex queries, and manage transactional integrity and high-concurrency systems.",
    modules: "8 Modules",
    duration: "32 hrs",
    highlight: "Schema Architecture",
  },
];

// Duplicate items twice to ensure completely seamless infinite scrolling loop
const SCROLLING_COURSES = [...COURSES_DATA, ...COURSES_DATA];

interface DraggableCurriculumCarouselProps {
  onExploreCourses: () => void;
  onSelectCourse?: (slug: string) => void;
}

export const DraggableCurriculumCarousel: React.FC<DraggableCurriculumCarouselProps> = ({
  onExploreCourses,
  onSelectCourse,
}) => {
  const handleNavigateToCourse = (slug: string) => {
    if (onSelectCourse) {
      onSelectCourse(slug);
    } else {
      onExploreCourses();
    }
  };

  return (
    <section
      id="courses"
      className="relative pt-10 sm:pt-14 pb-14 sm:pb-18 px-0 bg-transparent overflow-hidden"
    >
      {/* Inject custom infinite marquee keyframes */}
      <style>{`
        @keyframes autoCourseScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .animate-course-scroll {
          display: flex;
          width: max-content;
          animation: autoCourseScroll 35s linear infinite;
          will-change: transform;
        }
        .animate-course-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-9">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-300/30 bg-purple-950/40 backdrop-blur-md mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse" />
            <span className="font-mono text-[10.5px] uppercase tracking-widest text-purple-200 font-semibold">
              Curated Tracks
            </span>
          </div>
          <h2 className="font-['Newsreader',Georgia,serif] text-3xl sm:text-5xl text-white font-normal leading-tight">
            Courses built for real understanding.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#D1D5DB] font-normal max-w-2xl mx-auto leading-relaxed">
            Explore curated courses, learn with AI, and demonstrate what you know.
          </p>
        </div>
      </div>

      {/* Infinite Horizontal Auto-Scrolling Track with edge fade */}
      <div
        className="relative w-full overflow-hidden py-2"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
        }}
      >
        <div className="animate-course-scroll py-2">
          {SCROLLING_COURSES.map((course, idx) => (
            <div
              key={`${course.slug}-${idx}`}
              onClick={() => handleNavigateToCourse(course.slug)}
              className="w-[275px] sm:w-[295px] md:w-[310px] shrink-0 mx-2.5 sm:mx-3 rounded-[20px] sm:rounded-[22px] bg-[#FFFCF7] text-[#111827] overflow-hidden border border-[#E8E2D9] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)] hover:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.8)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-[360px] sm:h-[375px] cursor-pointer"
            >
              {/* Top Course Photo (Compact Height with WebP, Skeleton, and Fallback) */}
              <CourseCardMedia
                webpSrc={course.image}
                fallbackSrc={course.fallbackImage}
                title={course.title}
                badgeTrack={course.badgeTrack}
              />

              {/* Card Body */}
              <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
                <div>
                  {/* Badges Row */}
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded-full bg-[#F2ECF8] text-[#5A2DA2] font-mono text-[9px] sm:text-[9.5px] font-bold tracking-wider uppercase">
                        CERTIFY
                      </span>
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#F2ECF8] text-[#5A2DA2] font-mono text-[9px] sm:text-[9.5px] font-bold tracking-wider uppercase">
                        {course.badgeTrack}
                      </span>
                    </div>
                    <span className="text-[11px] sm:text-[11.5px] font-medium text-[#6B7280]">
                      {course.level}
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 className="font-['Newsreader',Georgia,serif] text-[18px] sm:text-[20px] text-[#111827] font-normal leading-[1.2] tracking-tight mb-1.5 line-clamp-1">
                    {course.title}
                  </h3>

                  {/* Course Description */}
                  <p className="text-[11.5px] sm:text-[12px] text-[#4B5563] font-normal leading-relaxed line-clamp-2">
                    {course.description}
                  </p>
                </div>

                {/* Bottom Metadata & Clearly Clickable Explore Button */}
                <div className="border-t border-[#E5E1DA] pt-2.5 mt-auto flex items-center justify-between gap-2">
                  <div className="text-[10.5px] sm:text-[11px] text-[#374151] font-medium flex items-center gap-1 flex-wrap">
                    <span>{course.modules}</span>
                    <span>•</span>
                    <span>{course.duration}</span>
                    <span>•</span>
                    <span className="text-[#5A2DA2] font-semibold">{course.highlight}</span>
                  </div>

                  {/* Clickable Explore Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateToCourse(course.slug);
                    }}
                    className="px-3 py-1 sm:py-1.5 rounded-full bg-[#5A2DA2] hover:bg-[#4C1D95] active:scale-95 text-white font-medium text-[11.5px] sm:text-[12px] flex items-center gap-1 transition-all shadow-sm hover:shadow-md shrink-0 cursor-pointer"
                  >
                    <span>Explore</span>
                    <span className="text-xs font-bold">→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
