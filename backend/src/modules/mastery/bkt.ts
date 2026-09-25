export interface BKTParameters {
  pT: number; // Probability of learning transition
  pG: number; // Probability of lucky guess
  pS: number; // Probability of slip/careless mistake
}

export const DEFAULT_BKT_PARAMS: BKTParameters = {
  pT: 0.20,
  pG: 0.10,
  pS: 0.05,
};

export class BayesianKnowledgeTracer {
  /**
   * Updates probability of concept mastery given an atomic observation.
   * Uses standard Bayesian Knowledge Tracing formulations.
   */
  public static update(
    pCurrent: number,
    isDemonstrated: boolean,
    params: BKTParameters = DEFAULT_BKT_PARAMS
  ): number {
    const { pT, pG, pS } = params;
    const clampedPrior = Math.min(Math.max(pCurrent, 0.01), 0.99);

    let pPosterior: number;
    if (isDemonstrated) {
      // P(L|Obs=1) = (P(L) * (1 - pS)) / (P(L) * (1 - pS) + (1 - P(L)) * pG)
      const num = clampedPrior * (1 - pS);
      const denom = num + (1 - clampedPrior) * pG;
      pPosterior = num / denom;
    } else {
      // P(L|Obs=0) = (P(L) * pS) / (P(L) * pS + (1 - P(L)) * (1 - pG))
      const num = clampedPrior * pS;
      const denom = num + (1 - clampedPrior) * (1 - pG);
      pPosterior = num / denom;
    }

    // Next step transition: P(L_t+1) = P(L|Obs) + (1 - P(L|Obs)) * pT
    const pNext = pPosterior + (1 - pPosterior) * pT;
    return Number(Math.min(Math.max(pNext, 0.01), 0.99).toFixed(4));
  }
}

export interface EvidenceComponents {
  chapterMasteryScore: number;    // Mean P(Mastery) across all chapters (0.0 - 1.0)
  practicalPerformance: number;   // Unit test / AST execution score (0.0 - 1.0)
  vivaDefenseScore: number;       // Evaluator score during oral defense (0.0 - 1.0)
  consistencyIndex: number;       // Consistency of performance across chapters (0.0 - 1.0)
  interactionDepthScore: number;  // Socratic engagement & question depth (0.0 - 1.0)
}

export type CredentialTier = "NONE" | "FOUNDATION" | "PROFICIENT" | "ADVANCED";

export class CertificationEvaluator {
  /**
   * Deterministically calculates composite evidence score and awards tier.
   * Formula: 0.30 * Chap + 0.25 * Pract + 0.20 * Viva + 0.15 * Consist + 0.10 * Inter
   */
  public static evaluateCredential(evidence: EvidenceComponents): {
    compositeScore: number;
    tier: CredentialTier;
    isCertified: boolean;
    reasons: string[];
  } {
    const compositeScore = Number(
      (
        0.30 * evidence.chapterMasteryScore +
        0.25 * evidence.practicalPerformance +
        0.20 * evidence.vivaDefenseScore +
        0.15 * evidence.consistencyIndex +
        0.10 * evidence.interactionDepthScore
      ).toFixed(4)
    );

    const reasons: string[] = [];

    // Gating rule: chapter mastery must be at least 0.70 for any certificate
    if (evidence.chapterMasteryScore < 0.70) {
      reasons.push("Chapter mastery average is below the 0.70 foundational threshold.");
      return { compositeScore, tier: "NONE", isCertified: false, reasons };
    }

    if (
      compositeScore >= 0.92 &&
      evidence.practicalPerformance >= 0.90 &&
      evidence.vivaDefenseScore >= 0.90 &&
      evidence.consistencyIndex >= 0.85
    ) {
      reasons.push("Demonstrated exemplary mastery across theory, practical execution, and architectural defense.");
      return { compositeScore, tier: "ADVANCED", isCertified: true, reasons };
    }

    if (
      compositeScore >= 0.85 &&
      evidence.practicalPerformance >= 0.80 &&
      evidence.vivaDefenseScore >= 0.75
    ) {
      reasons.push("Demonstrated solid proficiency with strong practical implementation and reasoning.");
      return { compositeScore, tier: "PROFICIENT", isCertified: true, reasons };
    }

    if (compositeScore >= 0.70) {
      reasons.push("Demonstrated consistent foundational understanding across all core chapter concepts.");
      return { compositeScore, tier: "FOUNDATION", isCertified: true, reasons };
    }

    reasons.push("Composite evidence did not satisfy the 0.70 minimum threshold.");
    return { compositeScore, tier: "NONE", isCertified: false, reasons };
  }
}
