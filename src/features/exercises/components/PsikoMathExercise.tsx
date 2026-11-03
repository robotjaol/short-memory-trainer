import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DifficultyLevel, TrialResult } from '../../../types/exercise';
import { 
  generateAssessmentQuestions, 
  ShuffledPsikoQuestion, 
  PsikoMathTier,
  VisualMatrixData,
  ChartPayload,
  TablePayload
} from '../../../data/psikoMathData';
import { soundManager } from '../../../lib/sound';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  RotateCcw, 
  HelpCircle,
  AlertTriangle,
  Award,
  Layers,
  Filter,
  Check,
  ChevronDown,
  Info
} from 'lucide-react';

interface PsikoMathExerciseProps {
  difficulty: DifficultyLevel;
  soundEnabled: boolean;
  soundVolume: number;
  onFinish: (result: {
    rawScore: number;
    maxPossibleScore?: number;
    accuracy: number;
    correctCount: number;
    incorrectCount: number;
    totalTrials: number;
    durationSeconds: number;
    averageReactionTimeMs?: number;
    exerciseMetrics: Record<string, number | string | boolean>;
    trials: TrialResult[];
  }) => void;
}

// Visual Matrix Renderer (SVG)
const VisualMatrixRenderer: React.FC<{ matrix: VisualMatrixData }> = ({ matrix }) => {
  return (
    <div className="flex flex-col items-center my-4">
      {matrix.ruleHint && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2 font-mono italic">
          Pattern Rule: {matrix.ruleHint}
        </p>
      )}
      <div 
        className="grid gap-2 p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl"
        style={{ gridTemplateColumns: `repeat(${matrix.cols}, minmax(0, 1fr))` }}
      >
        {matrix.cells.flatMap((row, rIdx) => 
          row.map((cell, cIdx) => (
            <div 
              key={`r${rIdx}-c${cIdx}`}
              className={`w-20 h-20 sm:w-24 sm:h-24 flex flex-col items-center justify-center rounded-lg border relative transition-all ${
                cell.isQuestionMark
                  ? 'border-dashed border-neutral-400 dark:border-neutral-600 bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse'
                  : 'border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black shadow-xs'
              }`}
            >
              {cell.isQuestionMark ? (
                <span className="text-2xl font-bold font-mono">?</span>
              ) : (
                <svg viewBox="0 0 100 100" className="w-12 h-12">
                  {cell.shapes.map((shape, sIdx) => {
                    const rot = shape.rotation || 0;
                    const fill = shape.fill ? 'currentColor' : 'none';
                    const stroke = 'currentColor';
                    const strokeWidth = shape.fill ? '0' : '4';

                    if (shape.type === 'circle') {
                      return (
                        <circle 
                          key={sIdx} 
                          cx="50" 
                          cy="50" 
                          r="30" 
                          fill={fill} 
                          stroke={stroke} 
                          strokeWidth={strokeWidth} 
                          className="text-neutral-800 dark:text-neutral-200"
                        />
                      );
                    }
                    if (shape.type === 'square') {
                      return (
                        <rect 
                          key={sIdx} 
                          x="25" 
                          y="25" 
                          width="50" 
                          height="50" 
                          fill={fill} 
                          stroke={stroke} 
                          strokeWidth={strokeWidth} 
                          transform={`rotate(${rot} 50 50)`} 
                          className="text-neutral-800 dark:text-neutral-200"
                        />
                      );
                    }
                    if (shape.type === 'triangle') {
                      return (
                        <polygon 
                          key={sIdx} 
                          points="50,20 80,75 20,75" 
                          fill={fill} 
                          stroke={stroke} 
                          strokeWidth={strokeWidth} 
                          transform={`rotate(${rot} 50 50)`} 
                          className="text-neutral-800 dark:text-neutral-200"
                        />
                      );
                    }
                    if (shape.type === 'diamond') {
                      return (
                        <polygon 
                          key={sIdx} 
                          points="50,15 85,50 50,85 15,50" 
                          fill={fill} 
                          stroke={stroke} 
                          strokeWidth={strokeWidth} 
                          transform={`rotate(${rot} 50 50)`} 
                          className="text-neutral-800 dark:text-neutral-200"
                        />
                      );
                    }
                    if (shape.type === 'cross') {
                      return (
                        <g key={sIdx} transform={`rotate(${rot} 50 50)`} stroke="currentColor" strokeWidth="6" strokeLinecap="round">
                          <line x1="20" y1="50" x2="80" y2="50" className="text-neutral-800 dark:text-neutral-200" />
                          <line x1="50" y1="20" x2="50" y2="80" className="text-neutral-800 dark:text-neutral-200" />
                        </g>
                      );
                    }
                    if (shape.type === 'line') {
                      return (
                        <line 
                          key={sIdx} 
                          x1="15" 
                          y1="50" 
                          x2="85" 
                          y2="50" 
                          stroke="currentColor" 
                          strokeWidth="6" 
                          strokeLinecap="round"
                          transform={`rotate(${rot} 50 50)`} 
                          className="text-neutral-800 dark:text-neutral-200"
                        />
                      );
                    }
                    if (shape.type === 'dot') {
                      const count = shape.count || 1;
                      const dotCoords = count === 1 ? [[50, 50]] : count === 2 ? [[40, 50], [60, 50]] : [[35, 50], [50, 50], [65, 50]];
                      return (
                        <g key={sIdx}>
                          {dotCoords.map(([dx, dy], dIdx) => (
                            <circle key={dIdx} cx={dx} cy={dy} r="5" fill="currentColor" className="text-neutral-900 dark:text-white" />
                          ))}
                        </g>
                      );
                    }
                    return null;
                  })}
                </svg>
              )}
              {cell.label && (
                <span className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate max-w-full px-1">
                  {cell.label}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Data Chart Renderer
const DataChartRenderer: React.FC<{ chart: ChartPayload }> = ({ chart }) => {
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="w-full my-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
      <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 text-center mb-3">
        {chart.title}
      </h4>
      <div className="w-full h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === 'bar' ? (
            <BarChart data={chart.data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey={chart.xAxisKey || 'label'} stroke="#888" fontSize={11} tickLine={false} />
              <YAxis stroke="#888" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#171717', 
                  borderColor: '#404040', 
                  borderRadius: '8px', 
                  fontSize: '12px',
                  color: '#fff' 
                }} 
              />
              {chart.dataKeys.map((dk) => (
                <Bar key={dk.key} dataKey={dk.key} name={dk.name} fill={dk.color} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          ) : chart.type === 'line' ? (
            <LineChart data={chart.data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey={chart.xAxisKey || 'label'} stroke="#888" fontSize={11} tickLine={false} />
              <YAxis stroke="#888" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#171717', 
                  borderColor: '#404040', 
                  borderRadius: '8px', 
                  fontSize: '12px',
                  color: '#fff' 
                }} 
              />
              {chart.dataKeys.map((dk) => (
                <Line 
                  key={dk.key} 
                  type="monotone" 
                  dataKey={dk.key} 
                  name={dk.name} 
                  stroke={dk.color} 
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: dk.color }}
                  activeDot={{ r: 6 }} 
                />
              ))}
            </LineChart>
          ) : (
            <PieChart>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#171717', 
                  borderColor: '#404040', 
                  borderRadius: '8px', 
                  fontSize: '12px',
                  color: '#fff' 
                }} 
              />
              <Pie
                data={chart.data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={38}
                paddingAngle={3}
                label={(entry: any) => `${entry.label || entry.name}: ${entry.value}%`}
                labelLine={false}
              >
                {chart.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Data Table Renderer
const DataTableRenderer: React.FC<{ table: TablePayload }> = ({ table }) => {
  return (
    <div className="w-full my-4 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-xs sm:text-sm text-left">
        <thead className="bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
          <tr>
            {table.headers.map((h, idx) => (
              <th key={idx} className="px-3 py-2.5 font-semibold text-neutral-700 dark:text-neutral-300">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-950">
          {table.rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
              {row.map((val, cIdx) => (
                <td key={cIdx} className="px-3 py-2 font-mono text-neutral-800 dark:text-neutral-200">
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Sequence Strip Renderer
const SequenceStripRenderer: React.FC<{ sequence: (string | number)[] }> = ({ sequence }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 my-4 p-4 rounded-xl bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
      {sequence.map((item, idx) => {
        const isUnknown = item === '?' || item === 'X';
        return (
          <div 
            key={idx}
            className={`min-w-12 h-12 sm:min-w-14 sm:h-14 px-3 flex items-center justify-center rounded-lg font-mono text-base sm:text-lg font-bold border transition-all ${
              isUnknown
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-600 dark:text-amber-400 animate-pulse'
                : 'bg-white dark:bg-black border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
            }`}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
};

export const PsikoMathExercise: React.FC<PsikoMathExerciseProps> = ({
  difficulty,
  soundEnabled,
  soundVolume,
  onFinish
}) => {
  // Target tier based on difficulty
  const targetTier: PsikoMathTier | undefined = useMemo(() => {
    if (difficulty === 'beginner') return 'Foundation';
    if (difficulty === 'intermediate') return 'Intermediate';
    if (difficulty === 'advanced') return 'Advanced';
    return undefined; // adaptive: all tiers
  }, [difficulty]);

  // Question count
  const questionCount = difficulty === 'beginner' ? 12 : difficulty === 'intermediate' ? 16 : 20;

  // Questions state
  const [questions, setQuestions] = useState<ShuffledPsikoQuestion[]>(() => 
    generateAssessmentQuestions(questionCount, targetTier)
  );

  // Active question index
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // User answers map: questionId -> selectedOptionIndex (0-3)
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Marked for review set
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});

  // Reaction times map
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<string, number>>({});
  const [reactionTimes, setReactionTimes] = useState<Record<string, number>>({});

  // Timer: 20 minutes (1200 seconds) or 60s per question
  const initialSeconds = questionCount * 75; // 75 seconds per psychometric math item
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);
  const [assessmentStartedTimestamp] = useState<number>(Date.now());

  // Assessment status
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect' | 'marked'>('all');

  // Track start time of current question
  useEffect(() => {
    const qId = questions[currentIndex]?.id;
    if (qId && !questionStartTimes[qId]) {
      setQuestionStartTimes(prev => ({ ...prev, [qId]: Date.now() }));
    }
  }, [currentIndex, questions, questionStartTimes]);

  // Countdown timer
  useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit on time expiry
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  // Handle Option Select
  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    if (soundEnabled) {
      soundManager.playTone(520, 0.08, 'sine', soundVolume);
    }

    // Record response
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionIndex
    }));

    // Record reaction time
    const startTime = questionStartTimes[currentQ.id] || Date.now();
    const elapsed = Date.now() - startTime;
    setReactionTimes(prev => ({
      ...prev,
      [currentQ.id]: elapsed
    }));
  };

  // Toggle Mark for Review
  const toggleMarkForReview = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setMarkedForReview(prev => {
      const updated = !prev[currentQ.id];
      if (soundEnabled) {
        soundManager.playTone(updated ? 650 : 380, 0.08, 'sine', soundVolume);
      }
      return { ...prev, [currentQ.id]: updated };
    });
  };

  // Keyboard navigation & answer selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitted || showConfirmModal) return;

      const key = e.key.toUpperCase();
      if (key === 'A' || key === '1') {
        e.preventDefault();
        handleSelectOption(0);
      } else if (key === 'B' || key === '2') {
        e.preventDefault();
        handleSelectOption(1);
      } else if (key === 'C' || key === '3') {
        e.preventDefault();
        handleSelectOption(2);
      } else if (key === 'D' || key === '4') {
        e.preventDefault();
        handleSelectOption(3);
      } else if (key === 'M') {
        e.preventDefault();
        toggleMarkForReview();
      } else if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        e.preventDefault();
        setCurrentIndex(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex(currentIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isSubmitted, showConfirmModal, questions.length]);

  // Submission handler
  const handleSubmitAssessment = () => {
    setShowConfirmModal(false);
    setIsSubmitted(true);
    if (soundEnabled) {
      soundManager.playComplete(soundVolume);
    }
  };

  // Finish session and commit to dashboard
  const handleFinalizeSession = () => {
    const totalTrials = questions.length;
    let correctCount = 0;
    const trials: TrialResult[] = [];

    questions.forEach((q, idx) => {
      const selectedIndex = answers[q.id];
      const isCorrect = selectedIndex === q.correctIndex;
      if (isCorrect) correctCount++;

      trials.push({
        trialNumber: idx + 1,
        stimulus: q.problemStatement,
        userResponse: selectedIndex !== undefined ? q.options[selectedIndex] : 'Unanswered',
        correctResponse: q.options[q.correctIndex],
        isCorrect,
        reactionTimeMs: reactionTimes[q.id] || 0,
        details: {
          category: q.category,
          tier: q.tier,
          formulaNote: q.formulaNote
        }
      });
    });

    const accuracy = totalTrials > 0 ? Math.round((correctCount / totalTrials) * 100) : 0;
    const rawScore = correctCount * 100;
    const totalDurationSeconds = Math.round((Date.now() - assessmentStartedTimestamp) / 1000);
    const avgReactionTime = trials.length > 0 
      ? Math.round(trials.reduce((sum, t) => sum + (t.reactionTimeMs || 0), 0) / trials.length) 
      : 0;

    onFinish({
      rawScore,
      maxPossibleScore: totalTrials * 100,
      accuracy,
      correctCount,
      incorrectCount: totalTrials - correctCount,
      totalTrials,
      durationSeconds: totalDurationSeconds,
      averageReactionTimeMs: avgReactionTime,
      exerciseMetrics: {
        totalQuestions: totalTrials,
        answeredCount: Object.keys(answers).length,
        correctCount,
        durationSeconds: totalDurationSeconds,
        markedCount: Object.values(markedForReview).filter(Boolean).length
      },
      trials
    });
  };

  // Current question data
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  // Format timer MM:SS
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Detailed scores calculation
  const calculatedResults = useMemo(() => {
    if (!isSubmitted) return null;
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    const acc = Math.round((correct / questions.length) * 100);
    return {
      correct,
      total: questions.length,
      accuracy: acc,
      score: correct * 100
    };
  }, [isSubmitted, questions, answers]);

  // Filtered review list
  const filteredQuestions = useMemo(() => {
    if (!isSubmitted) return [];
    return questions.filter(q => {
      const isCorrect = answers[q.id] === q.correctIndex;
      const isMarked = !!markedForReview[q.id];
      if (reviewFilter === 'correct') return isCorrect;
      if (reviewFilter === 'incorrect') return !isCorrect;
      if (reviewFilter === 'marked') return isMarked;
      return true;
    });
  }, [isSubmitted, questions, answers, markedForReview, reviewFilter]);

  // ==========================================
  // REVIEW / RESULTS SCREEN (When Submitted)
  // ==========================================
  if (isSubmitted && calculatedResults) {
    return (
      <div className="w-full max-w-4xl mx-auto py-6 px-4 animate-fadeIn">
        {/* Header Results Banner */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 sm:p-8 shadow-sm mb-6 text-center">
          <div className="inline-flex p-3 rounded-full bg-neutral-100 dark:bg-neutral-900 mb-3">
            <Award className="w-8 h-8 text-neutral-900 dark:text-neutral-100" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Psiko Math Assessment Complete
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-md mx-auto">
            {calculatedResults.accuracy >= 85
              ? 'Exceptional numerical reasoning and analytical deduction performance.'
              : calculatedResults.accuracy >= 65
              ? 'Solid logical capability with strong fundamental pattern recognition.'
              : 'Keep practicing to reinforce step-by-step mathematical reasoning and visual data interpretation.'}
          </p>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-left">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
              <span className="text-xs text-neutral-500 font-mono">ACCURACY</span>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1">
                {calculatedResults.accuracy}%
              </div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
              <span className="text-xs text-neutral-500 font-mono">CORRECT ANSWERS</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {calculatedResults.correct} / {calculatedResults.total}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
              <span className="text-xs text-neutral-500 font-mono">TOTAL SCORE</span>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1">
                {calculatedResults.score} pts
              </div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
              <span className="text-xs text-neutral-500 font-mono">TIME SPENT</span>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1">
                {formatTimer(initialSeconds - secondsRemaining)}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleFinalizeSession}
              className="px-6 py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save & Return to Dashboard
            </button>
          </div>
        </div>

        {/* Detailed Solutions Review Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Detailed Solutions Breakdown
              </h3>
              <p className="text-xs text-neutral-500">
                Review each problem statement, exact answer choices, and full step-by-step mathematical logic.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex p-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-medium">
              <button
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  reviewFilter === 'all'
                    ? 'bg-white dark:bg-black text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                All ({questions.length})
              </button>
              <button
                onClick={() => setReviewFilter('correct')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  reviewFilter === 'correct'
                    ? 'bg-white dark:bg-black text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Correct ({calculatedResults.correct})
              </button>
              <button
                onClick={() => setReviewFilter('incorrect')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  reviewFilter === 'incorrect'
                    ? 'bg-white dark:bg-black text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Incorrect ({calculatedResults.total - calculatedResults.correct})
              </button>
              <button
                onClick={() => setReviewFilter('marked')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  reviewFilter === 'marked'
                    ? 'bg-white dark:bg-black text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Marked ({markedCount})
              </button>
            </div>
          </div>

          {filteredQuestions.map((q, idx) => {
            const userAnswerIndex = answers[q.id];
            const isCorrect = userAnswerIndex === q.correctIndex;
            const originalIndex = questions.findIndex(item => item.id === q.id) + 1;

            return (
              <div 
                key={q.id}
                className={`p-5 rounded-xl border bg-white dark:bg-black transition-all ${
                  isCorrect 
                    ? 'border-emerald-200 dark:border-emerald-950/60' 
                    : 'border-rose-200 dark:border-rose-950/60'
                }`}
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
                      Question #{originalIndex}
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">
                      {q.categoryLabel} • {q.tier}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                        <XCircle className="w-4 h-4" /> {userAnswerIndex === undefined ? 'Unanswered' : 'Incorrect'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Problem Statement */}
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-2">
                  {q.problemStatement}
                </p>

                {/* Visual Renderer if present */}
                {q.visualType === 'sequence-strip' && q.sequenceStrip && (
                  <SequenceStripRenderer sequence={q.sequenceStrip} />
                )}
                {q.visualType === 'matrix' && q.matrixData && (
                  <VisualMatrixRenderer matrix={q.matrixData} />
                )}
                {q.visualType === 'chart' && q.chartData && (
                  <DataChartRenderer chart={q.chartData} />
                )}
                {q.visualType === 'table' && q.tableData && (
                  <DataTableRenderer table={q.tableData} />
                )}

                {/* Four Options Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {q.options.map((opt, optIdx) => {
                    const isOptionCorrect = optIdx === q.correctIndex;
                    const isUserChoice = optIdx === userAnswerIndex;
                    const letter = ['A', 'B', 'C', 'D'][optIdx];

                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between ${
                          isOptionCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-semibold'
                            : isUserChoice && !isCorrect
                            ? 'bg-rose-500/10 border-rose-500/50 text-rose-800 dark:text-rose-300 line-through'
                            : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 opacity-80'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-bold">{letter}.</span> {opt}
                        </span>
                        {isOptionCorrect && (
                          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                            Correct Answer
                          </span>
                        )}
                        {isUserChoice && !isCorrect && (
                          <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* In-depth Solution Explanation */}
                <div className="mt-4 p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 mb-1">
                    <Info className="w-3.5 h-3.5 text-neutral-500" />
                    Step-by-Step Solution & Rationale:
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed font-sans">
                    {q.explanation}
                  </p>
                  {q.formulaNote && (
                    <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-neutral-500 font-mono text-[11px]">
                      Formula / Invariant: <span className="text-neutral-900 dark:text-neutral-100">{q.formulaNote}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // ACTIVE ASSESSMENT INTERFACE
  // ==========================================
  return (
    <div className="w-full max-w-5xl mx-auto py-2 sm:py-4 px-2 sm:px-4">
      {/* Top Bar: Progress, Timer, and Actions */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4 mb-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Module Label */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-black">
                PSIKO MATH
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                {currentQ?.categoryLabel}
              </span>
            </div>
            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-4">
            <div 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold transition-all ${
                secondsRemaining < 120 
                  ? 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse' 
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            {/* Final Submit Assessment Button */}
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Finish & Submit
            </button>
          </div>
        </div>

        {/* Global Progress Line */}
        <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-1.5 rounded-full overflow-hidden mt-3">
          <div 
            className="bg-neutral-900 dark:bg-neutral-100 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Left Palette + Center Question Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Side: Question Palette */}
        <div className="lg:col-span-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4 shadow-xs order-2 lg:order-1">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100 dark:border-neutral-900">
            <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
              QUESTION PALETTE
            </span>
            <span className="text-[11px] font-mono text-neutral-500">
              {answeredCount}/{questions.length} Done
            </span>
          </div>

          {/* Palette Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isMarked = !!markedForReview[q.id];
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-lg font-mono text-xs font-semibold relative transition-all flex items-center justify-center border ${
                    isCurrent
                      ? 'border-neutral-900 dark:border-white ring-2 ring-neutral-900/20 dark:ring-white/20 bg-neutral-900 text-white dark:bg-white dark:text-black font-bold'
                      : isMarked
                      ? 'border-amber-400 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : isAnswered
                      ? 'border-neutral-400 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-neutral-400'
                  }`}
                  title={`Question ${idx + 1}`}
                >
                  {idx + 1}
                  {isMarked && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-black" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-900 space-y-1.5 text-[11px] text-neutral-500 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-neutral-200 dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-600" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500/10 border border-amber-400 text-amber-500 text-[9px] flex items-center justify-center font-bold">▲</span>
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded border border-neutral-200 dark:border-neutral-800" />
              <span>Unanswered</span>
            </div>
          </div>
        </div>

        {/* Center / Main Area: Question Content & Options */}
        <div className="lg:col-span-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4 sm:p-6 shadow-xs order-1 lg:order-2 flex flex-col justify-between">
          <div>
            {/* Header / Badges */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
                  {currentQ?.tier} Tier
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  {currentQ?.title}
                </span>
              </div>

              {/* Mark for Review Toggle */}
              <button
                onClick={toggleMarkForReview}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  markedForReview[currentQ?.id]
                    ? 'border-amber-400 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {markedForReview[currentQ?.id] ? 'Marked for Review' : 'Mark for Review'}
              </button>
            </div>

            {/* Problem Statement */}
            <div className="my-3">
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                {currentQ?.problemStatement}
              </h3>
            </div>

            {/* Visual Element Display */}
            {currentQ?.visualType === 'sequence-strip' && currentQ.sequenceStrip && (
              <SequenceStripRenderer sequence={currentQ.sequenceStrip} />
            )}
            {currentQ?.visualType === 'matrix' && currentQ.matrixData && (
              <VisualMatrixRenderer matrix={currentQ.matrixData} />
            )}
            {currentQ?.visualType === 'chart' && currentQ.chartData && (
              <DataChartRenderer chart={currentQ.chartData} />
            )}
            {currentQ?.visualType === 'table' && currentQ.tableData && (
              <DataTableRenderer table={currentQ.tableData} />
            )}

            {/* Four Answer Options (A, B, C, D) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {currentQ?.options.map((optionText, optIdx) => {
                const isSelected = answers[currentQ.id] === optIdx;
                const letter = ['A', 'B', 'C', 'D'][optIdx];

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm ring-1 ring-neutral-900 dark:ring-white'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-900 dark:text-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span 
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-white text-neutral-900 dark:bg-black dark:text-white'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm font-medium font-sans">
                        {optionText}
                      </span>
                    </div>

                    <span 
                      className={`text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity ${
                        isSelected ? 'opacity-100' : 'text-neutral-400'
                      }`}
                    >
                      [{letter}]
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-900">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-xs font-mono text-neutral-400">
              {answers[currentQ?.id] !== undefined ? 'Answered' : 'Not Answered'}
            </span>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
              >
                Submit Assessment
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Ready to submit assessment?
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">
              Once submitted, your responses will be scored and you will gain access to the full solution explanations and metrics breakdown.
            </p>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center mb-6">
              <div>
                <span className="text-[10px] font-mono text-neutral-500">ANSWERED</span>
                <div className="text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100">
                  {answeredCount}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-neutral-500">UNANSWERED</span>
                <div className={`text-lg font-bold font-mono ${unansweredCount > 0 ? 'text-rose-500' : 'text-neutral-900 dark:text-neutral-100'}`}>
                  {unansweredCount}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-neutral-500">MARKED</span>
                <div className="text-lg font-bold font-mono text-amber-500">
                  {markedCount}
                </div>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs mb-4">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>You still have {unansweredCount} unanswered questions. Unanswered questions receive 0 points.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              >
                Return to Test
              </button>
              <button
                onClick={handleSubmitAssessment}
                className="px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 text-xs font-semibold transition-all"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
