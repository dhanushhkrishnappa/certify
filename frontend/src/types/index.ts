export interface User {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  role: string;
  emailVerified?: boolean;
  image?: string | null;
  bio?: string | null;
  timezone?: string | null;
  language?: string | null;
  dob?: string | null;
  persona?: string | null;
  primaryGoal?: string | null;
  onboardingCompleted?: boolean;
  createdAt?: string;
}

export interface CourseCatalogItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  version: string;
  moduleCount: number;
  chapterCount: number;
  tierOfferings: string[];
  level?: string;
  duration?: string;
  category?: string;
}

export interface Concept {
  id: string;
  slug: string;
  name: string;
  description: string;
  criteria?: {
    id: string;
    statement: string;
    weight: number;
    tier: string;
  }[];
}

export interface Chapter {
  id: string;
  title: string;
  sequenceOrder: number;
  teachingContent?: string;
  concepts: Concept[];
}

export interface Module {
  id: string;
  title: string;
  sequenceOrder: number;
  chapters: Chapter[];
}

export interface CourseDetail {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description?: string;
  version: string;
  tierOfferings: string[];
  modules: Module[];
}

export interface ChatMessage {
  id: string;
  sender: "LEARNER" | "AI_TUTOR" | "SYSTEM" | "USER";
  content: string;
  createdAt: string;
}

export interface ConceptMastery {
  id?: string;
  conceptId: string;
  conceptName: string;
  concept?: { id?: string; name: string };
  pKnown: number;
  pMastery?: number;
  status: "UNENCOUNTERED" | "LEARNING" | "NEEDS_REMEDIATION" | "ADVANCED";
  state?: string;
}


export interface LearningSessionContext {
  course: { id: string; slug: string; title: string };
  enrollment: { id: string; currentTier: string; status: string };
  session: {
    id: string;
    phase: string;
    chapter: Chapter;
    messages: ChatMessage[];
  };
  conceptMasteries: ConceptMastery[];
  curriculum: Module[];
}

export interface Question {
  id: string;
  questionType: string;
  prompt: string;
  tier: string;
}

export interface Certificate {
  id: string;
  credentialId: string;
  tier: "FOUNDATION" | "PROFICIENT" | "ADVANCED";
  compositeScore: number;
  evidenceSummary: string;
  status: string;
  issuedAt: string;
}

export interface PublicVerification {
  id?: string;
  isValid?: boolean;
  verified?: boolean;
  credentialId: string;
  recipientName?: string;
  learnerName?: string;
  courseTitle: string;
  tier?: string;
  masteryLevel?: string;
  skills?: string[];
  compositeScore?: number;
  status?: string;
  issuedAt?: string;
  issueDate?: string;
  evidenceSummary?: {
    courseTitle?: string;
    chapterMastery?: number;
    practicalPerformance?: number;
    vivaDefenseScore?: number;
    consistencyIndex?: number;
    compositeScore?: number;
    evaluatedAt?: string;
    modulesCompleted?: number;
    assessmentsPassed?: number;
    projectCompleted?: boolean;
    vivaCleared?: boolean;
    finalScore?: number;
  };
  signatureHash?: string;
  trustNotice?: string;
}
