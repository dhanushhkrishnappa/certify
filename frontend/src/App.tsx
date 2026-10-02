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
import { VivaChamberView } from "./components/VivaChamberView.js";
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
  | "practical"
  | "viva"
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
  const p = window.location.pathname.replace(/^\//, "").toLowerCase();
  const token = localStorage.getItem("certify_token");
  const validViews: Record<string, CertifyView> = {
    landing: "landing",
    auth: "auth",
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
    practical: "practical",
    viva: "viva",
    result: "result",
    credentials: "credentials",
    "credential-details": "credential-details",
    verify: "verify",
    progress: "progress",
    profile: "profile",
    settings: "settings",
  };

  const requestedView = validViews[p];

  // RULE 11: Unauthenticated entry MUST be Login/Signup (or public landing / verify)
  if (!token) {
    if (requestedView === "landing") return "landing";
    if (requestedView === "verify") return "verify";
    return "auth";
  }

  // Authenticated user opening auth route goes straight to Dashboard
  if (requestedView === "auth") return "dashboard";

  return requestedView || "dashboard";
};

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<CertifyView>(getViewFromPath);
  const [selectedCourseSlug, setSelectedCourseSlug] = useState("python-fundamentals");
  const [selectedCredentialId, setSelectedCredentialId] = useState("CERT-PY-2026-001842");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    (window as any).__certifyNavigate = (view: CertifyView) => setCurrentView(view);

    const handlePopState = () => {
      setCurrentView(getViewFromPath());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const path = currentView === "dashboard" ? "/" : `/${currentView}`;
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
        setCurrentView((prev) => (prev === "auth" ? "dashboard" : prev));
      })
      .catch(() => {
        // Token expired or invalid: clear and force login
        localStorage.removeItem("certify_token");
        setCurrentUser(null);
        setCurrentView((prev) => (!PUBLIC_VIEWS.includes(prev) ? "auth" : prev));
      });
  }, []);

  const handleSelectCourse = (slug: string) => {
    setSelectedCourseSlug(slug);
    setCurrentView("studio");
  };

  const handleViewCourseDetails = (slug: string) => {
    setSelectedCourseSlug(slug);
    setCurrentView("course-details");
  };

  const handleNavigateVerify = (credId?: string) => {
    if (credId) setSelectedCredentialId(credId);
    setCurrentView("verify");
  };

  const handleViewCredential = (credId: string) => {
    setSelectedCredentialId(credId);
    setCurrentView("credential-details");
  };

  const handleLogout = () => {
    localStorage.removeItem("certify_token");
    setCurrentUser(null);
    setCurrentView("auth");
  };

  const handleLoginSuccess = (user: User, token: string) => {
    localStorage.setItem("certify_token", token);
    setCurrentUser(user);
    setCurrentView("dashboard");
  };

  // Full-bleed views without standard learner sidebar (Landing & Auth)
  if (currentView === "landing") {
    return (
      <LandingPageView
        onExploreCourses={() => setCurrentView(currentUser ? "catalog" : "auth")}
        onBeginDiagnostic={() => setCurrentView(currentUser ? "diagnostic" : "auth")}
        onVerifyLedger={() => setCurrentView("verify")}
        onSignIn={() => setCurrentView("auth")}
      />
    );
  }

  if (currentView === "auth") {
    return (
      <AuthView
        onLoginSuccess={handleLoginSuccess}
        onCancel={() => setCurrentView("landing")}
      />
    );
  }

  // Security barrier: Ensure unauthenticated users cannot access protected views
  if (!currentUser && !PUBLIC_VIEWS.includes(currentView)) {
    return (
      <AuthView
        onLoginSuccess={handleLoginSuccess}
        onCancel={() => setCurrentView("landing")}
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
    "practical",
    "viva",
    "result",
    "credential-details",
    "verify",
  ].includes(currentView);

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex overflow-x-hidden">
      {/* Global Canonical App Sidebar (240px desktop, 68px collapsed) */}
      <AppSidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as CertifyView)}
        user={currentUser}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 min-h-screen transition-all duration-200 ${
          sidebarCollapsed ? "ml-[68px]" : "ml-[240px]"
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
                onNavigateVerify={handleNavigateVerify}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
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
                onSubmitForViva={() => setCurrentView("practical")}
                onSubmitAssessment={() => setCurrentView("practical")}
                onCancel={() => setCurrentView("dashboard")}
              />
            )}

            {/* Screen: Practical Implementation Sandbox Milestone */}
            {currentView === "practical" && (
              <ChapterAssessmentView
                courseSlug={selectedCourseSlug}
                chapterTitle="Practical Capstone: Quorum Invariants & In-Memory State"
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onComplete={() => setCurrentView("viva")}
                onPassed={() => setCurrentView("viva")}
                onNavigateRemediation={() => setCurrentView("remediation")}
              />
            )}

            {/* Screen 11: Oral Viva Defense */}
            {currentView === "viva" && (
              <VivaChamberView
                courseSlug={selectedCourseSlug}
                onNavigate={(v) => setCurrentView(v as CertifyView)}
                onCompleteDefense={() => setCurrentView("result")}
                onExit={() => setCurrentView("dashboard")}
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
                onNavigateVerify={handleNavigateVerify}
              />
            )}


            {/* Screen 14: Credential Details / Certificate */}
            {currentView === "credential-details" && (
              <CredentialDetailsView
                user={currentUser}
                credentialId={selectedCredentialId}
                onNavigateVerify={handleNavigateVerify}
                onBack={() => setCurrentView("credentials")}
              />
            )}

            {/* Screen 15: Public Verification */}
            {currentView === "verify" && (
              <PublicVerifyView
                initialCredentialId={selectedCredentialId}
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
