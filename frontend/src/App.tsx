import React, { useState, useEffect } from "react";
import { AppSidebar } from "./components/common/AppSidebar.js";
import { AppHeader } from "./components/common/AppHeader.js";
import { DashboardView } from "./components/DashboardView.js";
import { CatalogView } from "./components/CatalogView.js";
import { CourseDetailsView } from "./components/CourseDetailsView.js";
import { MyLearningView } from "./components/MyLearningView.js";
import { LearningStudio } from "./components/LearningStudio.js";
import { ChapterAssessmentView } from "./components/ChapterAssessmentView.js";
import { FinalAssessmentView } from "./components/FinalAssessmentView.js";
import { CertificationResultView } from "./components/CertificationResultView.js";
import { CredentialsListView } from "./components/CredentialsListView.js";
import { CredentialDetailsView } from "./components/CredentialDetailsView.js";
import { ProgressView } from "./components/ProgressView.js";
import { ProfileView } from "./components/ProfileView.js";
import { SettingsView } from "./components/SettingsView.js";
import { LandingPageView } from "./components/LandingPageView.js";
import { AuthView } from "./components/AuthView.js";
import { api } from "./services/api.js";
import { authClient } from "./lib/authClient.js";
import type { User } from "./types/index.js";
import { prefersReducedMotion } from "./motion/motionVocabulary.js";
import { motion, AnimatePresence } from "motion/react";
import { ThemeProvider, useTheme } from "./context/ThemeContext.js";

export type CertifyView =
  | "dashboard"
  | "catalog"
  | "course-details"
  | "mylearning"
  | "studio"
  | "assessments"
  | "chapter-assessment"
  | "final-assessment"
  | "result"
  | "credentials"
  | "credential-details"
  | "progress"
  | "profile"
  | "settings"
  | "landing"
  | "auth";

const PUBLIC_VIEWS: CertifyView[] = ["auth", "landing"];

