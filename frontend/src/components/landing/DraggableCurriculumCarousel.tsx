import React, { useRef, useState, useEffect } from "react";
import { BulgeCard } from "./webgl/BulgeCard.js";

interface CourseCard {
  slug: string;
  title: string;
  summary: string;
  level: string;
  modules: number;
  duration: string;
  badge: string;
  accent: string;
}

const COURSES: CourseCard[] = [
  {
    slug: "python-fundamentals",
    title: "Python Fundamentals: Deep Architecture",
    summary:
      "From CPython memory models, references, and closures to iterator protocols, generator invariants, and bytecode compilation.",
    level: "Beginner → Proficient",
    modules: 8,
    duration: "36.5 hrs",
    badge: "FLAGSHIP TRACK",
    accent: "#E6CAA4",
  },
  {
    slug: "web-development-foundations",
    title: "Web Development Foundations",
    summary:
      "Modern full-stack architecture, DOM tree reconciliation, HTTP caching protocols, asynchronous event loops, and REST invariants.",
    level: "Beginner",
    modules: 12,
    duration: "48 hrs",
    badge: "FOUNDATION",
    accent: "#34D399",
  },
  {
    slug: "data-structures-problem-solving",
    title: "Data Structures & Algorithmic Problem Solving",
    summary:
      "Asymptotic analysis, tree rebalancing, hash collision invariants, graph traversal mechanics, and dynamic programming memoization.",
    level: "Intermediate",
    modules: 14,
    duration: "52 hrs",
    badge: "CORE CS",
    accent: "#CEA4F2",
  },
  {
    slug: "genai-llm-application-engineering",
    title: "GenAI & LLM Application Engineering",
    summary:
      "Vector embeddings, RAG semantic chunking, prompt distillation, agent tool routing, and evaluation rubric invariants.",
    level: "Advanced",
    modules: 10,
    duration: "40 hrs",
    badge: "APPLIED AI",
    accent: "#F3DEBE",
  },
  {
    slug: "sql-relational-database-design",
    title: "SQL & Relational Database Architecture",
    summary:
      "B-Tree index mechanics, write-ahead logging, ACID transaction isolation levels, join algorithms, and execution plan optimization.",
    level: "Intermediate",
    modules: 9,
    duration: "38 hrs",
    badge: "DATA SYSTEMS",
    accent: "#38BDF8",
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollBounds = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScrollBounds);
    checkScrollBounds();
    return () => el.removeEventListener("scroll", checkScrollBounds);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeft - walk;
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const scrollByAmount = (amount: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      scrollByAmount(-360);
    } else if (e.key === "ArrowRight") {
      scrollByAmount(360);
    }
  };

  return (
    <section id="courses" className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-12 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="font-['Newsreader',Georgia,serif] text-3xl sm:text-5xl text-[#FEF5E5] font-normal leading-tight">
              Interactive Curricula with Socratic Verification
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#A89682] mr-2 hidden sm:inline">
              Drag or use arrows to navigate
            </span>
            <button
              onClick={() => scrollByAmount(-360)}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-xl bg-[#FAF1E6] border border-[#DFCDBB] flex items-center justify-center text-[#24130D] transition-opacity cursor-pointer shadow-sm ${canScrollLeft ? "opacity-100 hover:bg-[#F2E5D5]" : "opacity-40 cursor-not-allowed"
                }`}
              aria-label="Scroll left"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button
              onClick={() => scrollByAmount(360)}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-xl bg-[#FAF1E6] border border-[#DFCDBB] flex items-center justify-center text-[#24130D] transition-opacity cursor-pointer shadow-sm ${canScrollRight ? "opacity-100 hover:bg-[#F2E5D5]" : "opacity-40 cursor-not-allowed"
                }`}
              aria-label="Scroll right"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Draggable Track Container */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Curriculum Tracks Carousel"
          className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-none select-none focus:outline-none focus:ring-1 focus:ring-[#E6CAA4]/40 cursor-grab active:cursor-grabbing snap-x snap-mandatory"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {COURSES.map((course) => (
            <div
              key={course.slug}
              className="min-w-[320px] sm:min-w-[380px] max-w-[400px] shrink-0 snap-start"
            >
              <BulgeCard className="h-full rounded-3xl bg-gradient-to-b from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD] border border-[#DFCDBB] hover:border-[#BFA892] p-7 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all duration-300 text-[#22120B]">
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#D5C2E8] bg-[#EDE2F5] text-[#5D3B75]">
                      {course.badge}
                    </span>
                    <span className="font-mono text-xs text-[#6F5B4E] font-medium">
                      {course.level}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-['Newsreader',Georgia,serif] text-2xl text-[#22120B] font-normal leading-snug mb-3">
                    {course.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-[13.5px] text-[#5C4538] leading-relaxed mb-6">
                    {course.summary}
                  </p>
                </div>

                {/* Metadata & CTA */}
                <div className="pt-4 border-t border-[#DFCDBB] space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-[#6F5B4E]">
                    <span>{course.modules} Modules</span>
                    <span>•</span>
                    <span>{course.duration}</span>
                    <span>•</span>
                    <span className="text-[#276A47] font-semibold">Oral Viva Included</span>
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectCourse) {
                        onSelectCourse(course.slug);
                      } else {
                        onExploreCourses();
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#462719] via-[#381E13] to-[#2B150D] hover:brightness-110 text-[#FAF0E6] text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#5A3825] shadow-md active:scale-95"
                  >
                    <span>Inspect Syllabus &amp; Rubrics</span>
                    <span>→</span>
                  </button>
                </div>
              </BulgeCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
