import { CognitiveCategory, DifficultyLevel, LevelChallenge } from '../types/exercise';

// Helper to determine tier from level number
function getTier(lvl: number): 'Foundation' | 'Intermediate' | 'Advanced' | 'Master' | 'Grandmaster' {
  if (lvl <= 25) return 'Foundation';
  if (lvl <= 50) return 'Intermediate';
  if (lvl <= 75) return 'Advanced';
  if (lvl <= 95) return 'Master';
  return 'Grandmaster';
}

function getDifficulty(lvl: number): DifficultyLevel {
  if (lvl <= 25) return 'beginner';
  if (lvl <= 60) return 'intermediate';
  return 'advanced';
}

/**
 * Generate 105 calibrated levels for each of the 7 cognitive categories.
 * Total: 735 playable level exercises!
 */
export function generateCategoryLevels(category: CognitiveCategory): LevelChallenge[] {
  const levels: LevelChallenge[] = [];

  for (let i = 1; i <= 105; i++) {
    const tier = getTier(i);
    const difficulty = getDifficulty(i);
    let title = '';
    let exerciseId = '';
    let categoryLabel = '';
    let specs = '';
    let targetMetric = '';
    let parameters: Record<string, any> = {};

    switch (category) {
      case 'digit': {
        exerciseId = 'digit-span';
        categoryLabel = 'Digit Memory';
        const isReverse = i > 25 && i % 2 === 0;
        const span = Math.min(14, 3 + Math.floor(i / 10));
        const speedMs = Math.max(450, 1100 - i * 6);
        title = `Digit Span Drill #${i}: ${isReverse ? 'Reverse' : 'Forward'} ${span}-Digit`;
        specs = `${span} Digits • ${isReverse ? 'Reverse Mode' : 'Forward'} • ${speedMs}ms interval`;
        targetMetric = `Target Accuracy: ${Math.min(98, 70 + Math.floor(i / 4))}%`;
        parameters = { span, isReverse, speedMs, level: i };
        break;
      }

      case 'sequence': {
        exerciseId = 'sequence-memory';
        categoryLabel = 'Sequence Memory';
        const seqLength = Math.min(18, 3 + Math.floor(i / 8));
        const flashSpeed = Math.max(300, 600 - i * 3);
        title = `Sequence Flow #${i}: Trajectory Length ${seqLength}`;
        specs = `Target Length: ${seqLength} Tiles • Flash Speed: ${flashSpeed}ms • 3x3 Grid`;
        targetMetric = `Pass Criteria: Complete ${seqLength} steps without interruption`;
        parameters = { targetLength: seqLength, flashSpeed, level: i };
        break;
      }

      case 'working-memory': {
        const isRunning = i % 2 === 0 && i > 30;
        exerciseId = isRunning ? 'running-memory' : 'n-back';
        categoryLabel = 'Working Memory';
        const nValue = i <= 25 ? 1 : i <= 70 ? 2 : 3;
        const streamSpeed = Math.max(900, 2200 - i * 12);
        if (isRunning) {
          title = `Running Memory Stream #${i}: Last ${Math.min(7, 3 + Math.floor(i / 20))} Items`;
          specs = `Recall Last ${Math.min(7, 3 + Math.floor(i / 20))} • Dynamic Stream Length`;
          targetMetric = `Target Buffer Recall: ${Math.min(95, 75 + Math.floor(i / 5))}%`;
        } else {
          title = `N-Back Challenge #${i}: ${nValue}-Back Visual Load`;
          specs = `${nValue}-Back Mode • Symbol Speed: ${streamSpeed}ms • Continuous Updating`;
          targetMetric = `Sensitivity d' > ${(1.5 + (i / 50)).toFixed(1)}`;
        }
        parameters = { nValue, streamSpeed, isRunning, level: i };
        break;
      }

      case 'spatial': {
        exerciseId = 'visual-matrix';
        categoryLabel = 'Spatial Memory';
        const gridSize = i <= 25 ? 3 : i <= 60 ? 4 : i <= 85 ? 5 : 6;
        const highlightedCount = Math.min(gridSize * gridSize - 2, 2 + Math.floor(i / 7));
        const displayTimeMs = Math.max(800, 2200 - i * 13);
        title = `Spatial Matrix #${i}: ${gridSize}x${gridSize} Coordinate Recall`;
        specs = `${gridSize}x${gridSize} Grid • ${highlightedCount} Highlighted Coordinates • ${displayTimeMs}ms`;
        targetMetric = `Precision & Recall: ≥${Math.min(95, 70 + Math.floor(i / 4))}%`;
        parameters = { gridSize, highlightedCount, displayTimeMs, level: i };
        break;
      }

      case 'visual': {
        exerciseId = 'pattern-recall';
        categoryLabel = 'Visual Memory';
        const gridSize = i <= 30 ? 3 : i <= 70 ? 4 : 5;
        const fillDensity = Math.min(gridSize * gridSize - 1, 3 + Math.floor(i / 8));
        const viewDurationMs = Math.max(900, 2500 - i * 14);
        title = `Pattern Reconstruction #${i}: ${gridSize}x${gridSize} Structure`;
        specs = `${gridSize}x${gridSize} Grid • ${fillDensity} Pattern Cells • ${viewDurationMs}ms Encoding`;
        targetMetric = `Exact Pattern Fidelity: ≥${Math.min(98, 75 + Math.floor(i / 5))}%`;
        parameters = { gridSize, fillDensity, viewDurationMs, level: i };
        break;
      }

      case 'verbal': {
        const isDelayed = i % 3 === 0;
        const isPaired = i % 3 === 1;
        exerciseId = isDelayed ? 'delayed-recall' : isPaired ? 'paired-associates' : 'word-recall';
        categoryLabel = 'Verbal Memory';
        const wordCount = Math.min(16, 4 + Math.floor(i / 8));
        const studySec = Math.max(8, 16 - Math.floor(i / 15));
        if (isDelayed) {
          title = `Delayed Recall Drill #${i}: ${wordCount} Words + Interference`;
          specs = `${wordCount} Target Items • Math Distractor Phase • Retention Retest`;
        } else if (isPaired) {
          title = `Paired Association #${i}: ${Math.min(10, 3 + Math.floor(i / 12))} Concept Pairs`;
          specs = `${Math.min(10, 3 + Math.floor(i / 12))} Arbitrary Word Pairs • Cued Recall`;
        } else {
          title = `Verbal List Recall #${i}: ${wordCount} Word Horizon`;
          specs = `${wordCount} Concrete Nouns • ${studySec}s Study Window • Free Recall`;
        }
        targetMetric = `Target Retrieval: ≥${Math.min(95, 70 + Math.floor(i / 5))}%`;
        parameters = { wordCount, studySec, level: i };
        break;
      }

      case 'attention': {
        exerciseId = 'attention-target';
        categoryLabel = 'Attention & Vigilance';
        const streamIntervalMs = Math.max(350, 950 - i * 6);
        const totalItems = Math.min(45, 15 + Math.floor(i / 3));
        const targetRate = Math.max(0.12, 0.35 - (i / 400));
        title = `Vigilance Stream #${i}: ${streamIntervalMs}ms Rapid Exposure`;
        specs = `${totalItems} Stimuli Stream • ${streamIntervalMs}ms ISI • ${(targetRate * 100).toFixed(0)}% Target Frequency`;
        targetMetric = `Target Hits ≥ 90% • Reaction Time < ${Math.max(320, 650 - i * 3)}ms`;
        parameters = { streamIntervalMs, totalItems, targetRate, level: i };
        break;
      }
    }

    levels.push({
      id: `${category}-lvl-${i}`,
      levelNumber: i,
      exerciseId,
      title,
      category,
      categoryLabel,
      tier,
      difficulty,
      specs,
      targetMetric,
      parameters
    });
  }

  return levels;
}

// Generate the complete master database of 735 levels (105 per category)
export const MASTER_LEVELS: Record<CognitiveCategory, LevelChallenge[]> = {
  'digit': generateCategoryLevels('digit'),
  'sequence': generateCategoryLevels('sequence'),
  'working-memory': generateCategoryLevels('working-memory'),
  'spatial': generateCategoryLevels('spatial'),
  'visual': generateCategoryLevels('visual'),
  'verbal': generateCategoryLevels('verbal'),
  'attention': generateCategoryLevels('attention'),
};

// Flattened list of all 735 levels
export const ALL_LEVEL_CHALLENGES: LevelChallenge[] = [
  ...MASTER_LEVELS['digit'],
  ...MASTER_LEVELS['sequence'],
  ...MASTER_LEVELS['working-memory'],
  ...MASTER_LEVELS['spatial'],
  ...MASTER_LEVELS['visual'],
  ...MASTER_LEVELS['verbal'],
  ...MASTER_LEVELS['attention'],
];

export function getLevelChallengeById(id: string): LevelChallenge | undefined {
  return ALL_LEVEL_CHALLENGES.find(lvl => lvl.id === id);
}
