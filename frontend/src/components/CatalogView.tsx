import React, { useEffect, useState } from "react";
import { api } from "../services/api.js";
import type { CourseCatalogItem, CourseDetail, Module, Chapter } from "../types/index.js";
import { SpotlightCard } from "./common/SpotlightCard.js";
import { useTheme } from "../context/ThemeContext.js";

interface CatalogViewProps {
  onSelectCourse: (slug: string) => void;
  onViewCourseDetails?: (slug: string) => void;
}

interface CuratedCourseMeta {
  id: string;
  slug: string;
  title: string;
  summary: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  modulesCount: number;
  estimatedHours: string;
  isFeatured?: boolean;
  status: "in-progress" | "not-started" | "completed";
  progress?: number;
  manifesto: string[];
  artType: "python" | "webdev" | "dsa" | "genai" | "sql" | "devops";
}

const CURATED_CATALOG: CuratedCourseMeta[] = [
  {
    id: "course-python",
    slug: "python-fundamentals",
    title: "Python Fundamentals",
    summary: "Master Python from first principles. Build real projects, solve problems, and get certified.",
    level: "Beginner",
    modulesCount: 8,
    estimatedHours: "36.5 hours",
    isFeatured: true,
    status: "in-progress",
    progress: 42,
    manifesto: ["Think", "Build", "Solve", "Grow"],
    artType: "python",
  },
  {
    id: "course-webdev",
    slug: "web-development-foundations",
    title: "Web Development Foundations",
    summary: "Learn modern web development with hands-on projects. Build responsive, real-world applications.",
    level: "Beginner",
    modulesCount: 12,
    estimatedHours: "48 hours",
    status: "in-progress",
    progress: 15,
    manifesto: ["Design", "Build", "Deploy"],
    artType: "webdev",
  },
  {
    id: "course-dsa",
    slug: "data-structures-problem-solving",
    title: "Data Structures & Problem Solving",
    summary: "Build core computer science skills with interactive explanations and guided practice.",
    level: "Intermediate",
    modulesCount: 14,
    estimatedHours: "52 hours",
    status: "not-started",
    manifesto: ["Think", "Analyse", "Solve", "Excel"],
    artType: "dsa",
  },
  {
    id: "course-genai",
    slug: "generative-ai-developers",
    title: "Generative AI for Developers",
    summary: "Learn to build real applications with modern AI tools and frameworks.",
    level: "Intermediate",
    modulesCount: 10,
    estimatedHours: "40 hours",
    status: "not-started",
    manifesto: ["Prompt", "Build", "Create", "Innovate"],
    artType: "genai",
  },
  {
    id: "course-sql",
    slug: "databases-sql",
    title: "Databases & SQL",
    summary: "Work with real data, write efficient queries, and build data-driven applications.",
    level: "Beginner",
    modulesCount: 8,
    estimatedHours: "32 hours",
    status: "not-started",
    manifesto: ["Store", "Query", "Analyze", "Scale"],
    artType: "sql",
  },
  {
    id: "course-devops",
    slug: "devops-cloud-essentials",
    title: "DevOps & Cloud Essentials",
    summary: "Learn deployment, infrastructure and modern DevOps practices with hands-on labs.",
    level: "Intermediate",
    modulesCount: 10,
    estimatedHours: "45 hours",
    status: "not-started",
    manifesto: ["Deploy", "Monitor", "Scale", "Succeed"],
    artType: "devops",
  },
];

