export type CognitiveCategory = 
  | 'verbal'
  | 'digit'
  | 'sequence'
  | 'visual'
  | 'spatial'
  | 'working-memory'
  | 'attention';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'adaptive';

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: CognitiveCategory;
  categoryLabel: string;
  description: string;
  cognitiveSkill: string;
  estimatedDuration: string;
  difficultyLevels: DifficultyLevel[];
  instructions: string[];
  tips: string[];
  scoringDescription: string;
}

export interface LevelChallenge {
  id: string;
  levelNumber: number;
  exerciseId: string;
  title: string;
  category: CognitiveCategory;
  categoryLabel: string;
  tier: 'Foundation' | 'Intermediate' | 'Advanced' | 'Master' | 'Grandmaster';
  difficulty: DifficultyLevel;
  specs: string;
  targetMetric: string;
  parameters: Record<string, any>;
}

export interface TrialResult {
  trialNumber: number;
  stimulus: any;
  userResponse: any;
  correctResponse: any;
  isCorrect: boolean;
  reactionTimeMs?: number;
  details?: Record<string, any>;
}

export interface SessionResult {
  id: string;
  exerciseId: string;
  exerciseName: string;
  category: CognitiveCategory;
  timestamp: number; // Date.now()
  dateString: string; // YYYY-MM-DD
  difficulty: DifficultyLevel;
  durationSeconds: number;
  rawScore: number;
  maxPossibleScore?: number;
  accuracy: number; // 0 - 100 percentage
  correctCount: number;
  incorrectCount: number;
  totalTrials: number;
  averageReactionTimeMs?: number;
  exerciseMetrics: Record<string, number | string | boolean>;
  trials: TrialResult[];
}

export interface ExerciseStats {
  exerciseId: string;
  totalSessions: number;
  bestScore: number;
  bestAccuracy: number;
  averageAccuracy: number;
  lastPlayedTimestamp: number;
  lastDifficulty: DifficultyLevel;
}