const getViewFromPath = (): CertifyView => {
  const p = window.location.pathname.replace(/^\//, "").toLowerCase();

  // Root and landing always resolve directly to the main landing page
  if (p === "" || p === "/" || p === "landing") {
    return "landing";
  }

  const token = localStorage.getItem("certify_token");
  const validViews: Record<string, CertifyView> = {
    landing: "landing",
    auth: "auth",
    login: "auth",
    register: "auth",
    catalog: "catalog",
    "course-details": "course-details",
    mylearning: "mylearning",
    dashboard: "dashboard",
    studio: "studio",
    "chapter-assessment": "chapter-assessment",
    "final-assessment": "final-assessment",
    assessments: "final-assessment",
    result: "result",
    credentials: "credentials",
    "credential-details": "credential-details",
    progress: "progress",
    profile: "profile",
    settings: "settings",
  };

  const requestedView = validViews[p];

  // Unauthenticated entry defaults to landing page (or auth if explicitly visited)
  if (!token) {
    if (requestedView === "auth") return "auth";
    return "landing";
  }

  // Authenticated user opening auth route goes straight to Dashboard
  if (requestedView === "auth") return "dashboard";

  return requestedView || "landing";
};

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const [currentView, setCurrentView] = useState<CertifyView>(getViewFromPath);
  const [selectedCourseSlug, setSelectedCourseSlug] = useState("python-fundamentals");
  const [selectedCredentialId, setSelectedCredentialId] = useState("CERT-PY-2026-001842");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<"signin" | "signup">("signin");
  const [enrolledCourseSlugs, setEnrolledCourseSlugs] = useState<string[]>(() => {
    const saved = localStorage.getItem("certify_enrolled_courses");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  /**
   * Navigation with View Transition API and instant fallback
   */
  const navigateWithTransition = (newView: CertifyView) => {
    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      !prefersReducedMotion()
    ) {
      (document as any).startViewTransition(() => {
        setCurrentView(newView);
      });
    } else {
      setCurrentView(newView);
    }
  };

  useEffect(() => {
    (window as any).__certifyNavigate = (view: CertifyView) => navigateWithTransition(view);

    const handlePopState = () => {
      navigateWithTransition(getViewFromPath());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const path = currentView === "landing" ? "/" : `/${currentView}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
    }
  }, [currentView]);

  // Strict workflow barrier: Cannot access studio without enrolling in that course first
  useEffect(() => {
    if (currentView === "studio" && !enrolledCourseSlugs.includes(selectedCourseSlug)) {
      setCurrentView("course-details");
    }
  }, [currentView, selectedCourseSlug, enrolledCourseSlugs]);

  useEffect(() => {
    const token = localStorage.getItem("certify_token");

    // Query active profile either via stored token or active Better Auth session cookie (e.g. after Google OAuth)
    api.getMe()
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem("certify_user", JSON.stringify(data.user));

          // Ensure session token is stored in localStorage for subsequent API calls
          if (!token) {
            authClient.getSession().then(({ data: sess }) => {
              if (sess?.session?.token) {
                localStorage.setItem("certify_token", sess.session.token);
              }
            }).catch(() => {});
          }

          // If user landed on auth page, redirect into app
          if (currentView === "auth") {
            setCurrentView("catalog");
          }
        }
      })
      .catch(() => {
        if (!token) return; // Unauthenticated guest, remain on landing/auth

        // Fallback to cached or demo user session in dev/offline mode
        const savedUserStr = localStorage.getItem("certify_user");
        let fallbackUser: User | null = null;
        if (savedUserStr) {
          try { fallbackUser = JSON.parse(savedUserStr); } catch {}
        }
        if (!fallbackUser) {
          fallbackUser = {
            id: "u-learner-demo",
            email: "learner@certify.edu",
            fullName: "Dhanush K",
            name: "Dhanush K",
            role: "STUDENT",
          };
        }
        setCurrentUser(fallbackUser);
      });
  }, []);

  const handleEnrollAndLaunchStudio = (slug: string) => {
    setSelectedCourseSlug(slug);
    setEnrolledCourseSlugs((prev) => {
      const updated = Array.from(new Set([...prev, slug]));
      localStorage.setItem("certify_enrolled_courses", JSON.stringify(updated));
      return updated;
    });
    navigateWithTransition("studio");
  };

  const handleSelectCourse = (slug: string) => {
    setSelectedCourseSlug(slug);
    // Strict enrollment barrier: If enrolled, go to studio; otherwise explore curriculum in course-details
    if (enrolledCourseSlugs.includes(slug)) {
      navigateWithTransition("studio");
    } else {
      navigateWithTransition("course-details");
    }
  };

  const handleViewCourseDetails = (slug: string) => {
    setSelectedCourseSlug(slug);
    navigateWithTransition("course-details");
  };

  const handleNavigateVerify = (credId?: string) => {
    if (credId) setSelectedCredentialId(credId);
    navigateWithTransition("credential-details");
  };

  const handleViewCredential = (credId: string) => {
    setSelectedCredentialId(credId);
    navigateWithTransition("credential-details");
  };

  const handleLogout = () => {
    localStorage.removeItem("certify_token");
    localStorage.removeItem("certify_user");
    setCurrentUser(null);
    api.logout().catch(() => {});
    navigateWithTransition("landing");
  };

  const handleLoginSuccess = (user: User, token: string) => {
    localStorage.setItem("certify_token", token);
    localStorage.setItem("certify_user", JSON.stringify(user));
    setCurrentUser(user);
    navigateWithTransition("dashboard");
  };

  // Full-bleed views without standard learner sidebar (Landing & Auth)
  if (currentView === "landing") {
    return (
      <LandingPageView
        onExploreCourses={() => navigateWithTransition(currentUser ? "catalog" : "auth")}
        onSignIn={() => {
          setAuthInitialMode("signin");
          navigateWithTransition("auth");
        }}
        onRegister={() => {
          setAuthInitialMode("signup");
          navigateWithTransition("auth");
        }}
        onSelectCourse={(slug) => {
          setSelectedCourseSlug(slug);
          navigateWithTransition(currentUser ? "course-details" : "auth");
        }}
      />
    );
  }

  if (currentView === "auth") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="auth-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-screen overflow-hidden"
        >
          <AuthView
            initialMode={authInitialMode}
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => navigateWithTransition("landing")}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Security barrier: Ensure unauthenticated users cannot access protected views
  if (!currentUser && !PUBLIC_VIEWS.includes(currentView)) {
    return (
      <LandingPageView
        onExploreCourses={() => navigateWithTransition("auth")}
        onSignIn={() => {
          setAuthInitialMode("signin");
          navigateWithTransition("auth");
        }}
        onRegister={() => {
          setAuthInitialMode("signup");
          navigateWithTransition("auth");
        }}
        onSelectCourse={(slug) => {
          setSelectedCourseSlug(slug);
          navigateWithTransition("auth");
        }}
      />
    );
  }

  // Determine header titles
  const getHeaderTitle = () => {
    switch (currentView) {
      case "catalog":
        return "Explore Courses";
      case "mylearning":
        return "My Learning";
      case "progress":
        return "Learning Progress";
      case "credentials":
        return "My Credentials";
      case "assessments":
      case "final-assessment":
        return "Comprehensive Final Assessment";
      default:
        return undefined;
    }
  };

  const getHeaderSubtitle = () => {
    switch (currentView) {
      case "catalog":
        return "Learn with AI. Demonstrate understanding. Earn verified credentials.";
      case "mylearning":
        return "Track your active tracks, daily habits, and module mastery.";
      case "progress":
        return "Inspect Bayesian knowledge tracing parameters across your active syllabus.";
      default:
        return undefined;
    }
  };

  const isFullscreenWorkflow = [
    "studio",
    "chapter-assessment",
    "final-assessment",
    "result",
    "credential-details",
    "verify",
  ].includes(currentView);

  return (
    <div
      className={`min-h-screen flex overflow-x-hidden transition-colors duration-400 relative ${
        currentView === "studio"
          ? "bg-[#09090b] text-[#f4f4f5]"
          : theme === "light"
          ? "bg-[#C5B8D6] text-slate-900"
          : "bg-[#15062B] text-slate-100"
      }`}
    >
      {/* Background Doodle Art Overlay (Hidden on AI Tutor studio view for strict minimalism) */}
      <div
        className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-500 ${
          currentView === "studio" ? "opacity-0" : ""
        }`}
        style={{
          backgroundImage: "url('/doodle-bg.webp'), url('/doodle-bg.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "850px auto",
          opacity: currentView === "studio" ? 0 : theme === "light" ? 0.09 : 0.075,
          filter: theme === "light" ? "contrast(1.15)" : "invert(1) brightness(1.35) contrast(1.1)",
          mixBlendMode: theme === "light" ? "multiply" : "screen",
        }}
        aria-hidden="true"
      />

      {/* Global Canonical App Sidebar (Floating Card Dock) */}
      <AppSidebar
        currentView={currentView}
        onNavigate={(view) => navigateWithTransition(view as CertifyView)}
        user={currentUser}
        onLogout={handleLogout}
        collapsed={!sidebarPinned}
        onToggleCollapse={() => setSidebarPinned(!sidebarPinned)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 min-h-screen relative z-10 ${
          sidebarPinned ? "ml-[256px]" : "ml-[84px] md:ml-[92px]"
        }`}
      >
        <main
          className={
            currentView === "studio"
              ? "p-0 w-full min-h-screen flex flex-col bg-[#09090b]"
              : currentView === "settings" || currentView === "profile"
              ? "p-6 md:p-8 w-full min-h-screen"
              : "p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen"
          }
        >
          {/* Global Header (hidden on focused immersive views like Studio/Certificate) */}
          {!isFullscreenWorkflow && (
            <AppHeader
              title={getHeaderTitle()}
              subtitle={getHeaderSubtitle()}
              user={currentUser}
              hideGreeting={currentView === "course-details" || currentView === "settings" || currentView === "profile"}
              hideSearch={currentView === "settings" || currentView === "profile"}
              onSearch={(q) => console.log("Searching:", q)}
              onNavigate={(view) => navigateWithTransition(view as CertifyView)}
              onLogout={handleLogout}
              showThemeToggle={currentView === "dashboard"}
            />
          )}

          {/* Active View Container */}
          <div className={currentView === "studio" ? "flex-1 flex flex-col" : isFullscreenWorkflow ? "pt-0" : "pt-2"}>
            {/* Screen 1: Dashboard */}
            {currentView === "dashboard" && (
              <DashboardView
                user={currentUser}
                onContinueCourse={handleSelectCourse}
                onViewCourseDetails={handleViewCourseDetails}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
              />
            )}

            {/* Screen 2: Catalog */}
            {currentView === "catalog" && (
              <CatalogView
                onSelectCourse={handleViewCourseDetails}
                onViewCourseDetails={handleViewCourseDetails}
              />
            )}

            {/* Screen 3: Course Details */}
            {currentView === "course-details" && (
              <CourseDetailsView
                courseSlug={selectedCourseSlug}
                onStartCourse={handleEnrollAndLaunchStudio}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onSelectRelatedCourse={(slug) => {
                  setSelectedCourseSlug(slug);
                  setCurrentView("course-details");
                }}
                user={currentUser}
              />
            )}

            {/* Screen 4: My Learning */}
            {currentView === "mylearning" && (
              <MyLearningView
                user={currentUser}
                onContinueCourse={handleSelectCourse}
                onViewCourseDetails={handleViewCourseDetails}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
              />
            )}


            {/* Screen 5: AI Learning Studio */}
            {currentView === "studio" && (
              <LearningStudio
                courseSlug={selectedCourseSlug}
                user={currentUser}
                onNavigateVerify={handleNavigateVerify}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onLogout={handleLogout}
              />
            )}

            {/* Screen 6: Chapter Assessment */}
            {currentView === "chapter-assessment" && (
              <ChapterAssessmentView
                courseSlug={selectedCourseSlug}
                chapterTitle="Memory Model & Mutability"
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onComplete={() => setCurrentView("studio")}
              />
            )}

            {/* Screen 9 & Screen 10: Final Assessment */}
            {(currentView === "assessments" || currentView === "final-assessment") && (
              <FinalAssessmentView
                courseSlug={selectedCourseSlug}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onSubmitForViva={() => setCurrentView("result")}
                onSubmitAssessment={() => setCurrentView("result")}
                onCancel={() => setCurrentView("dashboard")}
              />
            )}

            {/* Screen 12: Certification Result */}
            {currentView === "result" && (
              <CertificationResultView
                courseSlug={selectedCourseSlug}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onViewCredential={() => setCurrentView("credential-details")}
                onReturnDashboard={() => setCurrentView("dashboard")}
              />
            )}

            {/* Screen 13: My Credentials */}
            {currentView === "credentials" && (
              <CredentialsListView
                user={currentUser}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onViewCredential={handleViewCredential}
              />
            )}


            {/* Screen 14: Credential Details / Certificate */}
            {currentView === "credential-details" && (
              <CredentialDetailsView
                user={currentUser}
                credentialId={selectedCredentialId}
                onBack={() => setCurrentView("credentials")}
              />
            )}

            {/* Screen 19: Progress View */}
            {currentView === "progress" && (
              <ProgressView
                user={currentUser}
                onNavigateToStudio={() => setCurrentView("studio")}
              />
            )}

            {/* Screen 19: Profile View */}
            {currentView === "profile" && (
              <ProfileView
                user={currentUser}
                onNavigateCredentials={() => setCurrentView("credentials")}
                onNavigateCatalog={() => setCurrentView("catalog")}
                onNavigateSettings={() => setCurrentView("settings")}
                onSelectCourse={handleSelectCourse}
              />
            )}

            {/* Screen 19: Settings View */}
            {currentView === "settings" && (
              <SettingsView
                user={currentUser}
                onLogout={handleLogout}
                onNavigateProfile={() => setCurrentView("profile")}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
