/**
 * Deterministic scoring engines for all 10 cognitive exercises.
 * Clean, pure functions with testable outcomes, accurate metrics, and signal detection measures.
 */

// 1. Digit Span Scoring
export function scoreDigitSpan(
  targetSequence: number[],
  userSequence: number[],
  mode: 'forward' | 'backward'
): { isCorrect: boolean; matchedCount: number; accuracy: number } {
  const expected = mode === 'backward' ? [...targetSequence].reverse() : targetSequence;
  if (userSequence.length === 0) {
    return { isCorrect: false, matchedCount: 0, accuracy: 0 };
  }
  
  let matches = 0;
  for (let i = 0; i < Math.min(expected.length, userSequence.length); i++) {
    if (expected[i] === userSequence[i]) {
      matches++;
    }
  }

  const isExact = expected.length === userSequence.length && matches === expected.length;
  const accuracy = Math.round((matches / Math.max(expected.length, userSequence.length)) * 100);

  return {
    isCorrect: isExact,
    matchedCount: matches,
    accuracy
  };
}

// 2. Sequence Memory Scoring
export function scoreSequenceMemory(
  sequence: number[],
  userClicks: number[]
): { isCorrect: boolean; matchedCount: number; maxLevel: number } {
  let matched = 0;
  for (let i = 0; i < userClicks.length; i++) {
    if (userClicks[i] === sequence[i]) {
      matched++;
    } else {
      break;
    }
  }
  const isCorrect = userClicks.length === sequence.length && matched === sequence.length;
  return {
    isCorrect,
    matchedCount: matched,
    maxLevel: sequence.length
  };
}

// 3. N-Back Scoring
export interface NBackTrial {
  stimulus: string | number;
  isMatch: boolean;
  userRespondedMatch: boolean;
  reactionTimeMs?: number;
}

export function scoreNBack(
  trials: NBackTrial[],
  n: number
): {
  hits: number;
  misses: number;
  falseAlarms: number;
  correctRejections: number;
  totalValidTrials: number;
  accuracy: number;
  dPrime: number;
  averageReactionTimeMs: number;
} {
  // Trials before n cannot be evaluated as matches
  const validTrials = trials.slice(n);
  let hits = 0;
  let misses = 0;
  let falseAlarms = 0;
  let correctRejections = 0;
  let reactionTimes: number[] = [];

  for (const t of validTrials) {
    if (t.isMatch) {
      if (t.userRespondedMatch) {
        hits++;
        if (t.reactionTimeMs) reactionTimes.push(t.reactionTimeMs);
      } else {
        misses++;
      }
    } else {
      if (t.userRespondedMatch) {
        falseAlarms++;
      } else {
        correctRejections++;
      }
    }
  }

  const total = validTrials.length;
  const correct = hits + correctRejections;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Signal detection d-prime approximation (Hautus correction for extreme 0 or 1)
  const hitRate = (hits + 0.5) / (hits + misses + 1);
  const faRate = (falseAlarms + 0.5) / (falseAlarms + correctRejections + 1);
  
  // Approximate inverse normal CDF (probit)
  const probit = (p: number) => {
    // Rational approximation for normal quantile
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const q = p - 0.5;
    if (Math.abs(q) <= 0.42) {
      const r = q * q;
      return q * (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) /
                 (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    }
    const r = p < 0.5 ? p : 1 - p;
    const s = Math.sqrt(-Math.log(r));
    const val = 2.515517 + 0.802853 * s + 0.010328 * s * s;
    const denom = 1 + 1.432788 * s + 0.189269 * s * s + 0.001308 * s * s * s;
    const z = s - val / denom;
    return p < 0.5 ? -z : z;
  };

  const dPrime = Number((probit(hitRate) - probit(faRate)).toFixed(2));
  const avgRt = reactionTimes.length > 0 
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) 
    : 0;

  return {
    hits,
    misses,
    falseAlarms,
    correctRejections,
    totalValidTrials: total,
    accuracy,
    dPrime,
    averageReactionTimeMs: avgRt
  };
}

// 4. Visual Matrix Recall Scoring
export function scoreVisualMatrix(
  targetIndices: number[],
  selectedIndices: number[]
): {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  isExactMatch: boolean;
  score: number;
} {
  const targetSet = new Set(targetIndices);
  const selectedSet = new Set(selectedIndices);

  let truePositives = 0;
  let falsePositives = 0;

  selectedSet.forEach(idx => {
    if (targetSet.has(idx)) {
      truePositives++;
    } else {
      falsePositives++;
    }
  });

  const falseNegatives = targetSet.size - truePositives;
  const precision = selectedSet.size > 0 ? truePositives / selectedSet.size : 0;
  const recall = targetSet.size > 0 ? truePositives / targetSet.size : 0;
  const isExactMatch = falsePositives === 0 && falseNegatives === 0 && truePositives === targetSet.size;

  // F1 or balanced accuracy score 0-100
  const score = targetSet.size > 0 ? Math.max(0, Math.round(((truePositives - falsePositives * 0.5) / targetSet.size) * 100)) : 0;

  return {
    truePositives,
    falsePositives,
    falseNegatives,
    precision: Math.round(precision * 100),
    recall: Math.round(recall * 100),
    isExactMatch,
    score: Math.min(100, Math.max(0, score))
  };
}