export const CatalogView: React.FC<CatalogViewProps> = ({
  onSelectCourse,
  onViewCourseDetails,
}) => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [backendCourses, setBackendCourses] = useState<CourseCatalogItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "in-progress" | "completed">("all");
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<CourseDetail | null>(null);
  const [activeModalCourse, setActiveModalCourse] = useState<CuratedCourseMeta | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sortBy, setSortBy] = useState<"relevant" | "modules" | "hours">("relevant");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    api.listCourses()
      .then((data) => setBackendCourses(data.courses || []))
      .catch((err) => console.error("Error loading courses:", err));
  }, []);

  const handleViewDetails = async (course: CuratedCourseMeta) => {
    setActiveModalCourse(course);
    try {
      const data = await api.getCourseBySlug(course.slug);
      setSelectedCourseDetail(data.course);
    } catch {
      // If course is not in backend yet, show graceful fallback curriculum modal
      setSelectedCourseDetail(null);
    }
  };

  const handleCloseModal = () => {
    setActiveModalCourse(null);
    setSelectedCourseDetail(null);
  };

  // Sync real backend course counts if available
  const catalogWithBackendData = CURATED_CATALOG.map((item) => {
    const match = backendCourses.find((b) => b.slug === item.slug);
    if (match) {
      return {
        ...item,
        modulesCount: match.moduleCount || item.modulesCount,
      };
    }
    return item;
  });

  // Filter and sort items
  const filteredCourses = catalogWithBackendData.filter((item) => {
    if (activeFilter === "in-progress" && item.status !== "in-progress") return false;
    if (activeFilter === "completed" && item.status !== "completed") return false;
    if (levelFilter !== "all" && item.level !== levelFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "modules") return b.modulesCount - a.modulesCount;
    if (sortBy === "hours") return parseFloat(b.estimatedHours) - parseFloat(a.estimatedHours);
    return 0; // "relevant" preserves canonical order
  });

  const inProgressCount = CURATED_CATALOG.filter((c) => c.status === "in-progress").length;
  const completedCount = CURATED_CATALOG.filter((c) => c.status === "completed").length;

  return (
    <div className="space-y-6" data-purpose="course-explorer-page">
      {/* BEGIN: Filter Tabs & Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1" data-purpose="filter-toolbar">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-2">
          {/* All Courses */}
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === "all"
                ? isLight
                  ? "bg-[#5B4DF0] text-white font-bold shadow-sm"
                  : "bg-white text-neutral-950 font-bold shadow-md"
                : isLight
                  ? "text-slate-700 hover:text-purple-950 hover:bg-white/40 font-medium"
                  : "text-neutral-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>All Courses</span>
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                activeFilter === "all"
                  ? isLight
                    ? "bg-white/20 text-white"
                    : "bg-neutral-950 text-white"
                  : isLight
                    ? "bg-purple-900/15 text-purple-950"
                    : "bg-white/15 text-neutral-300"
              }`}
            >
              {CURATED_CATALOG.length}
            </span>
          </button>

          {/* In Progress */}
          <button
            onClick={() => setActiveFilter("in-progress")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === "in-progress"
                ? isLight
                  ? "bg-[#5B4DF0] text-white font-bold shadow-sm"
                  : "bg-white text-neutral-950 font-bold shadow-md"
                : isLight
                  ? "text-slate-700 hover:text-purple-950 hover:bg-white/40 font-medium"
                  : "text-neutral-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>In Progress</span>
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                activeFilter === "in-progress"
                  ? isLight
                    ? "bg-white/20 text-white"
                    : "bg-neutral-950 text-white"
                  : isLight
                    ? "bg-purple-900/15 text-purple-950"
                    : "bg-white/15 text-neutral-300"
              }`}
            >
              {inProgressCount}
            </span>
          </button>

          {/* Completed */}
          <button
            onClick={() => setActiveFilter("completed")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === "completed"
                ? isLight
                  ? "bg-[#5B4DF0] text-white font-bold shadow-sm"
                  : "bg-white text-neutral-950 font-bold shadow-md"
                : isLight
                  ? "text-slate-700 hover:text-purple-950 hover:bg-white/40 font-medium"
                  : "text-neutral-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>Completed</span>
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                activeFilter === "completed"
                  ? isLight
                    ? "bg-white/20 text-white"
                    : "bg-neutral-950 text-white"
                  : isLight
                    ? "bg-purple-900/15 text-purple-950"
                    : "bg-white/15 text-neutral-300"
              }`}
            >
              {completedCount}
            </span>
          </button>
        </div>

        {/* Filter & Sorting Dropdowns */}
        <div className="flex items-center gap-3 relative">
          {/* Level Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowSortDropdown(false);
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-[10px] border text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
                isLight
                  ? "border-purple-900/15 bg-white text-slate-800 hover:bg-purple-50"
                  : "border-white/[0.08] bg-[#111111] text-neutral-200 hover:bg-white/[0.06]"
              }`}
            >
              <svg className={`w-3.5 h-3.5 ${isLight ? "text-purple-700" : "text-neutral-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>{levelFilter === "all" ? "Filter" : levelFilter}</span>
              <svg className={`w-3.5 h-3.5 ml-0.5 ${isLight ? "text-purple-700" : "text-neutral-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>

            {showFilterDropdown && (
              <div className={`absolute right-0 mt-1 w-36 rounded-[10px] shadow-xl border py-1 z-30 text-xs font-medium ${
                isLight
                  ? "bg-white border-purple-900/15 text-slate-800 shadow-[0_12px_36px_rgba(76,29,149,0.12)]"
                  : "bg-[#111111] border-white/[0.08] text-neutral-200 shadow-2xl"
              }`}>
                <button
                  onClick={() => { setLevelFilter("all"); setShowFilterDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 transition-colors ${
                    levelFilter === "all"
                      ? isLight ? "text-purple-700 font-bold bg-purple-50" : "text-white font-bold bg-white/[0.06]"
                      : isLight ? "text-slate-700 hover:bg-purple-50/60" : "text-neutral-300 hover:bg-white/[0.06]"
                  }`}
                >
                  All Levels
                </button>
                <button
                  onClick={() => { setLevelFilter("Beginner"); setShowFilterDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 transition-colors ${
                    levelFilter === "Beginner"
                      ? isLight ? "text-purple-700 font-bold bg-purple-50" : "text-white font-bold bg-white/[0.06]"
                      : isLight ? "text-slate-700 hover:bg-purple-50/60" : "text-neutral-300 hover:bg-white/[0.06]"
                  }`}
                >
                  Beginner
                </button>
                <button
                  onClick={() => { setLevelFilter("Intermediate"); setShowFilterDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 transition-colors ${
                    levelFilter === "Intermediate"
                      ? isLight ? "text-purple-700 font-bold bg-purple-50" : "text-white font-bold bg-white/[0.06]"
                      : isLight ? "text-slate-700 hover:bg-purple-50/60" : "text-neutral-300 hover:bg-white/[0.06]"
                  }`}
                >
                  Intermediate
                </button>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowFilterDropdown(false);
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-[10px] border text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
                isLight
                  ? "border-purple-900/15 bg-white text-slate-800 hover:bg-purple-50"
                  : "border-white/[0.08] bg-[#111111] text-neutral-200 hover:bg-white/[0.06]"
              }`}
            >
              <svg className={`w-3.5 h-3.5 ${isLight ? "text-purple-700" : "text-neutral-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>
                {sortBy === "relevant" ? "Most Relevant" : sortBy === "modules" ? "By Modules" : "By Duration"}
              </span>
              <svg className={`w-3.5 h-3.5 ml-0.5 ${isLight ? "text-purple-700" : "text-neutral-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>

            {showSortDropdown && (
              <div className={`absolute right-0 mt-1 w-40 rounded-[10px] shadow-xl border py-1 z-30 text-xs font-medium ${
                isLight
                  ? "bg-white border-purple-900/15 text-slate-800 shadow-[0_12px_36px_rgba(76,29,149,0.12)]"
                  : "bg-[#111111] border-white/[0.08] text-neutral-200 shadow-2xl"
              }`}>
                <button
                  onClick={() => { setSortBy("relevant"); setShowSortDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 transition-colors ${
                    sortBy === "relevant"
                      ? isLight ? "text-purple-700 font-bold bg-purple-50" : "text-white font-bold bg-white/[0.06]"
                      : isLight ? "text-slate-700 hover:bg-purple-50/60" : "text-neutral-300 hover:bg-white/[0.06]"
                  }`}
                >
                  Most Relevant
                </button>
                <button
                  onClick={() => { setSortBy("modules"); setShowSortDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 transition-colors ${
                    sortBy === "modules"
                      ? isLight ? "text-purple-700 font-bold bg-purple-50" : "text-white font-bold bg-white/[0.06]"
                      : isLight ? "text-slate-700 hover:bg-purple-50/60" : "text-neutral-300 hover:bg-white/[0.06]"
                  }`}
                >
                  Most Modules
                </button>
                <button
                  onClick={() => { setSortBy("hours"); setShowSortDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 transition-colors ${
                    sortBy === "hours"
                      ? isLight ? "text-purple-700 font-bold bg-purple-50" : "text-white font-bold bg-white/[0.06]"
                      : isLight ? "text-slate-700 hover:bg-purple-50/60" : "text-neutral-300 hover:bg-white/[0.06]"
                  }`}
                >
                  Estimated Duration
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* END: Filter Tabs & Sort Toolbar */}

      {/* BEGIN: Course Cards Grid - Canonical Stitch 14px cards with Spotlight shiny hover */}
      <section aria-label="Course Listings" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        {filteredCourses.map((course) => (
          <SpotlightCard
            key={course.id}
            theme={theme}
            spotlightColor={isLight ? "#7c3aed" : "#ffffff"}
            intensity={isLight ? 0.04 : 0.02}
            borderGlow={0.30}
            data-purpose="course-card"
            data-course-slug={course.slug}
            className={`rounded-[14px] border shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-300 ${
              isLight
                ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)]"
                : "bg-[#111111] border-white/[0.08]"
            }`}
          >
            <div>
              {/* Thumbnail Graphic Area */}
              <div className="relative h-44 bg-[#0a0d14] overflow-hidden flex items-center justify-center p-4">
                {/* Specific Artwork Renderers */}
                {course.artType === "python" && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/60 via-black to-slate-900"></div>
                    <div className="absolute -bottom-10 right-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl"></div>
                    <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex items-center justify-center">
                      <div className="w-24 h-24 relative flex items-center justify-center drop-shadow-[0_10px_25px_rgba(56,189,248,0.35)]">
                        <svg className="w-20 h-20" viewBox="0 0 128 128">
                          <path
                            d="M63.5 16.5c-24.8 0-23.2 10.7-23.2 10.7l.03 11.1h23.7v3.4H30.6s-15.5 1.8-15.5 23.3c0 21.6 13.5 22.4 13.5 22.4h8.1v-11.3s-.4-13.5 13.3-13.5h23v-3.4H49.3s-3.4-.4-3.4-3.4.4-3.4 3.4-3.4h37.4s11.5-.7 11.5-11.8c0-11.1-10.8-24.1-34.7-24.1zm-13.2 7.3c2.3 0 4.1 1.8 4.1 4.1s-1.8 4.1-4.1 4.1-4.1-1.8-4.1-4.1 1.8-4.1 4.1-4.1z"
                            fill="#3776ab"
                          />
                          <path
                            d="M64.5 111.5c24.8 0 23.2-10.7 23.2-10.7l-.03-11.1H64v-3.4h33.4s15.5-1.8 15.5-23.3c0-21.6-13.5-22.4-13.5-22.4h-8.1v11.3s.4 13.5-13.3 13.5H55v3.4h23.7s3.4.4 3.4 3.4-.4 3.4-3.4 3.4H44.7s-11.5.7-11.5 11.8c0 11.1 10.8 24.1 34.7 24.1zm13.2-7.3c-2.3 0-4.1-1.8-4.1-4.1s1.8-4.1 4.1-4.1 4.1 1.8 4.1 4.1-1.8 4.1-4.1 4.1z"
                            fill="#ffd343"
                          />
                        </svg>
                      </div>
                    </div>
                  </>
                )}

                {course.artType === "webdev" && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#101726] to-[#1c1829]"></div>
                    <div className="absolute -top-6 -left-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-36 h-20 bg-slate-800/80 border border-slate-700 rounded-[6px] shadow-2xl p-1.5 flex flex-col justify-between backdrop-blur-xs">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        </div>
                        <div className="space-y-1">
                          <div className="w-12 h-1 bg-indigo-400 rounded"></div>
                          <div className="w-20 h-1 bg-slate-600 rounded"></div>
                          <div className="w-16 h-1 bg-slate-600 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 -mt-3">
                        <span className="w-6 h-6 rounded bg-orange-600 text-white font-black text-[9px] flex items-center justify-center shadow-lg">5</span>
                        <span className="w-6 h-6 rounded bg-blue-600 text-white font-black text-[9px] flex items-center justify-center shadow-lg">3</span>
                        <span className="w-6 h-6 rounded bg-yellow-500 text-black font-black text-[9px] flex items-center justify-center shadow-lg">JS</span>
                        <span className="w-6 h-6 rounded bg-[#20232a] text-[#61dafb] font-black text-xs flex items-center justify-center shadow-lg">⚛</span>
                      </div>
                    </div>
                  </>
                )}

                {course.artType === "dsa" && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#110d24] via-[#1a0f2e] to-[#0d0718]"></div>
                    <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-pink-600/10 to-transparent"></div>
                    <div className="relative z-10 flex flex-col items-center">
                      <svg className="w-48 h-28" fill="none" viewBox="0 0 200 110">
                        <line opacity="0.8" stroke="#f472b6" strokeDasharray="2 2" strokeWidth="1.5" x1="30" x2="70" y1="40" y2="20" />
                        <line opacity="0.8" stroke="#f472b6" strokeWidth="1.5" x1="70" x2="100" y1="20" y2="45" />
                        <line opacity="0.8" stroke="#f472b6" strokeWidth="1.5" x1="100" x2="140" y1="45" y2="25" />
                        <line opacity="0.8" stroke="#f472b6" strokeDasharray="2 2" strokeWidth="1.5" x1="140" x2="175" y1="25" y2="48" />
                        <circle cx="30" cy="40" fill="#fb7185" filter="drop-shadow(0 0 6px #fb7185)" r="3.5" />
                        <circle cx="70" cy="20" fill="#f43f5e" filter="drop-shadow(0 0 8px #f43f5e)" r="4.5" />
                        <circle cx="100" cy="45" fill="#fbbf24" filter="drop-shadow(0 0 10px #fbbf24)" r="5" />
                        <circle cx="140" cy="25" fill="#f43f5e" filter="drop-shadow(0 0 8px #f43f5e)" r="4.5" />
                        <circle cx="175" cy="48" fill="#fb7185" filter="drop-shadow(0 0 6px #fb7185)" r="3.5" />
                        <path d="M60 85 L100 65 L140 85 L100 105 Z" fill="#2d124d" opacity="0.8" stroke="#ec4899" strokeWidth="1" />
                        <path d="M75 75 L100 60 L125 75 L100 90 Z" fill="#441b71" opacity="0.9" stroke="#f472b6" strokeWidth="1.2" />
                        <path d="M88 66 L100 56 L112 66 L100 76 Z" fill="#6d28d9" stroke="#fbbf24" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </>
                )}

                {course.artType === "genai" && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0b1022] via-[#0e1633] to-[#15122b]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex items-center justify-center">
                      <svg className="w-24 h-24" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24">
                        <path d="M9.5 2A4.5 4.5 0 005 6.5c0 .4.05.78.15 1.15A4 4 0 003 11.5c0 1.63.98 3.03 2.4 3.65A4.5 4.5 0 0010 19.5h.5V2H9.5z" filter="drop-shadow(0 0 5px #f59e0b)" stroke="#f59e0b" />
                        <path d="M14.5 2A4.5 4.5 0 0119 6.5c0 .4-.05.78-.15 1.15A4 4 0 0121 11.5c0 1.63-.98 3.03-2.4 3.65A4.5 4.5 0 0114 19.5h-.5V2h1z" filter="drop-shadow(0 0 5px #38bdf8)" stroke="#38bdf8" />
                        <circle cx="12" cy="7" fill="#fef08a" r="1.5" />
                        <circle cx="9" cy="11" fill="#38bdf8" r="1.5" />
                        <circle cx="15" cy="11" fill="#f59e0b" r="1.5" />
                        <line stroke="#ffffff" strokeDasharray="1 1" strokeWidth="0.75" x1="9" x2="15" y1="11" y2="11" />
                      </svg>
                    </div>
                  </>
                )}

                {course.artType === "sql" && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0a1122] via-[#091b2c] to-[#141d30]"></div>
                    <div className="absolute bottom-4 right-1/4 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-16 h-5 rounded-[100%] bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-200/50"></div>
                        <div className="w-16 h-5 rounded-[100%] bg-gradient-to-r from-slate-700 via-amber-600 to-slate-700 -mt-2.5 border-t border-amber-400/40"></div>
                        <div className="w-16 h-5 rounded-[100%] bg-gradient-to-r from-slate-800 via-amber-700 to-slate-800 -mt-2.5 border-t border-amber-400/30"></div>
                        <div className="w-16 h-5 rounded-[100%] bg-gradient-to-r from-slate-900 via-amber-800 to-slate-900 -mt-2.5 border-t border-amber-400/20"></div>
                      </div>
                    </div>
                  </>
                )}

                {course.artType === "devops" && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#080d19] via-[#0d1629] to-[#0c1f36]"></div>
                    <div className="absolute bottom-2 left-1/3 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex items-center justify-center">
                      <div className="relative w-28 h-24 flex items-center justify-center">
                        <svg className="w-20 h-20 text-cyan-400/80" fill="none" filter="drop-shadow(0 0 12px rgba(6,182,212,0.6))" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                          <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="absolute bottom-2 w-4 h-8 bg-gradient-to-t from-cyan-400 to-transparent opacity-80 blur-[2px]"></div>
                        <div className="absolute -right-3 bottom-3 w-4 h-6 bg-slate-900 border border-cyan-500/50 rounded-xs flex flex-col justify-around px-0.5">
                          <div className="w-full h-0.5 bg-cyan-400 rounded-full"></div>
                          <div className="w-full h-0.5 bg-emerald-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Top Badges */}
                {course.isFeatured && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-[6px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs">
                      FEATURED
                    </span>
                  </div>
                )}

                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-amber-300 text-[10px] font-bold tracking-wider">
                  <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
                  </svg>
                  <span>CERTIFY CURATED</span>
                </div>

                {/* Left Manifesto Words */}
                <div className="absolute left-4 bottom-4 z-10 text-left font-sans font-medium text-slate-300 text-xs tracking-wide leading-tight select-none opacity-90">
                  {course.manifesto.map((word, idx) => (
                    <p key={idx}>{word}</p>
                  ))}
                </div>
              </div>

              {/* Card Content Body */}
              <div className="p-5">
                <h3 className={`font-bold text-[17px] tracking-tight transition-colors duration-300 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}>
                  {course.title}
                </h3>
                <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed transition-colors duration-300 ${
                  isLight ? "text-slate-600" : "text-neutral-400"
                }`}>
                  {course.summary}
                </p>

                {/* Metadata Badges */}
                <div className={`flex items-center gap-4 mt-4 text-[11px] font-medium transition-colors duration-300 ${
                  isLight ? "text-slate-500" : "text-neutral-400"
                }`}>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    {course.level}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    {course.modulesCount} modules
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    {course.estimatedHours}
                  </span>
                </div>

                {/* Progress Bar (if in-progress) */}
                {course.status === "in-progress" && typeof course.progress === "number" && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className={`flex-1 rounded-full h-1.5 overflow-hidden ${
                      isLight ? "bg-purple-100" : "bg-white/10"
                    }`}>
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <span className={`text-[11px] font-semibold shrink-0 ${
                      isLight ? "text-slate-500" : "text-neutral-400"
                    }`}>
                      {course.progress}% complete
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bottom Bar */}
            <div className="px-5 pb-5 pt-1 flex items-center justify-between gap-3 mt-2">
              {course.status === "in-progress" ? (
                <button
                  onClick={() => onSelectCourse(course.slug)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-[8px] py-2 px-3 text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
                    isLight
                      ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                      : "bg-white hover:bg-neutral-200 text-neutral-950"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Continue Learning</span>
                </button>
              ) : (
                <button
                  onClick={() => onSelectCourse(course.slug)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-[8px] py-2 px-3 text-xs font-semibold transition-colors border cursor-pointer ${
                    isLight
                      ? "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                      : "bg-white/10 hover:bg-white/15 text-white border-white/10"
                  }`}
                >
                  <span>Start Learning</span>
                  <span aria-hidden="true">&gt;</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (onViewCourseDetails) {
                    onViewCourseDetails(course.slug);
                  } else {
                    handleViewDetails(course);
                  }
                }}
                className={`text-xs font-semibold flex items-center gap-1 transition-colors px-1 cursor-pointer ${
                  isLight ? "text-purple-700 hover:text-purple-900" : "text-neutral-300 hover:text-white"
                }`}
              >
                <span>View Details</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </SpotlightCard>
        ))}
      </section>
      {/* END: Course Cards Grid */}

      {/* BEGIN: Pagination Footer */}
      <footer className={`mt-8 pt-4 pb-2 flex items-center justify-between text-xs ${isLight ? "text-slate-700 font-medium" : "text-purple-200/80"}`} data-purpose="pagination-footer">
        <div>Showing {filteredCourses.length} courses</div>
        <nav aria-label="Pagination" className="flex items-center gap-1.5">
          <button
            aria-label="Previous page"
            className={`w-7 h-7 rounded-[8px] border flex items-center justify-center transition-colors cursor-pointer ${
              isLight
                ? "border-purple-900/15 bg-white text-slate-700 hover:text-purple-950 hover:border-purple-900/30"
                : "border-white/15 bg-white/10 text-purple-200 hover:text-white hover:bg-white/20"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
          <button
            aria-current="page"
            className={`w-7 h-7 rounded-[8px] font-bold shadow-md flex items-center justify-center text-xs ${
              isLight
                ? "bg-[#5B4DF0] text-white"
                : "bg-white text-neutral-950"
            }`}
          >
            1
          </button>
          <button
            aria-label="Next page"
            className={`w-7 h-7 rounded-[8px] border flex items-center justify-center transition-colors cursor-pointer ${
              isLight
                ? "border-purple-900/15 bg-white text-slate-700 hover:text-purple-950 hover:border-purple-900/30"
                : "border-white/15 bg-white/10 text-purple-200 hover:text-white hover:bg-white/20"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </nav>
      </footer>
      {/* END: Pagination Footer */}

      {/* COURSE DETAILS / SYLLABUS MODAL */}
      {activeModalCourse && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className={`rounded-[20px] max-w-2xl w-full p-6 shadow-2xl border max-h-[85vh] overflow-y-auto space-y-5 ${
            isLight
              ? "bg-white border-purple-900/15 text-slate-900"
              : "bg-[#111111] border-white/[0.08] text-white"
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <div className={`inline-flex items-center space-x-1.5 border text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 ${
                  isLight
                    ? "bg-purple-100 text-purple-800 border-purple-300"
                    : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                }`}>
                  <span>{activeModalCourse.level}</span>
                  <span>•</span>
                  <span>{activeModalCourse.estimatedHours}</span>
                </div>
                <h3 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                  {activeModalCourse.title}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isLight ? "text-slate-500 hover:text-slate-800" : "text-neutral-400 hover:text-white"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
              {activeModalCourse.summary}
            </p>

            <div className={`p-3 rounded-[10px] border text-xs space-y-2 ${
              isLight
                ? "bg-purple-50/70 border-purple-100 text-slate-800"
                : "bg-white/[0.04] border-white/[0.06] text-white"
            }`}>
              <h4 className={`font-bold ${isLight ? "text-purple-950" : "text-white"}`}>Defensible Certification Pipeline</h4>
              <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                Complete all syllabus chapters, verify hands-on execution in interactive sandboxes, and defend your codebase in an oral AI Viva to earn your verified credential.
              </p>
            </div>

            {selectedCourseDetail?.modules ? (
              <div className="space-y-3 pt-2">
                <h4 className={`text-xs font-bold tracking-wide uppercase ${isLight ? "text-slate-700" : "text-neutral-200"}`}>
                  Curriculum Modules ({selectedCourseDetail.modules.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedCourseDetail.modules.map((mod: Module, idx: number) => (
                    <div key={mod.id || idx} className={`p-3 rounded-[10px] border ${
                      isLight
                        ? "bg-slate-50 border-slate-200"
                        : "bg-white/[0.03] border-white/[0.06]"
                    }`}>
                      <div className={`font-semibold text-xs flex items-center justify-between ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}>
                        <span>{mod.title}</span>
                        <span className={`text-[10px] font-normal ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                          {mod.chapters?.length || 0} Chapters
                        </span>
                      </div>
                      {mod.chapters && mod.chapters.length > 0 && (
                        <div className={`mt-2 space-y-1 pl-2 border-l-2 ${
                          isLight ? "border-purple-200" : "border-white/10"
                        }`}>
                          {mod.chapters.map((ch: Chapter) => (
                            <div key={ch.id} className={`text-[11px] flex items-center justify-between ${
                              isLight ? "text-slate-700" : "text-neutral-300"
                            }`}>
                              <span>Chapter {ch.sequenceOrder}: {ch.title}</span>
                              <span className={`text-[9px] ${isLight ? "text-purple-600 font-medium" : "text-neutral-400"}`}>Oral Viva Covered</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-[10px] text-center text-xs border ${
                isLight ? "bg-slate-50 text-slate-500 border-slate-200" : "bg-white/[0.04] text-neutral-400 border-white/[0.06]"
              }`}>
                Curriculum syllabus loading or seeded track overview.
              </div>
            )}

            <div className={`flex items-center justify-end gap-3 pt-3 border-t ${
              isLight ? "border-slate-200" : "border-white/[0.08]"
            }`}>
              <button
                onClick={handleCloseModal}
                className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  isLight ? "text-slate-600 hover:text-slate-900" : "text-neutral-400 hover:text-white"
                }`}
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleCloseModal();
                  onSelectCourse(activeModalCourse.slug);
                }}
                className={`px-4 py-2 font-bold text-xs rounded-[8px] shadow-sm transition-all cursor-pointer ${
                  isLight
                    ? "bg-[#5B4DF0] hover:bg-[#4D3DE0] text-white"
                    : "bg-white hover:bg-neutral-200 text-neutral-950"
                }`}
              >
                Start / Continue Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
