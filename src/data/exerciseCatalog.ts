import { ExerciseDefinition } from '../types/exercise';

export const EXERCISE_CATALOG: ExerciseDefinition[] = [
  {
    id: 'digit-span',
    name: 'Digit Span',
    category: 'digit',
    categoryLabel: 'Digit Memory',
    description: 'Practice immediate serial recall of numerical sequences in forward or reverse order.',
    cognitiveSkill: 'Phonological Loop & Serial Order Memory',
    estimatedDuration: '2 - 3 min',
    difficultyLevels: ['beginner', 'intermediate', 'advanced', 'adaptive'],
    instructions: [
      'A sequence of digits will appear on the screen one by one.',
      'Maintain the digits in your short-term memory.',
      'When prompted, enter the sequence in exact order (Forward or Reverse mode).',
      'The sequence expands in length as your recall accuracy solidifies.'
    ],
    tips: [
      'Chunk digits into pairs or triplets (e.g. 5-8-2 as 582).',
      'Subvocalize or use rhythmic cadence to sustain memory traces.'
    ],
    scoringDescription: 'Evaluates exact sequence matching, matched digit count, and response time.'
  },
  {
    id: 'sequence-memory',
    name: 'Sequence Memory',
    category: 'sequence',
    categoryLabel: 'Sequence Memory',
    description: 'Memorize and reproduce progressively longer sequences of visual tile activations.',
    cognitiveSkill: 'Visuospatial Working Memory & Sequential Ordering',
    estimatedDuration: '2 - 4 min',
    difficultyLevels: ['beginner', 'intermediate', 'advanced', 'adaptive'],
    instructions: [
      'Watch the grid as tiles illuminate in a specific order.',
      'Wait until the presentation phase completes.',
      'Click or tap the tiles in the exact sequential order they appeared.',
      'Each completed sequence adds an additional step to the pattern.'
    ],
    tips: [
      'Trace spatial paths or geometric angles between successive tiles.',
      'Assign numbers or directional cues (top-left, center, bottom-right).'
    ],
    scoringDescription: 'Based on the maximum span length achieved without interruption.'
  },
  {
    id: 'n-back',
    name: 'N-Back Working Memory',
    category: 'working-memory',
    categoryLabel: 'Working Memory',
    description: 'Continuously monitor a stream of visual symbols and signal whenever the current symbol matches the item from N steps ago.',
    cognitiveSkill: 'Executive Updating & Working Memory Capacity',
    estimatedDuration: '3 - 5 min',
    difficultyLevels: ['beginner', 'intermediate', 'advanced'],
    instructions: [
      'Symbols will flash rapidly in the center display.',
      'In 1-Back: respond if the symbol matches the immediate previous symbol.',
      'In 2-Back: respond if the symbol matches the one shown 2 steps earlier.',
      'In 3-Back: respond if the symbol matches the one shown 3 steps earlier.',
      'Use the Match button or Spacebar to confirm matches.'
    ],
    tips: [
      'Maintain a mental sliding buffer of the most recent N items.',
      'Constantly discard the oldest item while absorbing the newest.'
    ],
    scoringDescription: 'Calculates signal detection metrics: hits, misses, false alarms, and d-prime sensitivity.'
  },
  {
    id: 'visual-matrix',
    name: 'Visual Matrix Recall',
    category: 'spatial',
    categoryLabel: 'Spatial Memory',
    description: 'Retain the exact spatial positions of highlighted cells in a transient grid.',
    cognitiveSkill: 'Visuospatial Sketchpad & Spatial Matrix Representation',
    estimatedDuration: '2 - 3 min',
    difficultyLevels: ['beginner', 'intermediate', 'advanced', 'adaptive'],
    instructions: [
      'A grid will appear with a cluster of illuminated squares.',
      'Observe the pattern carefully before it fades.',
      'Click all the squares that were previously illuminated.',
      'Submit your recall once you have selected your coordinates.'
    ],
    tips: [
      'Notice geometric symmetries, clusters, and empty perimeter lines.',
      'Envision the highlighted squares as connected constellations.'
    ],
    scoringDescription: 'Reports precision, recall, and exact match percentage across trials.'
  },
  {
    id: 'word-recall',
    name: 'Word List Recall',
    category: 'verbal',
    categoryLabel: 'Verbal Memory',
    description: 'Study a randomized list of vocabulary items and practice free recall of as many words as possible.',
    cognitiveSkill: 'Verbal Short-Term Memory & Free Recall Search',
    estimatedDuration: '3 - 4 min',
    difficultyLevels: ['beginner', 'intermediate', 'advanced'],
    instructions: [
      'A set of words will be displayed during the study window.',
      'When the timer expires, the word list is concealed.',
      'Type all the words you can remember in any order.',
      'Case and whitespace are automatically normalized.'
    ],
    tips: [
      'Form an interactive mental story linking consecutive words.',
      'Group words by visual categories or physical environments.'
    ],
    scoringDescription: 'Measures correctly recalled targets, omissions, and intrusion errors.'
  },
  {
    id: 'paired-associates',
    name: 'Paired Associates',
    category: 'verbal',
    categoryLabel: 'Associative Memory',
    description: 'Learn arbitrary pairs of items and practice retrieving the associated target when presented with the cue.',
    cognitiveSkill: 'Relational Encoding & Cued Recall Retrieval',
    estimatedDuration: '3 - 4 min',
    difficultyLevels: ['beginner', 'intermediate', 'advanced'],
    instructions: [
      'Study pairs such as "River → Horizon" or "Castle → 48".',
      'After the learning phase, single cues will appear.',
      'Recall and enter the corresponding associated target.',
      'Review your accuracy and reinforce missed associations.'
    ],
    tips: [
      'Visualize vivid interaction between the two concepts.',
      'Create an explanatory sentence that binds the pair together.'
    ],
    scoringDescription: 'Calculates overall accuracy, cued retrieval rate, and response latencies.'
  },
  {
    id: 'pattern-recall',
    name: 'Pattern Recall',
    category: 'visual',
    categoryLabel: 'Visual Memory',
    description: 'Observe complex structural patterns on a dual-toned grid and reconstruct them with precision.',
    cognitiveSkill: 'Visual Detail Retention & Pattern Reconstruction',
    estimatedDuration: '2 - 3 min',
    difficultyLevels: ['beginner', 'intermediate', 'advanced', 'adaptive'],
    instructions: [
      'A visual pattern will be showcased for a designated study period.',
      'The grid will then be reset to blank.',
      'Toggle the grid cells to reconstruct the original visual pattern.',
      'Check your accuracy against the baseline template.'
    ],
    tips: [
      'Deconstruct the pattern into quadrants or row segments.',
      'Count filled squares per column to verify balance.'
    ],
    scoringDescription: 'Evaluates cell-by-cell structural fidelity and exact pattern matches.'
  },
  {
    id: 'running-memory',
    name: 'Running Memory',
    category: 'working-memory',
    categoryLabel: 'Working Memory',
    description: 'Process an ongoing stream of digits of unpredictable length and recall only the last N items.',
    cognitiveSkill: 'Continuous Working Memory Updating & Temporal Decay Resistance',
    estimatedDuration: '2 - 3 min',
    difficultyLevels: ['beginner', 'intermediate', 'advanced'],
    instructions: [
      'Items will flash sequentially one after another in a stream.',
      'The stream may end at any unexpected moment.',
      'Your task is to enter only the last N items (e.g. the final 4 items in order).',
      'Discard older items continuously as new elements arrive.'
    ],
    tips: [
      'Update a fixed mental list in real-time as each item flashes.',
      'Mentally drop the first digit whenever a new one arrives.'
    ],
    scoringDescription: 'Evaluates accuracy of identifying and ordering the final target window.'
  },
  {
    id: 'delayed-recall',
    name: 'Delayed Recall',
    category: 'verbal',
    categoryLabel: 'Retention & Delay',
    description: 'Memorize information, resolve a rapid cognitive distractor interference task, and then test delayed retrieval.',
    cognitiveSkill: 'Interference Resistance & Delayed Retrieval',
    estimatedDuration: '3 - 5 min',
    difficultyLevels: ['beginner', 'intermediate', 'advanced'],
    instructions: [
      'Phase 1: Study a list of target words.',
      'Phase 2: Solve rapid arithmetic distractor calculations to prevent rehearsal.',
      'Phase 3: Retrieve and enter the initial target words from memory.',
      'Compare your immediate baseline against delayed retention.'
    ],
    tips: [
      'Deeply encode semantic meaning initially to resist the distractor task.',
      'Do not dwell on the words during the math phase; focus on the math.'
    ],
    scoringDescription: 'Scores delayed recall percentage, distractor performance, and decay rate.'
  },
  {
    id: 'attention-target',
    name: 'Attention & Target Detection',
    category: 'attention',
    categoryLabel: 'Attention & Vigilance',
    description: 'Maintain sustained vigilance across a rapid visual stream and respond instantly to target criteria.',
    cognitiveSkill: 'Sustained Attention, Vigilance & Inhibitory Control',
    estimatedDuration: '2 - 3 min',
    difficultyLevels: ['beginner', 'intermediate', 'advanced'],
    instructions: [
      'A fast visual stream will present letters or symbols.',
      'A target rule is specified (e.g., respond when letter "X" appears, or when "B" directly follows "A").',
      'Press Spacebar or the Target Detected button quickly when you see the target.',
      'Withhold responses on non-target stimuli.'
    ],
    tips: [
      'Keep your finger rested and ready on the spacebar or trigger.',
      'Breathe steadily and maintain rhythmic visual focus on the center crosshair.'
    ],
    scoringDescription: 'Measures vigilance hits, false alarms, misses, and millisecond reaction times.'
  }
];

import { getLevelChallengeById } from './exerciseLevels';

export function getExerciseById(id: string): ExerciseDefinition | undefined {
  const directMatch = EXERCISE_CATALOG.find(ex => ex.id === id);
  if (directMatch) return directMatch;

  const levelChallenge = getLevelChallengeById(id);
  if (levelChallenge) {
    const base = EXERCISE_CATALOG.find(ex => ex.id === levelChallenge.exerciseId) || EXERCISE_CATALOG[0];
    return {
      ...base,
      id: levelChallenge.id,
      name: levelChallenge.title,
      category: levelChallenge.category,
      categoryLabel: levelChallenge.categoryLabel,
      description: `${base.description} (Challenge Level ${levelChallenge.levelNumber} - ${levelChallenge.tier}: ${levelChallenge.specs}). ${levelChallenge.targetMetric}.`,
      difficultyLevels: [levelChallenge.difficulty],
      instructions: [
        `Level #${levelChallenge.levelNumber} Challenge Configuration: ${levelChallenge.specs}.`,
        ...base.instructions
      ]
    };
  }

  return undefined;
}
