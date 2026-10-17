import React, { useState, useEffect } from "react";
import { AppSidebar } from "./components/common/AppSidebar.js";
import { AppHeader } from "./components/common/AppHeader.js";
import { DashboardView } from "./components/DashboardView.js";
import { CatalogView } from "./components/CatalogView.js";
import { CourseDetailsView } from "./components/CourseDetailsView.js";
import { MyLearningView } from "./components/MyLearningView.js";
import { LearningStudio } from "./components/LearningStudio.js";
import { ChapterAssessmentView } from "./components/ChapterAssessmentView.js";
import { DiagnosticView } from "./components/DiagnosticView.js";
import { RemediationStudioView } from "./components/RemediationStudioView.js";
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
import type { User } from "./types/index.js";
import { prefersReducedMotion } from "./motion/motionVocabulary.js";
import { motion, AnimatePresence } from "motion/react";

export type CertifyView =
  | "dashboard"
  | "catalog"
  | "course-details"
  | "mylearning"
  | "studio"
  | "assessments"
  | "chapter-assessment"
  | "diagnostic"
  | "remediation"
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
    diagnostic: "diagnostic",
    "chapter-assessment": "chapter-assessment",
    remediation: "remediation",
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

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<CertifyView>(getViewFromPath);
  const [selectedCourseSlug, setSelectedCourseSlug] = useState("python-fundamentals");
  const [selectedCredentialId, setSelectedCredentialId] = useState("CERT-PY-2026-001842");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarPinned, setSidebarPinned] = useState(false);

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

  useEffect(() => {
    const token = localStorage.getItem("certify_token");
    if (!token) return;

    // Verify existing token against backend
    api.getMe()
      .then((data) => {
        setCurrentUser(data.user);
        // Retain landing view if user is intentionally on landing page
        setCurrentView((prev) => (prev === "landing" ? "landing" : "dashboard"));
      })
      .catch(() => {
        // Token expired or invalid: clear and return to landing
        localStorage.removeItem("certify_token");
        setCurrentUser(null);
        setCurrentView("landing");
      });
  }, []);

  const handleSelectCourse = (slug: string) => {
    setSelectedCourseSlug(slug);
    navigateWithTransition("studio");
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
    setCurrentUser(null);
    navigateWithTransition("landing");
  };

  const handleLoginSuccess = (user: User, token: string) => {
    localStorage.setItem("certify_token", token);
    setCurrentUser(user);
    navigateWithTransition("dashboard");
  };

  // Full-bleed views without standard learner sidebar (Landing & Auth)
  if (currentView === "landing") {
    return (
      <LandingPageView
        onExploreCourses={() => navigateWithTransition(currentUser ? "catalog" : "auth")}
        onBeginDiagnostic={() => navigateWithTransition(currentUser ? "diagnostic" : "auth")}
        onSignIn={() => navigateWithTransition("auth")}
        onRegister={() => navigateWithTransition("auth")}
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
          className="w-full min-h-screen"
        >
          <AuthView
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
        onBeginDiagnostic={() => navigateWithTransition("auth")}
        onSignIn={() => navigateWithTransition("auth")}
        onRegister={() => navigateWithTransition("auth")}
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
      case "profile":
        return "Learner Profile";
      case "settings":
        return "Settings";
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
    "diagnostic",
    "remediation",
    "final-assessment",
    "result",
    "credential-details",
    "verify",
  ].includes(currentView);

  return (
    <div className="min-h-screen bg-[#15062B] text-slate-100 flex overflow-x-hidden">
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
        className={`flex-1 min-h-screen transition-all duration-300 ${
          sidebarPinned ? "ml-[256px]" : "ml-[84px] md:ml-[92px]"
        }`}
      >
        <main className="p-6 md:p-8 max-w-[1600px] mx-auto">
          {/* Global Header (hidden on focused immersive views like Studio/Certificate) */}
          {!isFullscreenWorkflow && (
            <AppHeader
              title={getHeaderTitle()}
              subtitle={getHeaderSubtitle()}
              user={currentUser}
              hideGreeting={currentView === "course-details"}
              onSearch={(q) => console.log("Searching:", q)}
              onNavigate={(view) => navigateWithTransition(view as CertifyView)}
              onLogout={handleLogout}
            />
          )}

          {/* Active View Container */}
          <div className={isFullscreenWorkflow ? "pt-0" : "pt-2"}>
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
                onSelectCourse={handleSelectCourse}
                onViewCourseDetails={handleViewCourseDetails}
              />
            )}

            {/* Screen 3: Course Details */}
            {currentView === "course-details" && (
              <CourseDetailsView
                courseSlug={selectedCourseSlug}
                onStartCourse={handleSelectCourse}
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
                onNavigateRemediation={() => setCurrentView("remediation")}
              />
            )}

            {/* Screen 7: Diagnostic Pre-Assessment */}
            {currentView === "diagnostic" && (
              <DiagnosticView
                courseSlug={selectedCourseSlug}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onComplete={() => setCurrentView("studio")}
                onCancel={() => setCurrentView("course-details")}
              />
            )}

            {/* Screen 8: Remediation Studio */}
            {currentView === "remediation" && (
              <RemediationStudioView
                conceptName="Variable Reassignment vs In-Place Mutation"
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onReturnToStudio={() => setCurrentView("studio")}
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
              />
            )}

            {/* Screen 19: Settings View */}
            {currentView === "settings" && (
              <SettingsView
                user={currentUser}
                onLogout={handleLogout}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
