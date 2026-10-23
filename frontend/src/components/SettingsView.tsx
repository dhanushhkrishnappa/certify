import React, { useState, useRef } from "react";
import type { User } from "../types/index.js";
import { useTheme } from "../context/ThemeContext.js";

interface SettingsViewProps {
  user?: User | null;
  onLogout?: () => void;
  onNavigateProfile?: () => void;
}

type TabType = "account" | "communication" | "personalization" | "calendar" | "notes";

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onLogout }) => {
  const { theme, setTheme, isLight } = useTheme();

  // Active tab state matching reference tabs
  const [activeTab, setActiveTab] = useState<TabType>("account");

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || user?.name || "Dhanush K");
  const [email, setEmail] = useState(user?.email || "dhanushk2204@gmail.com");
  const [timezone, setTimezone] = useState("Kolkata");
  const [language, setLanguage] = useState("English");
  const [profileImage, setProfileImage] = useState<string>("/user-avatar.jpg");
  const [soundEffects, setSoundEffects] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [reportEmail, setReportEmail] = useState(user?.email || "dhanushk2204@gmail.com");

  // Linked accounts state
  const [linkedGoogle, setLinkedGoogle] = useState(true);
  const [linkedFacebook, setLinkedFacebook] = useState(false);
  const [linkedApple, setLinkedApple] = useState(false);

  // Status & feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePersonalInfoSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Personal details updated successfully.");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        showToast("File size exceeds 1MB limit. Please choose a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
          showToast("Profile photo uploaded. Click Save Changes to confirm.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfileImage("/user-avatar.jpg");
    showToast("Profile photo reset to default avatar.");
  };

  const handleAppearanceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "Dark") {
      setTheme("dark");
    } else if (val === "Light") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
    showToast(`Appearance set to ${val}.`);
  };

  const currentAppearanceValue = theme === "light" ? "Light" : "Dark";

  const handleSendReport = () => {
    showToast(`Learner data report sent to ${reportEmail}.`);
  };

  const handleLogoutAllDevices = () => {
    showToast("Signed out of all other active sessions.");
  };

  // Theming classes
  const cardContainerClass = `rounded-2xl border transition-all duration-300 ${
    isLight
      ? "bg-white border-purple-900/15 shadow-[0_4px_20px_rgba(76,29,149,0.04)] text-slate-900"
      : "bg-[#0b0b0e] border-[#222227] text-white"
  }`;

  const labelClass = `block text-xs font-semibold mb-2 ${isLight ? "text-slate-700" : "text-neutral-200"}`;

  const inputClass = `w-full px-3.5 py-2.5 rounded-lg text-sm transition-all focus:outline-none focus:ring-1 ${
    isLight
      ? "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-purple-600 focus:ring-purple-600/30"
      : "bg-[#111116] border border-[#2b2b32] text-white placeholder-neutral-500 focus:border-neutral-400 focus:ring-white/20"
  }`;

  const secondaryBtnClass = `px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
    isLight
      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
      : "bg-[#16161b] hover:bg-[#202026] text-white border border-[#2c2c34]"
  }`;

  const saveBtnClass = `px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
    isLight
      ? "bg-purple-900 hover:bg-purple-950 text-white shadow-sm"
      : "bg-[#252836] hover:bg-[#2f3344] text-neutral-200 border border-[#3b4054]"
  }`;

  const subtitleClass = `text-xs mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`;

  return (
    <div className="w-full pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#18181f] border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-medium shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Normal Clean Page Header (No Profile Hero Banner) */}
      <div className="mb-6">
        <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
          Account settings
        </h1>

        {/* Tab Navigation Strip */}
        <div className={`flex items-center gap-6 mt-4 border-b overflow-x-auto scrollbar-none text-xs sm:text-sm font-medium transition-colors ${
          isLight ? "border-slate-200 text-slate-600" : "border-[#222227] text-neutral-400"
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`pb-3 whitespace-nowrap transition cursor-pointer relative ${
              activeTab === "account"
                ? isLight ? "text-purple-950 font-bold" : "text-white font-semibold"
                : isLight ? "hover:text-slate-900" : "hover:text-white"
            }`}
          >
            Account
            {activeTab === "account" && (
              <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isLight ? "bg-purple-900" : "bg-white"}`} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("communication")}
            className={`pb-3 whitespace-nowrap transition cursor-pointer relative ${
              activeTab === "communication"
                ? isLight ? "text-purple-950 font-bold" : "text-white font-semibold"
                : isLight ? "hover:text-slate-900" : "hover:text-white"
            }`}
          >
            Communication Preferences
            {activeTab === "communication" && (
              <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isLight ? "bg-purple-900" : "bg-white"}`} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("personalization")}
            className={`pb-3 whitespace-nowrap transition cursor-pointer relative ${
              activeTab === "personalization"
                ? isLight ? "text-purple-950 font-bold" : "text-white font-semibold"
                : isLight ? "hover:text-slate-900" : "hover:text-white"
            }`}
          >
            Personalization
            {activeTab === "personalization" && (
              <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isLight ? "bg-purple-900" : "bg-white"}`} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`pb-3 whitespace-nowrap transition cursor-pointer relative ${
              activeTab === "calendar"
                ? isLight ? "text-purple-950 font-bold" : "text-white font-semibold"
                : isLight ? "hover:text-slate-900" : "hover:text-white"
            }`}
          >
            Calendar Sync
            {activeTab === "calendar" && (
              <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isLight ? "bg-purple-900" : "bg-white"}`} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`pb-3 whitespace-nowrap transition cursor-pointer relative ${
              activeTab === "notes"
                ? isLight ? "text-purple-950 font-bold" : "text-white font-semibold"
                : isLight ? "hover:text-slate-900" : "hover:text-white"
            }`}
          >
            Notes & Highlights
            {activeTab === "notes" && (
              <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isLight ? "bg-purple-900" : "bg-white"}`} />
            )}
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: ACCOUNT (Unified into 2 clean cards: Main Settings Card + Danger Zone Card) */}
      {activeTab === "account" && (
        <div className="space-y-6">
          {/* CARD 1: MAIN ACCOUNT SETTINGS CARD */}
          <div className={`${cardContainerClass} p-6 sm:p-8 space-y-8 divide-y divide-slate-200 dark:divide-[#222227]`}>
            {/* 1. Personal Information */}
            <div className="space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Personal information</h2>
                <p className={subtitleClass}>Update your personal details and how others see you.</p>
              </div>

              <form onSubmit={handlePersonalInfoSave} className="space-y-4 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Full name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputClass}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="name@example.com"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Timezone</label>
                    <div className="relative">
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                      >
                        <option value="Kolkata">Kolkata (IST, GMT+5:30)</option>
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="America/New_York">New York (EDT, GMT-4:00)</option>
                        <option value="America/Los_Angeles">Los Angeles (PDT, GMT-7:00)</option>
                        <option value="Europe/London">London (BST, GMT+1:00)</option>
                        <option value="Asia/Singapore">Singapore (SGT, GMT+8:00)</option>
                        <option value="Asia/Tokyo">Tokyo (JST, GMT+9:00)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Language</label>
                    <div className="relative">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Español (Spanish)</option>
                        <option value="French">Français (French)</option>
                        <option value="German">Deutsch (German)</option>
                        <option value="Hindi">हिन्दी (Hindi)</option>
                        <option value="Mandarin">中文 (Mandarin)</option>
                        <option value="Japanese">日本語 (Japanese)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" className={saveBtnClass}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Profile Photo */}
            <div className="pt-8 space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Profile photo</h2>
                <p className={subtitleClass}>Maximum size: 1MB. Supported formats: JPG, GIF, or PNG.</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-1">
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-neutral-700/80 bg-neutral-900 shadow-md">
                  <img
                    src={profileImage}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={secondaryBtnClass}
                    >
                      Upload image
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className={`text-xs transition cursor-pointer ${
                        isLight ? "text-slate-600 hover:text-rose-600" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Remove photo
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => showToast("Profile photo changes saved.")}
                  className={saveBtnClass}
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* 3. Appearance */}
            <div className="pt-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight">Appearance</h2>
                  <p className={subtitleClass}>
                    Personalize the way Certify appears through theming controls.
                  </p>
                </div>

                <div className="relative min-w-[160px]">
                  <select
                    value={currentAppearanceValue}
                    onChange={handleAppearanceChange}
                    className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                  >
                    <option value="Dark">Dark</option>
                    <option value="Light">Light</option>
                    <option value="System default">System default</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Sound Effects */}
            <div className="pt-8 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight">Sound effects</h2>
                  <p className={subtitleClass}>
                    Celebratory sounds that play after you complete items, modules, and pass assessments.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={soundEffects}
                  onClick={() => {
                    setSoundEffects(!soundEffects);
                    showToast(!soundEffects ? "Sound effects enabled." : "Sound effects muted.");
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    soundEffects ? "bg-indigo-600" : isLight ? "bg-slate-300" : "bg-neutral-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      soundEffects ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 5. Verify My ID */}
            <div className="pt-8 space-y-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">Verify My ID</h2>
              <p className={subtitleClass}>
                Your name, <span className="font-semibold text-slate-900 dark:text-white">{fullName}</span>, is verified. This is the name that will appear on your certificates. If you have questions or need help with your ID Verification, visit our{" "}
                <a
                  href="#verification-support"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast("Opening ID Verification support...");
                  }}
                  className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  ID Verification support page
                </a>
                .
              </p>
            </div>

            {/* 6. Two Factor Authentication */}
            <div className="pt-8 space-y-4">
              <div className="flex items-start justify-between gap-6">
                <div className="pr-2">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight">Two factor authentication</h2>
                  <p className={subtitleClass}>
                    Two-factor authentication adds an additional layer of security to your Certify account. Each time you log in to Certify, you will be asked to enter a unique code that is only available on your mobile phone. This extra protection ensures that you are the only one who will have access to your Certify account and courses.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={twoFactorAuth}
                  onClick={() => {
                    setTwoFactorAuth(!twoFactorAuth);
                    showToast(
                      !twoFactorAuth
                        ? "Two-factor authentication enabled via mobile authenticator."
                        : "Two-factor authentication disabled."
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-1 ${
                    twoFactorAuth ? "bg-indigo-600" : isLight ? "bg-slate-300" : "bg-neutral-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      twoFactorAuth ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 7. Connected Devices */}
            <div className="pt-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight">Connected devices</h2>
                  <p className={subtitleClass}>
                    If your account has been logged into on multiple devices, you can log out from here.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogoutAllDevices}
                  className={secondaryBtnClass}
                >
                  Log out from all devices
                </button>
              </div>
            </div>

            {/* 8. Linked Accounts */}
            <div className="pt-8 space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Linked accounts</h2>
                <p className={subtitleClass}>
                  Enable one-click login and receive more personalized course recommendations.
                </p>
              </div>

              {/* Warning Alert Banner */}
              <div className={`p-3.5 rounded-lg border text-xs flex items-center gap-2.5 ${
                isLight ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-[#271708] border-amber-900/60 text-amber-200/95"
              }`}>
                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Unlink your Google account to log in with linked accounts.</span>
              </div>

              {/* Providers */}
              <div className="space-y-3 pt-1">
                {/* Facebook */}
                <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-neutral-800/40">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center bg-[#1877F2] text-white rounded text-xs font-bold">
                      f
                    </div>
                    <span className="text-xs sm:text-sm font-medium">Facebook</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLinkedFacebook(!linkedFacebook);
                      showToast(linkedFacebook ? "Facebook account unlinked." : "Facebook account linked.");
                    }}
                    className={secondaryBtnClass}
                  >
                    {linkedFacebook ? "Unlink" : "Link"}
                  </button>
                </div>

                {/* Apple */}
                <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-neutral-800/40">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.86.96-2.84-.93.04-2.07.62-2.73 1.4-.58.67-1.09 1.76-.95 2.81 1.04.08 2.08-.59 2.72-1.37z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium">Apple</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLinkedApple(!linkedApple);
                      showToast(linkedApple ? "Apple account unlinked." : "Apple account linked.");
                    }}
                    className={secondaryBtnClass}
                  >
                    {linkedApple ? "Unlink" : "Link"}
                  </button>
                </div>

                {/* Google */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span className="text-xs sm:text-sm font-medium">Google</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLinkedGoogle(!linkedGoogle);
                      showToast(linkedGoogle ? "Google account unlinked." : "Google account linked.");
                    }}
                    className={secondaryBtnClass}
                  >
                    {linkedGoogle ? "Unlink" : "Link"}
                  </button>
                </div>
              </div>
            </div>

            {/* 9. Learner Data Report */}
            <div className="pt-8 space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Learner data report</h2>
                <p className={subtitleClass}>
                  Request a report of all learner data stored by Certify about your account. This report will be sent to the e-mail address below.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <input
                  type="email"
                  value={reportEmail}
                  onChange={(e) => setReportEmail(e.target.value)}
                  className={inputClass}
                  placeholder="your.email@domain.com"
                />

                <div>
                  <button
                    type="button"
                    onClick={handleSendReport}
                    className={saveBtnClass}
                  >
                    Send report
                  </button>
                </div>

                <p className={`text-xs ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                  To change email, please adjust the email settings at the top of this page.
                </p>
              </div>
            </div>
          </div>

          {/* CARD 2: DANGER ZONE CARD (Isolated, clean delete card) */}
          <div className={`${cardContainerClass} p-6 sm:p-8 space-y-4 border-red-500/30 dark:border-red-900/40`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-red-500">
                  Delete account
                </h2>
                <p className={subtitleClass}>
                  If you delete your account, your personal information will be wiped from Certify&apos;s servers, all of your course activity will be anonymized and any certificates earned will be deleted.{" "}
                  <span className="text-red-400 font-medium">This action cannot be undone!</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-transparent border border-[#3b3b44] hover:border-red-500/70 hover:bg-red-500/10 hover:text-red-400 transition cursor-pointer shrink-0"
              >
                Delete account
              </button>
            </div>

            {/* Warning alert banner */}
            <div className={`p-3.5 rounded-lg border text-xs flex items-center gap-2.5 ${
              isLight ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-[#271708] border-amber-900/60 text-amber-200/95"
            }`}>
              <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Cancel any active subscriptions before you delete your account.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMMUNICATION PREFERENCES */}
      {activeTab === "communication" && (
        <div className={`${cardContainerClass} p-6 sm:p-8 space-y-4`}>
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Email Notifications</h2>
          <p className={subtitleClass}>Manage the updates and digests you receive from Certify.</p>
          <div className="mt-5 space-y-4">
            {[
              { title: "Weekly Progress Digest", desc: "A summary of concept mastery, coding hours, and oral defense milestones." },
              { title: "Course Announcements", desc: "Important updates from instructors, lab releases, and grading updates." },
              { title: "Research & Beta Features", desc: "Invitations to test new Socratic AI mentorship modules and give feedback." },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-neutral-800/40">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold">{item.title}</h3>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-neutral-400"}`}>{item.desc}</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-indigo-600 cursor-pointer" />
              </div>
            ))}
          </div>
          <div className="mt-5">
            <button type="button" onClick={() => showToast("Communication preferences saved.")} className={saveBtnClass}>
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PERSONALIZATION */}
      {activeTab === "personalization" && (
        <div className={`${cardContainerClass} p-6 sm:p-8 space-y-4`}>
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Learning & Recommendations</h2>
          <p className={subtitleClass}>Help Certify personalize your learning pathway and practice problems.</p>
          <div className="mt-5 space-y-4">
            <div>
              <label className={labelClass}>Primary Career Goal</label>
              <select className={`${inputClass} appearance-none pr-10 cursor-pointer`}>
                <option>Software Engineering & Distributed Systems</option>
                <option>Machine Learning & AI Research</option>
                <option>Full-Stack Web Development</option>
                <option>Data Engineering & Big Data</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Weekly Learning Target</label>
              <select className={`${inputClass} appearance-none pr-10 cursor-pointer`}>
                <option>3 to 5 hours / week (Casual)</option>
                <option>5 to 10 hours / week (Recommended)</option>
                <option>10+ hours / week (Intensive)</option>
              </select>
            </div>
          </div>
          <div className="mt-5">
            <button type="button" onClick={() => showToast("Personalization preferences updated.")} className={saveBtnClass}>
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: CALENDAR SYNC */}
      {activeTab === "calendar" && (
        <div className={`${cardContainerClass} p-6 sm:p-8 space-y-4`}>
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Calendar Integrations</h2>
          <p className={subtitleClass}>Synchronize coursework milestones, coding challenges, and exam deadlines with your personal calendar.</p>
          <div className="mt-5 space-y-3">
            {[
              { name: "Google Calendar", status: "Not connected" },
              { name: "Apple iCal", status: "Not connected" },
              { name: "Microsoft Outlook", status: "Not connected" },
            ].map((cal, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-neutral-800/40">
                <span className="text-xs sm:text-sm font-semibold">{cal.name}</span>
                <button type="button" onClick={() => showToast(`Sync link generated for ${cal.name}.`)} className={secondaryBtnClass}>
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: NOTES & HIGHLIGHTS */}
      {activeTab === "notes" && (
        <div className={`${cardContainerClass} p-6 sm:p-8 space-y-4`}>
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Notes & Highlights Export</h2>
          <p className={subtitleClass}>Export notes, code snippets, and bookmarks saved during your courses.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => showToast("Exporting notes as Markdown archive...")} className={secondaryBtnClass}>
              Export as Markdown (.zip)
            </button>
            <button type="button" onClick={() => showToast("Exporting notes as PDF dossier...")} className={secondaryBtnClass}>
              Export as PDF Dossier
            </button>
            <button type="button" onClick={() => showToast("Syncing with Notion workspace...")} className={secondaryBtnClass}>
              Sync with Notion
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${
            isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#121217] border-neutral-800 text-white"
          }`}>
            <div className="flex items-center gap-3 text-red-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-bold">Delete Certify Account</h3>
            </div>
            <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              This action is permanent and cannot be undone. All course progress, certificates, Bayesian mastery records, and oral defense transcripts will be permanently purged.
            </p>
            <div>
              <label className={labelClass}>Type &ldquo;DELETE&rdquo; to confirm</label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className={inputClass}
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                className={secondaryBtnClass}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== "DELETE"}
                onClick={() => {
                  setShowDeleteModal(false);
                  showToast("Account scheduled for deletion. Signing out...");
                  setTimeout(() => {
                    if (onLogout) onLogout();
                  }, 1200);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  deleteConfirmText === "DELETE"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-red-950/40 text-red-400/40 cursor-not-allowed"
                }`}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
