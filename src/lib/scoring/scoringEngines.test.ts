import { describe, it, expect } from 'vitest';
import {
  scoreDigitSpan,
  scoreSequenceMemory,
  scoreNBack,
  scoreVisualMatrix,
  scoreWordRecall,
  scorePairedAssociates,
  scorePatternRecall,
  scoreRunningMemory,
  scoreDelayedRecall,
  scoreAttentionDetection
} from './scoringEngines';

describe('Scoring Engines - Cognitive Test Validation', () => {
  // 1. Digit Span
  describe('scoreDigitSpan', () => {
    it('accurately evaluates forward recall', () => {
      const target = [3, 8, 2, 7, 5];
      const user = [3, 8, 2, 7, 5];
      const result = scoreDigitSpan(target, user, 'forward');
      expect(result.isCorrect).toBe(true);
      expect(result.accuracy).toBe(100);
      expect(result.matchedCount).toBe(5);
    });

    it('accurately evaluates backward recall', () => {
      const target = [1, 4, 9, 2];
      const user = [2, 9, 4, 1]; // reversed
      const result = scoreDigitSpan(target, user, 'backward');
      expect(result.isCorrect).toBe(true);
      expect(result.accuracy).toBe(100);
    });

    it('handles empty responses safely', () => {
      const target = [1, 2, 3];
      const result = scoreDigitSpan(target, [], 'forward');
      expect(result.isCorrect).toBe(false);
      expect(result.accuracy).toBe(0);
      expect(result.matchedCount).toBe(0);
    });

    it('calculates partial match accuracy', () => {
      const target = [5, 6, 7, 8];
      const user = [5, 6, 9, 8];
      const result = scoreDigitSpan(target, user, 'forward');
      expect(result.isCorrect).toBe(false);
      expect(result.matchedCount).toBe(3);
      expect(result.accuracy).toBe(75);
    });
  });

  // 2. Sequence Memory
  describe('scoreSequenceMemory', () => {
    it('evaluates exact sequences', () => {
      const seq = [0, 4, 8, 2];
      const clicks = [0, 4, 8, 2];
      const result = scoreSequenceMemory(seq, clicks);
      expect(result.isCorrect).toBe(true);
      expect(result.matchedCount).toBe(4);
    });

    it('stops matchedCount on first error', () => {
      const seq = [1, 2, 3, 4];
      const clicks = [1, 5, 3, 4]; // error at index 1
      const result = scoreSequenceMemory(seq, clicks);
      expect(result.isCorrect).toBe(false);
      expect(result.matchedCount).toBe(1);
    });
  });

  // 3. N-Back
  describe('scoreNBack', () => {
    it('excludes initial N items from match scoring', () => {
      // 2-Back with 4 items: items at index 0 and 1 are warmup
      const trials = [
        { stimulus: 'A', isMatch: false, userRespondedMatch: false },
        { stimulus: 'B', isMatch: false, userRespondedMatch: false },
        { stimulus: 'A', isMatch: true, userRespondedMatch: true, reactionTimeMs: 400 },
        { stimulus: 'C', isMatch: false, userRespondedMatch: false }
      ];
      const scored = scoreNBack(trials, 2);
      expect(scored.totalValidTrials).toBe(2);
      expect(scored.hits).toBe(1);
      expect(scored.correctRejections).toBe(1);
      expect(scored.misses).toBe(0);
      expect(scored.falseAlarms).toBe(0);
      expect(scored.accuracy).toBe(100);
      expect(scored.averageReactionTimeMs).toBe(400);
    });

    it('correctly tallies false alarms and misses', () => {
      const trials = [
        { stimulus: 'X', isMatch: true, userRespondedMatch: false }, // miss
        { stimulus: 'Y', isMatch: false, userRespondedMatch: true } // false alarm
      ];
      const scored = scoreNBack(trials, 0);
      expect(scored.misses).toBe(1);
      expect(scored.falseAlarms).toBe(1);
      expect(scored.hits).toBe(0);
      expect(scored.correctRejections).toBe(0);
      expect(scored.accuracy).toBe(0);
    });
  });

  // 4. Visual Matrix Recall
  describe('scoreVisualMatrix', () => {
    it('evaluates exact grid match', () => {
      const targets = [2, 5, 8];
      const selected = [2, 5, 8];
      const result = scoreVisualMatrix(targets, selected);
      expect(result.isExactMatch).toBe(true);
      expect(result.precision).toBe(100);
      expect(result.recall).toBe(100);
      expect(result.falsePositives).toBe(0);
    });

    it('handles false positives and false negatives', () => {
      const targets = [1, 2, 3];
      const selected = [1, 2, 4]; // 4 is false positive, 3 is false negative
      const result = scoreVisualMatrix(targets, selected);
      expect(result.isExactMatch).toBe(false);
      expect(result.truePositives).toBe(2);
      expect(result.falsePositives).toBe(1);
      expect(result.falseNegatives).toBe(1);
    });
  });

  // 5. Word List Recall
  describe('scoreWordRecall', () => {
    it('matches case-insensitively and filters duplicates and intrusions', () => {
      const targets = ['Anchor', 'Bridge', 'Castle', 'Dolphin'];
      const user = ['anchor', 'BRIDGE', 'anchor', 'Spacecraft', 'castle'];

      const result = scoreWordRecall(targets, user);
      expect(result.correctRecalled).toEqual(['Anchor', 'Bridge', 'Castle']);
      expect(result.omissions).toEqual(['Dolphin']);
      expect(result.duplicates).toEqual(['anchor']);
      expect(result.intrusions).toEqual(['Spacecraft']);
      expect(result.accuracy).toBe(75);
    });
  });

  // 6. Paired Associates
  describe('scorePairedAssociates', () => {
    it('evaluates cued recall responses with trimming and case-insensitivity', () => {
      const pairs = [
        { cue: 'Sun', target: '42' },
        { cue: 'River', target: 'Boat' }
      ];
      const responses = {
        Sun: ' 42 ',
        River: 'boat'
      };
      const result = scorePairedAssociates(pairs, responses);
      expect(result.correctCount).toBe(2);
      expect(result.accuracy).toBe(100);
    });
  });

  // 7. Pattern Recall
  describe('scorePatternRecall', () => {
    it('evaluates grid fidelity', () => {
      const target = [true, false, true, false];
      const user = [true, false, false, false];
      const result = scorePatternRecall(target, user);
      expect(result.isExact).toBe(false);
      expect(result.matchedCells).toBe(3);
      expect(result.accuracy).toBe(75);
    });
  });

  // 8. Running Memory
  describe('scoreRunningMemory', () => {
    it('evaluates only the last N items of the stream in order', () => {
      const stream = [4, 9, 1, 7, 2, 8, 3];
      const windowN = 3; // last 3 are [2, 8, 3]
      const user = [2, 8, 3];
      const result = scoreRunningMemory(stream, windowN, user);
      expect(result.isExact).toBe(true);
      expect(result.accuracy).toBe(100);
      expect(result.correctMatches).toBe(3);
    });
  });

  // 9. Delayed Recall
  describe('scoreDelayedRecall', () => {
    it('combines delayed word retrieval and distractor accuracy', () => {
      const targets = ['Alpha', 'Beta', 'Gamma', 'Delta'];
      const recalled = ['Alpha', 'Beta'];
      const distractorAcc = 90;
      const result = scoreDelayedRecall(targets, recalled, distractorAcc, 20);
      expect(result.recalledCount).toBe(2);
      expect(result.recallAccuracy).toBe(50);
      expect(result.compositeScore).toBe(Math.round(50 * 0.8 + 90 * 0.2));
    });
  });

  // 10. Attention Detection
  describe('scoreAttentionDetection', () => {
    it('computes vigilance performance metrics and reaction time', () => {
      const trials = [
        { isTarget: true, userResponded: true, reactionTimeMs: 320 },
        { isTarget: false, userResponded: false },
        { isTarget: true, userResponded: false }, // miss
        { isTarget: false, userResponded: true } // false alarm
      ];
      const result = scoreAttentionDetection(trials);
      expect(result.hits).toBe(1);
      expect(result.misses).toBe(1);
      expect(result.falseAlarms).toBe(1);
      expect(result.correctRejections).toBe(1);
      expect(result.accuracy).toBe(50);
      expect(result.averageReactionTimeMs).toBe(320);
    });
  });
});
