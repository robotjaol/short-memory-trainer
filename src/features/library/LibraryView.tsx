import React, { useState, useMemo } from 'react';
import { EXERCISE_CATALOG } from '../../data/exerciseCatalog';
import { ALL_LEVEL_CHALLENGES, MASTER_LEVELS } from '../../data/exerciseLevels';
import { ExerciseStats, CognitiveCategory } from '../../types/exercise';
import { SpotlightBox } from '../../components/ui/SpotlightBox';
import { 
  Search, 
  Play, 
  Award, 
  Clock, 
  Zap, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface LibraryViewProps {
  exerciseStats: Record<string, ExerciseStats>;
  onLaunchExercise: (exerciseId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  exerciseStats,
  onLaunchExercise
}) => {
  // Mode toggle: 'ladder' (100+ Levels per category) vs 'core' (10 Master Modules)
  const [activeMode, setActiveMode] = useState<'ladder' | 'core'>('ladder');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Tier filter state for levels
  const [selectedTier, setSelectedTier] = useState<string>('all');
  
  // Pagination state for the 735 level challenges
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 24;

  const categories: { id: string; label: string; count: number }[] = [
    { id: 'all', label: 'All Categories', count: 735 },
    { id: 'digit', label: 'Digit Memory', count: 105 },
    { id: 'sequence', label: 'Sequence', count: 105 },
    { id: 'working-memory', label: 'Working Memory', count: 105 },
    { id: 'spatial', label: 'Spatial', count: 105 },
    { id: 'visual', label: 'Visual', count: 105 },
    { id: 'verbal', label: 'Verbal', count: 105 },
    { id: 'attention', label: 'Attention', count: 105 }
  ];

  const tiers = [
    { id: 'all', label: 'All Tiers (1-105)' },
    { id: 'Foundation', label: 'Foundation (1-25)' },
    { id: 'Intermediate', label: 'Intermediate (26-50)' },
    { id: 'Advanced', label: 'Advanced (51-75)' },
    { id: 'Master', label: 'Master (76-95)' },
    { id: 'Grandmaster', label: 'Grandmaster (96-105)' },
  ];

  // Filter core 10 modules
  const filteredCoreExercises = useMemo(() => {
    return EXERCISE_CATALOG.filter(ex => {
      const matchCat = selectedCategory === 'all' || ex.category === selectedCategory;
      const matchSearch =
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.cognitiveSkill.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [searchTerm, selectedCategory]);

  // Filter 735 level challenges
  const filteredLevelChallenges = useMemo(() => {
    return ALL_LEVEL_CHALLENGES.filter(lvl => {
      const matchCat = selectedCategory === 'all' || lvl.category === selectedCategory;
      const matchTier = selectedTier === 'all' || lvl.tier === selectedTier;
      const s = searchTerm.toLowerCase();
      const matchSearch =
        !s ||
        lvl.title.toLowerCase().includes(s) ||
        lvl.specs.toLowerCase().includes(s) ||
        lvl.targetMetric.toLowerCase().includes(s) ||
        `level ${lvl.levelNumber}`.includes(s) ||
        `#${lvl.levelNumber}`.includes(s);
      return matchCat && matchTier && matchSearch;
    });
  }, [selectedCategory, selectedTier, searchTerm]);

  // Paginated level challenges
  const totalPages = Math.max(1, Math.ceil(filteredLevelChallenges.length / itemsPerPage));
  const paginatedLevels = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLevelChallenges.slice(start, start + itemsPerPage);
  }, [filteredLevelChallenges, currentPage]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleTierChange = (tierId: string) => {
    setSelectedTier(tierId);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              100+ Exercises per Category Active
            </span>
            <span className="text-xs font-mono text-neutral-400">• 735 Calibrated Drills</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-white">
            Training Library
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Progress through over 100 dedicated exercise levels for each of the 7 cognitive domains.
          </p>
        </div>

        {/* Mode Pill Toggle */}
        <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveMode('ladder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'ladder'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>100+ Level Ladder (735)</span>
          </button>

          <button
            onClick={() => setActiveMode('core')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'core'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Core Engines (10)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={
              activeMode === 'ladder'
                ? 'Search level #, parameters, speed, span...'
                : 'Search master modules, target skills...'
            }
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-black dark:text-white placeholder-neutral-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
          />
        </div>

        {/* Tier dropdown for 100+ Ladder mode */}
        {activeMode === 'ladder' && (
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-neutral-400" />
            <select
              value={selectedTier}
              onChange={e => handleTierChange(e.target.value)}
              aria-label="Filter by tier"
              className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs text-black dark:text-white focus:outline-hidden"
            >
              {tiers.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white bg-neutral-100 dark:bg-neutral-900'
            }`}
          >
            <span>{cat.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedCategory === cat.id
                ? 'bg-neutral-800 text-neutral-100 dark:bg-neutral-200 dark:text-neutral-900'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}>
              {cat.id === 'all' ? (activeMode === 'ladder' ? '735' : '10') : '105'}
            </span>
          </button>
        ))}
      </div>

      {/* MODE 1: 100+ LEVEL LADDER VIEW (735 EXERCISES) */}
      {activeMode === 'ladder' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
            <span>
              Showing <strong className="text-black dark:text-white">{filteredLevelChallenges.length}</strong> calibrated levels
            </span>
            <span>
              Page <strong className="text-black dark:text-white">{currentPage}</strong> of {totalPages}
            </span>
          </div>

          {filteredLevelChallenges.length === 0 ? (
            <SpotlightBox className="text-center py-16 p-6" interactive={false}>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No level challenges match your search or filters.
              </p>
            </SpotlightBox>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedLevels.map(lvl => {
                const isMaster = lvl.tier === 'Master' || lvl.tier === 'Grandmaster';
                const isAdvanced = lvl.tier === 'Advanced';

                return (
                  <SpotlightBox
                    key={lvl.id}
                    className="p-4 sm:p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top badges: Level # and Tier */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white">
                          #{lvl.levelNumber}
                        </span>

                        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${
                          isMaster 
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' 
                            : isAdvanced 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                        }`}>
                          {lvl.tier}
                        </span>
                      </div>

                      {/* Title & Domain */}
                      <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-0.5">
                        {lvl.categoryLabel}
                      </span>
                      <h3 className="text-sm font-bold text-black dark:text-white mb-2 line-clamp-1">
                        {lvl.title}
                      </h3>

                      {/* Technical Specs Box */}
                      <div className="p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-mono space-y-1 mb-3">
                        <div className="text-[11px] text-black dark:text-white font-medium">
                          {lvl.specs}
                        </div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                          {lvl.targetMetric}
                        </div>
                      </div>
                    </div>

                    {/* Launch Level CTA */}
                    <button
                      onClick={() => onLaunchExercise(lvl.id)}
                      className="w-full mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors shadow-2xs active:scale-98 touch-manipulation"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start Level #{lvl.levelNumber}</span>
                    </button>
                  </SpotlightBox>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 font-mono text-xs">
                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  let pageNum = idx + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = Math.min(totalPages - 4 + idx, currentPage - 2 + idx);
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        currentPage === pageNum
                          ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: CORE 10 MODULES VIEW */}
      {activeMode === 'core' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoreExercises.map(ex => {
            const stats = exerciseStats[ex.id];
            return (
              <SpotlightBox
                key={ex.id}
                className="p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
                    <span className="uppercase tracking-wider text-[10px] text-neutral-500">
                      {ex.categoryLabel}
                    </span>
                    <div className="flex items-center gap-1 text-neutral-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ex.estimatedDuration}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-black dark:text-white mb-1.5">
                    {ex.name}
                  </h3>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                    {ex.description}
                  </p>

                  <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg mb-4 text-xs font-mono">
                    <span className="text-[11px] text-neutral-500 block mb-0.5">Target Skill:</span>
                    <span className="text-black dark:text-white font-medium">
                      {ex.cognitiveSkill}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between">
                  <div className="text-xs font-mono">
                    {stats ? (
                      <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                        <Award className="w-3.5 h-3.5 text-black dark:text-white" />
                        <span className="tabular-nums font-semibold">{stats.bestScore} pts</span>
                        <span className="text-neutral-400">({stats.averageAccuracy}%)</span>
                      </div>
                    ) : (
                      <span className="text-neutral-400 text-[11px]">No attempts</span>
                    )}
                  </div>

                  <button
                    onClick={() => onLaunchExercise(ex.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors shadow-2xs touch-manipulation"
                  >
                    <span>Train Engine</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </SpotlightBox>
            );
          })}
        </div>
      )}
    </div>
  );
};
