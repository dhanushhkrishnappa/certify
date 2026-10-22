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
import { PublicVerifyView } from "./components/PublicVerifyView.js";
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
  | "verify"
  | "progress"
  | "profile"
  | "settings"
  | "landing"
  | "auth";

const PUBLIC_VIEWS: CertifyView[] = ["auth", "landing", "verify"];

const getViewFromPath = (): CertifyView => {
  const rawPath = window.location.pathname.replace(/^\//, "");
  const p = rawPath.toLowerCase();

  if (p === "" || p === "/" || p === "landing") {
    return "landing";
  }

  if (p === "verify" || p.startsWith("verify/")) {
    return "verify";
  }

  const token = localStorage.getItem("certify_token");
  const validViews: Record<string, CertifyView> = {
    landing: "landing",
    auth: "auth",
    login: "auth",
    register: "auth",
    verify: "verify",
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

  if (!token) {
    if (requestedView === "auth" || requestedView === "verify") return requestedView;
    return "landing";
  }

  if (requestedView === "auth") return "dashboard";

  return requestedView || "landing";
};

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<CertifyView>(getViewFromPath);
  const [selectedCourseSlug, setSelectedCourseSlug] = useState("python-fundamentals");
  const [selectedCredentialId, setSelectedCredentialId] = useState(() => {
    const match = window.location.pathname.match(/^\/verify\/([^/]+)/i);
    return match ? decodeURIComponent(match[1]) : "";
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarPinned, setSidebarPinned] = useState(false);

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
    const path =
      currentView === "landing"
        ? "/"
        : currentView === "verify" && selectedCredentialId
        ? `/verify/${selectedCredentialId}`
        : `/${currentView}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
    }
  }, [currentView, selectedCredentialId]);

  useEffect(() => {
    const token = localStorage.getItem("certify_token");
    if (!token) return;

    api
      .getMe()
      .then((data) => {
        setCurrentUser(data.user);
        setCurrentView((prev) =>
          prev === "landing" || prev === "verify" ? prev : "dashboard"
        );
      })
      .catch(() => {
        localStorage.removeItem("certify_token");
        setCurrentUser(null);
        setCurrentView((prev) => (prev === "verify" ? "verify" : "landing"));
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
    navigateWithTransition("verify");
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

  if (currentView === "verify") {
    return (
      <PublicVerifyView
        initialCredentialId={selectedCredentialId}
        onBack={() => navigateWithTransition(currentUser ? "credentials" : "landing")}
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
      <AppSidebar
        currentView={currentView}
        onNavigate={(view) => navigateWithTransition(view as CertifyView)}
        user={currentUser}
        onLogout={handleLogout}
        collapsed={!sidebarPinned}
        onToggleCollapse={() => setSidebarPinned(!sidebarPinned)}
      />

      <div
        className={`flex-1 min-h-screen transition-all duration-300 ${
          sidebarPinned ? "ml-[256px]" : "ml-[84px] md:ml-[92px]"
        }`}
      >
        <main className="p-6 md:p-8 max-w-[1600px] mx-auto">
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

          <div className={isFullscreenWorkflow ? "pt-0" : "pt-2"}>
            {currentView === "dashboard" && (
              <DashboardView
                user={currentUser}
                onContinueCourse={handleSelectCourse}
                onViewCourseDetails={handleViewCourseDetails}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
              />
            )}

            {currentView === "catalog" && (
              <CatalogView
                onSelectCourse={handleSelectCourse}
                onViewCourseDetails={handleViewCourseDetails}
              />
            )}

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

            {currentView === "mylearning" && (
              <MyLearningView
                user={currentUser}
                onContinueCourse={handleSelectCourse}
                onViewCourseDetails={handleViewCourseDetails}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
              />
            )}

            {currentView === "studio" && (
              <LearningStudio
                courseSlug={selectedCourseSlug}
                user={currentUser}
                onNavigateVerify={handleNavigateVerify}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onLogout={handleLogout}
              />
            )}

            {currentView === "chapter-assessment" && (
              <ChapterAssessmentView
                courseSlug={selectedCourseSlug}
                chapterTitle="Memory Model & Mutability"
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onComplete={() => setCurrentView("studio")}
                onNavigateRemediation={() => setCurrentView("remediation")}
              />
            )}

            {currentView === "diagnostic" && (
              <DiagnosticView
                courseSlug={selectedCourseSlug}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onComplete={() => setCurrentView("studio")}
                onCancel={() => setCurrentView("course-details")}
              />
            )}

            {currentView === "remediation" && (
              <RemediationStudioView
                conceptName="Variable Reassignment vs In-Place Mutation"
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onReturnToStudio={() => setCurrentView("studio")}
              />
            )}

            {(currentView === "assessments" || currentView === "final-assessment") && (
              <FinalAssessmentView
                courseSlug={selectedCourseSlug}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onSubmitForViva={() => setCurrentView("result")}
                onSubmitAssessment={() => setCurrentView("result")}
                onCancel={() => setCurrentView("dashboard")}
              />
            )}

            {currentView === "result" && (
              <CertificationResultView
                courseSlug={selectedCourseSlug}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onViewCredential={(credId) => {
                  if (credId) setSelectedCredentialId(credId);
                  setCurrentView("credential-details");
                }}
                onReturnDashboard={() => setCurrentView("dashboard")}
              />
            )}

            {currentView === "credentials" && (
              <CredentialsListView
                user={currentUser}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onViewCredential={handleViewCredential}
              />
            )}

            {currentView === "credential-details" && (
              <CredentialDetailsView
                user={currentUser}
                credentialId={selectedCredentialId}
                onBack={() => setCurrentView("credentials")}
              />
            )}

            {currentView === "progress" && (
              <ProgressView
                user={currentUser}
                onNavigateToStudio={() => setCurrentView("studio")}
              />
            )}

            {currentView === "profile" && (
              <ProfileView
                user={currentUser}
                onNavigateCredentials={() => setCurrentView("credentials")}
                onNavigateCatalog={() => setCurrentView("catalog")}
              />
            )}

            {currentView === "settings" && (
              <SettingsView user={currentUser} onLogout={handleLogout} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