// 5. Word List Recall Scoring
export function scoreWordRecall(
  targetWords: string[],
  userWords: string[]
): {
  correctRecalled: string[];
  omissions: string[];
  intrusions: string[];
  duplicates: string[];
  accuracy: number;
} {
  const normalizedTargets = targetWords.map(w => w.trim().toLowerCase());
  const seenUserWords = new Set<string>();
  const correctRecalled: string[] = [];
  const intrusions: string[] = [];
  const duplicates: string[] = [];

  for (const raw of userWords) {
    const cleaned = raw.trim().toLowerCase();
    if (!cleaned) continue;
    if (seenUserWords.has(cleaned)) {
      duplicates.push(raw);
      continue;
    }
    seenUserWords.add(cleaned);

    const matchIndex = normalizedTargets.indexOf(cleaned);
    if (matchIndex !== -1) {
      correctRecalled.push(targetWords[matchIndex]);
    } else {
      intrusions.push(raw);
    }
  }

  const correctlyRecalledSet = new Set(correctRecalled.map(w => w.toLowerCase()));
  const omissions = targetWords.filter(w => !correctlyRecalledSet.has(w.toLowerCase()));
  const accuracy = targetWords.length > 0 ? Math.round((correctRecalled.length / targetWords.length) * 100) : 0;

  return {
    correctRecalled,
    omissions,
    intrusions,
    duplicates,
    accuracy
  };
}

// 6. Paired Associate Learning Scoring
export function scorePairedAssociates(
  pairs: { cue: string; target: string }[],
  userResponses: Record<string, string>
): {
  correctCount: number;
  totalCount: number;
  accuracy: number;
  details: { cue: string; target: string; userAns: string; isCorrect: boolean }[];
} {
  let correctCount = 0;
  const details = pairs.map(p => {
    const userAns = (userResponses[p.cue] || '').trim().toLowerCase();
    const isCorrect = userAns === p.target.trim().toLowerCase();
    if (isCorrect) correctCount++;
    return {
      cue: p.cue,
      target: p.target,
      userAns: userResponses[p.cue] || '',
      isCorrect
    };
  });

  const accuracy = pairs.length > 0 ? Math.round((correctCount / pairs.length) * 100) : 0;

  return {
    correctCount,
    totalCount: pairs.length,
    accuracy,
    details
  };
}

// 7. Pattern Recall Scoring
export function scorePatternRecall(
  targetGrid: boolean[],
  userGrid: boolean[]
): { matchedCells: number; totalCells: number; accuracy: number; isExact: boolean } {
  let matched = 0;
  const len = Math.min(targetGrid.length, userGrid.length);
  for (let i = 0; i < len; i++) {
    if (targetGrid[i] === userGrid[i]) {
      matched++;
    }
  }
  const isExact = matched === targetGrid.length && targetGrid.length === userGrid.length;
  const accuracy = targetGrid.length > 0 ? Math.round((matched / targetGrid.length) * 100) : 0;
  return {
    matchedCells: matched,
    totalCells: targetGrid.length,
    accuracy,
    isExact
  };
}

// 8. Running Memory Scoring
export function scoreRunningMemory(
  fullStream: (string | number)[],
  windowN: number,
  userResponses: (string | number)[]
): {
  targetWindow: (string | number)[];
  correctMatches: number;
  accuracy: number;
  isExact: boolean;
} {
  const targetWindow = fullStream.slice(-windowN);
  let correctMatches = 0;

  for (let i = 0; i < windowN; i++) {
    const expected = String(targetWindow[i] ?? '').trim().toLowerCase();
    const userVal = String(userResponses[i] ?? '').trim().toLowerCase();
    if (expected && userVal && expected === userVal) {
      correctMatches++;
    }
  }

  const isExact = correctMatches === windowN && userResponses.length === windowN;
  const accuracy = windowN > 0 ? Math.round((correctMatches / windowN) * 100) : 0;

  return {
    targetWindow,
    correctMatches,
    accuracy,
    isExact
  };
}

// 9. Delayed Recall Scoring
export function scoreDelayedRecall(
  targets: string[],
  recalledWords: string[],
  distractorAccuracy: number,
  delayDurationSeconds: number
): {
  recalledCount: number;
  totalTargets: number;
  recallAccuracy: number;
  distractorAccuracy: number;
  delayDurationSeconds: number;
  compositeScore: number;
} {
  const { correctRecalled } = scoreWordRecall(targets, recalledWords);
  const recallAccuracy = targets.length > 0 ? Math.round((correctRecalled.length / targets.length) * 100) : 0;
  const compositeScore = Math.round(recallAccuracy * 0.8 + distractorAccuracy * 0.2);

  return {
    recalledCount: correctRecalled.length,
    totalTargets: targets.length,
    recallAccuracy,
    distractorAccuracy,
    delayDurationSeconds,
    compositeScore
  };
}

// 10. Attention and Target Detection Scoring
export interface AttentionTrial {
  isTarget: boolean;
  userResponded: boolean;
  reactionTimeMs?: number;
}

export function scoreAttentionDetection(
  trials: AttentionTrial[]
): {
  hits: number;
  misses: number;
  falseAlarms: number;
  correctRejections: number;
  totalTrials: number;
  accuracy: number;
  averageReactionTimeMs: number;
} {
  let hits = 0;
  let misses = 0;
  let falseAlarms = 0;
  let correctRejections = 0;
  const reactionTimes: number[] = [];

  for (const t of trials) {
    if (t.isTarget) {
      if (t.userResponded) {
        hits++;
        if (t.reactionTimeMs) reactionTimes.push(t.reactionTimeMs);
      } else {
        misses++;
      }
    } else {
      if (t.userResponded) {
        falseAlarms++;
      } else {
        correctRejections++;
      }
    }
  }

  const total = trials.length;
  const correct = hits + correctRejections;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const avgRt = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  return {
    hits,
    misses,
    falseAlarms,
    correctRejections,
    totalTrials: total,
    accuracy,
    averageReactionTimeMs: avgRt
  };
}
