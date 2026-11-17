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

export interface RubricCriterionNode {
  id: string;
  criterionCode: string | null;
  statement: string;
  weight: number;
  tierRequired: string;
  cognitiveLevel: string;
  status: "NOT_STARTED" | "ATTEMPTED" | "PARTIAL" | "DEMONSTRATED" | "MASTERED";
  pCriterion: number;
  latestScore: number;
  bestScore: number;
  demonstratedCount: number;
  failedCount: number;
  misconceptionCount: number;
  lastMisconception: string | null;
}

export interface SectionProgressionNode {
  id: string;
  sectionType:
    | "CONCEPT_INTUITION"
    | "TECHNICAL_MECHANICS"
    | "PITFALLS_AND_DEBUGGING"
    | "CHAPTER_CHECKPOINT"
    | "MODULE_PRACTICAL";
  title: string;
  objective: string;
  sequenceOrder: number;
  minTurns: number;
  status: "LOCKED" | "UNLOCKED" | "IN_PROGRESS" | "COMPLETED";
  turnsCompleted: number;
  rubricPassRatio: number;
  readyToAdvance: boolean;
}

export interface ChapterProgressionNode {
  id: string;
  title: string;
  sequenceOrder: number;
  estimatedMins: number;
  status: "LOCKED" | "UNLOCKED" | "IN_PROGRESS" | "AWAITING_CHECKPOINT" | "REMEDIATING" | "COMPLETED";
  currentSectionOrder: number;
  checkpointScore: number | null;
  checkpointAttempts: number;
  remediationCycles: number;
  sections: SectionProgressionNode[];
  concepts: Array<{
    id: string;
    slug: string;
    name: string;
    pMastery: number;
    state: string;
    criteria: RubricCriterionNode[];
  }>;
}

export interface ModuleProgressionNode {
  id: string;
  slug: string;
  title: string;
  sequenceOrder: number;
  practicalTaskId: string | null;
  status: "LOCKED" | "UNLOCKED" | "IN_PROGRESS" | "COMPLETED";
  chaptersCompleted: number;
  totalChapters: number;
  practicalPassed: boolean;
  practicalScore: number | null;
  moduleRubricScore: number | null;
  chapters: ChapterProgressionNode[];
}

export interface ProgressionTree {
  enrollmentId: string;
  course: { id: string; slug: string; title: string };
  status: string;
  currentTier: string;
  currentChapterId: string | null;
  summary: {
    modulesCompleted: number;
    modulesTotal: number;
    chaptersCompleted: number;
    chaptersTotal: number;
    sectionsCompleted: number;
    sectionsTotal: number;
    percentComplete: number;
  };
  modules: ModuleProgressionNode[];
}

export interface SkillReportEntry {
  skillDimensionId: string;
  skillSlug: string;
  skillName: string;
  description: string;
  compositeScore: number;
  rubricPassRate: number;
  bktMeanMastery: number;
  practicalScore: number | null;
  criteriaEvaluated: number;
  criteriaTotal: number;
  misconceptionCount: number;
  classification: "UNASSESSED" | "WEAKPOINT" | "DEVELOPING" | "STRENGTH";
  evidenceSummary: string;
  weakestCriteria: Array<{
    criterionId: string;
    criterionCode: string | null;
    statement: string;
    cognitiveLevel: string;
    latestScore: number;
    pCriterion: number;
    lastMisconception: string | null;
    chapterId: string;
    chapterTitle: string;
    moduleTitle: string;
  }>;
}

export interface SkillsReport {
  enrollmentId: string;
  course: { id: string; slug: string; title: string };
  overallProgress: {
    modulesCompleted: number;
    modulesTotal: number;
    chaptersCompleted: number;
    chaptersTotal: number;
    sectionsCompleted: number;
    sectionsTotal: number;
    percentComplete: number;
    currentTier: string;
    overallSkillScore: number;
  };
  strengths: SkillReportEntry[];
  developing: SkillReportEntry[];
  weakpoints: SkillReportEntry[];
  unassessed: SkillReportEntry[];
  cognitiveBreakdown: Record<string, { score: number | null; evaluatedCount: number }>;
  remediationQueue: Array<{
    priority: number;
    criterionId: string;
    criterionCode: string | null;
    statement: string;
    cognitiveLevel: string;
    status: string;
    latestScore: number;
    misconceptionCount: number;
    lastMisconception: string | null;
    chapterId: string;
    chapterTitle: string;
    moduleTitle: string;
  }>;
  driftSummary: {
    totalDriftEvents: number;
    futureTopicRedirects: number;
    skipAttemptsBlocked: number;
    offTopicRedirects: number;
  };
}
