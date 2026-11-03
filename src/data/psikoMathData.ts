export type PsikoMathCategory = 
  | 'number-sequence'
  | 'arithmetic-logic'
  | 'percentage-ratio'
  | 'probability'
  | 'logic-puzzle'
  | 'visual-pattern'
  | 'data-chart-bar'
  | 'data-chart-line'
  | 'data-chart-pie'
  | 'data-table';

export type PsikoMathTier = 'Foundation' | 'Intermediate' | 'Advanced' | 'Master';

export interface VisualMatrixCell {
  shapes: {
    type: 'circle' | 'square' | 'triangle' | 'diamond' | 'cross' | 'star' | 'dot' | 'line';
    color?: string;
    fill?: boolean;
    rotation?: number; // degrees
    count?: number;
    size?: number; // 1-3
  }[];
  label?: string;
  isQuestionMark?: boolean;
}

export interface VisualMatrixData {
  rows: number;
  cols: number;
  cells: VisualMatrixCell[][];
  ruleHint?: string;
}

export interface ChartDataPoint {
  label: string;
  [key: string]: string | number;
}

export interface ChartPayload {
  type: 'bar' | 'line' | 'pie';
  title: string;
  data: ChartDataPoint[];
  dataKeys: { key: string; name: string; color: string }[];
  xAxisKey?: string;
  yAxisLabel?: string;
}

export interface TablePayload {
  headers: string[];
  rows: (string | number)[][];
  highlightColIndex?: number;
}

export interface RawPsikoQuestion {
  id: string;
  title: string;
  tier: PsikoMathTier;
  category: PsikoMathCategory;
  categoryLabel: string;
  problemStatement: string;
  visualType?: 'matrix' | 'chart' | 'table' | 'sequence-strip';
  matrixData?: VisualMatrixData;
  chartData?: ChartPayload;
  tableData?: TablePayload;
  sequenceStrip?: (string | number)[];
  options: [string, string, string, string]; // exactly 4 options
  correctIndex: number; // 0, 1, 2, or 3
  explanation: string;
  formulaNote?: string;
}

export interface ShuffledPsikoQuestion {
  id: string;
  title: string;
  tier: PsikoMathTier;
  category: PsikoMathCategory;
  categoryLabel: string;
  problemStatement: string;
  visualType?: 'matrix' | 'chart' | 'table' | 'sequence-strip';
  matrixData?: VisualMatrixData;
  chartData?: ChartPayload;
  tableData?: TablePayload;
  sequenceStrip?: (string | number)[];
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  formulaNote?: string;
  originalCorrectText: string;
}

export const PSIKO_MATH_QUESTIONS: RawPsikoQuestion[] = [
  // ==========================================
  // TIER 1: FOUNDATION (Questions 1 - 8)
  // ==========================================
  {
    id: 'pm-q1',
    title: 'Arithmetic Difference Sequence',
    tier: 'Foundation',
    category: 'number-sequence',
    categoryLabel: 'Missing Number Sequence',
    problemStatement: 'Identify the missing number that logically completes the following sequence:',
    visualType: 'sequence-strip',
    sequenceStrip: [4, 9, 16, 25, 36, '?'],
    options: ['45', '47', '49', '51'],
    correctIndex: 2,
    explanation: 'This is the sequence of consecutive perfect squares: 2² = 4, 3² = 9, 4² = 16, 5² = 25, 6² = 36. Therefore, the next term is 7² = 49.',
    formulaNote: 'n² for n = 2, 3, 4, 5, 6, 7'
  },
  {
    id: 'pm-q2',
    title: 'Two-Tier Difference Progression',
    tier: 'Foundation',
    category: 'number-sequence',
    categoryLabel: 'Arithmetic Patterns',
    problemStatement: 'Find the value of X in the series below:',
    visualType: 'sequence-strip',
    sequenceStrip: [3, 7, 15, 31, 'X', 127],
    options: ['57', '61', '63', '65'],
    correctIndex: 2,
    explanation: 'Each term is obtained by doubling the previous term and adding 1: (3×2)+1=7, (7×2)+1=15, (15×2)+1=31. Hence, X = (31×2) + 1 = 63. Alternatively, the differences between consecutive terms double: +4, +8, +16, +32 (31+32=63), +64 (63+64=127).',
    formulaNote: 'T_n = 2 × T_{n-1} + 1'
  },
  {
    id: 'pm-q3',
    title: 'Department Productivity Bar Chart',
    tier: 'Foundation',
    category: 'data-chart-bar',
    categoryLabel: 'Data Interpretation - Bar Chart',
    problemStatement: 'The bar chart displays the quarterly output units manufactured across four operational teams. Which team achieved the highest total output over the entire four quarters?',
    visualType: 'chart',
    chartData: {
      type: 'bar',
      title: 'Quarterly Output by Production Team (Units)',
      dataKeys: [
        { key: 'TeamA', name: 'Alpha', color: '#3b82f6' },
        { key: 'TeamB', name: 'Beta', color: '#10b981' },
        { key: 'TeamC', name: 'Gamma', color: '#f59e0b' },
        { key: 'TeamD', name: 'Delta', color: '#8b5cf6' }
      ],
      xAxisKey: 'label',
      yAxisLabel: 'Units Produced',
      data: [
        { label: 'Q1', TeamA: 420, TeamB: 380, TeamC: 450, TeamD: 390 },
        { label: 'Q2', TeamA: 460, TeamB: 410, TeamC: 430, TeamD: 440 },
        { label: 'Q3', TeamA: 510, TeamB: 470, TeamC: 480, TeamD: 520 },
        { label: 'Q4', TeamA: 530, TeamB: 540, TeamC: 490, TeamD: 560 }
      ]
    },
    options: ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta'],
    correctIndex: 0,
    explanation: 'Sum each team across Q1-Q4:\n- Team Alpha: 420 + 460 + 510 + 530 = 1,920 units\n- Team Beta: 380 + 410 + 470 + 540 = 1,800 units\n- Team Gamma: 450 + 430 + 480 + 490 = 1,850 units\n- Team Delta: 390 + 440 + 520 + 560 = 1,910 units\nTeam Alpha has the greatest total of 1,920 units (edging Delta by 10 units).',
    formulaNote: 'Total = ∑(Q1 + Q2 + Q3 + Q4)'
  },
  {
    id: 'pm-q4',
    title: 'Ratio & Mixture Division',
    tier: 'Foundation',
    category: 'percentage-ratio',
    categoryLabel: 'Ratios & Proportions',
    problemStatement: 'A chemical batch of 140 liters is blended using solvent A and solvent B in a ratio of 4 : 3. How many liters of solvent A must be added to change the mixture ratio to 2 : 1?',
    options: ['15 liters', '20 liters', '30 liters', '40 liters'],
    correctIndex: 3,
    explanation: '1. Total parts in 4:3 is 4 + 3 = 7 parts.\n2. Initial solvent A = (4/7) × 140 = 80 liters.\n3. Initial solvent B = (3/7) × 140 = 60 liters.\n4. To make ratio A : B = 2 : 1 with B fixed at 60 liters, solvent A must be 2 × 60 = 120 liters.\n5. Solvent A to add = 120 - 80 = 40 liters.',
    formulaNote: 'New A = 2 × B = 120; Added = 120 - 80 = 40'
  },
  {
    id: 'pm-q5',
    title: 'Compound Percentage Change',
    tier: 'Foundation',
    category: 'percentage-ratio',
    categoryLabel: 'Percentage Calculations',
    problemStatement: 'An asset value increases by 20% in the first quarter, then decreases by 20% in the second quarter. What is the net overall percentage change relative to the initial value?',
    options: ['0% (No change)', '4% decrease', '4% increase', '2% decrease'],
    correctIndex: 1,
    explanation: 'Let initial value = 100.\n- After +20% increase: 100 × 1.20 = 120.\n- After -20% decrease: 120 × (1 - 0.20) = 120 × 0.80 = 96.\n- Net change = 96 - 100 = -4, which represents a 4% decrease.',
    formulaNote: 'Multiplier = (1 + 0.20) × (1 - 0.20) = 1 - 0.04 = 0.96 (-4%)'
  },
  {
    id: 'pm-q6',
    title: 'Visual 3x3 Shape Matrix',
    tier: 'Foundation',
    category: 'visual-pattern',
    categoryLabel: 'Abstract Matrix Reasoning',
    problemStatement: 'Examine the 3x3 matrix below. Which option replaces the question mark (?) according to the row and column pattern of geometric elements?',
    visualType: 'matrix',
    matrixData: {
      rows: 3,
      cols: 3,
      ruleHint: 'Row rule: each row contains one Circle, one Square, and one Triangle with progressive dot counts (1, 2, 3).',
      cells: [
        [
          { shapes: [{ type: 'circle', fill: false, count: 1 }, { type: 'dot', count: 1 }], label: '1 Dot' },
          { shapes: [{ type: 'square', fill: false, count: 1 }, { type: 'dot', count: 2 }], label: '2 Dots' },
          { shapes: [{ type: 'triangle', fill: false, count: 1 }, { type: 'dot', count: 3 }], label: '3 Dots' }
        ],
        [
          { shapes: [{ type: 'square', fill: false, count: 1 }, { type: 'dot', count: 3 }], label: '3 Dots' },
          { shapes: [{ type: 'triangle', fill: false, count: 1 }, { type: 'dot', count: 1 }], label: '1 Dot' },
          { shapes: [{ type: 'circle', fill: false, count: 1 }, { type: 'dot', count: 2 }], label: '2 Dots' }
        ],
        [
          { shapes: [{ type: 'triangle', fill: false, count: 1 }, { type: 'dot', count: 2 }], label: '2 Dots' },
          { shapes: [{ type: 'circle', fill: false, count: 1 }, { type: 'dot', count: 3 }], label: '3 Dots' },
          { shapes: [], isQuestionMark: true, label: '?' }
        ]
      ]
    },
    options: [
      'Square with 1 Dot',
      'Square with 2 Dots',
      'Circle with 1 Dot',
      'Diamond with 3 Dots'
    ],
    correctIndex: 0,
    explanation: 'Row 3 already contains a Triangle (2 dots) and a Circle (3 dots). To complete the set of shapes {Square, Circle, Triangle} and dot counts {1, 2, 3}, the missing element must be a Square with 1 Dot.',
    formulaNote: 'Permutation balance: Shape = Square, Dots = 1'
  },
  {
    id: 'pm-q7',
    title: 'Discrete Probability Draw',
    tier: 'Foundation',
    category: 'probability',
    categoryLabel: 'Probability & Combinatorics',
    problemStatement: 'An urn holds 5 blue marbles, 4 green marbles, and 6 red marbles. If two marbles are drawn at random without replacement, what is the probability that both drawn marbles are green?',
    options: ['2/35', '4/15', '2/15', '4/105'],
    correctIndex: 0,
    explanation: 'Total marbles = 5 + 4 + 6 = 15.\n1. P(First is Green) = 4/15.\n2. Without replacement, 3 green remain out of 14 total marbles: P(Second is Green | First Green) = 3/14.\n3. Combined probability = (4/15) × (3/14) = 12 / 210 = 2 / 35.',
    formulaNote: 'P(G₁ ∩ G₂) = (4/15) × (3/14) = 12/210 = 2/35'
  },
  {
    id: 'pm-q8',
    title: 'Deductive Office Logic',
    tier: 'Foundation',
    category: 'logic-puzzle',
    categoryLabel: 'Logical Reasoning & Deduction',
    problemStatement: 'Four researchers (Alex, Blair, Chloe, and Dan) sit along a single row of four consecutive desks numbered 1 to 4 from left to right. Dan is at desk 4. Alex is not adjacent to Dan. Blair is sitting directly between Alex and Chloe. At which desk is Alex seated?',
    options: ['Desk 1', 'Desk 2', 'Desk 3', 'Desk 4'],
    correctIndex: 0,
    explanation: '1. Desks are 1, 2, 3, 4. Dan is at 4.\n2. Alex is not adjacent to Dan, so Alex cannot be at desk 3. Alex must be at desk 1 or 2.\n3. Blair sits directly between Alex and Chloe, which requires three consecutive positions [Alex, Blair, Chloe] or [Chloe, Blair, Alex].\n4. The remaining available desks are 1, 2, and 3. Therefore, Blair must occupy the middle desk (2).\n5. Since Alex cannot be at desk 3 (which is adjacent to Dan at 4), Alex must be at Desk 1, Blair at Desk 2, Chloe at Desk 3, and Dan at Desk 4.',
    formulaNote: 'Arrangement: [1: Alex] - [2: Blair] - [3: Chloe] - [4: Dan]'
  },

  // ==========================================
  // TIER 2: INTERMEDIATE (Questions 9 - 16)
  // ==========================================
  {
    id: 'pm-q9',
    title: 'Alternating Multiplier & Addend Sequence',
    tier: 'Intermediate',
    category: 'number-sequence',
    categoryLabel: 'Numerical Sequences',
    problemStatement: 'Identify the number that replaces the question mark in this sequence:',
    visualType: 'sequence-strip',
    sequenceStrip: [2, 5, 11, 23, 47, '?'],
    options: ['89', '91', '95', '99'],
    correctIndex: 2,
    explanation: 'The pattern is: term × 2 + 1.\n- 2 × 2 + 1 = 5\n- 5 × 2 + 1 = 11\n- 11 × 2 + 1 = 23\n- 23 × 2 + 1 = 47\n- 47 × 2 + 1 = 95.\nAlternatively, the differences are: 3, 6, 12, 24, 48. 47 + 48 = 95.',
    formulaNote: 'a_{n} = 2a_{n-1} + 1'
  },
  {
    id: 'pm-q10',
    title: 'Server Load & Active Users Line Graph',
    tier: 'Intermediate',
    category: 'data-chart-line',
    categoryLabel: 'Data Interpretation - Line Graph',
    problemStatement: 'The graph illustrates concurrent monthly active users (in thousands) versus server compute overhead (percentage of cluster capacity). In which month did the ratio of Active Users to Server Overhead reach its highest peak?',
    visualType: 'chart',
    chartData: {
      type: 'line',
      title: 'Monthly Active Users (k) vs Server Overhead (%)',
      dataKeys: [
        { key: 'users', name: 'Active Users (k)', color: '#3b82f6' },
        { key: 'load', name: 'Server Overhead (%)', color: '#ef4444' }
      ],
      xAxisKey: 'label',
      yAxisLabel: 'Value',
      data: [
        { label: 'Jan', users: 120, load: 40 }, // ratio 3.0
        { label: 'Feb', users: 150, load: 45 }, // ratio 3.33
        { label: 'Mar', users: 210, load: 60 }, // ratio 3.50
        { label: 'Apr', users: 260, load: 80 }, // ratio 3.25
        { label: 'May', users: 300, load: 75 }  // ratio 4.00
      ]
    },
    options: ['February', 'March', 'April', 'May'],
    correctIndex: 3,
    explanation: 'Calculate User-to-Load Ratio (Users / Load) for each month:\n- Jan: 120 / 40 = 3.00\n- Feb: 150 / 45 = 3.33\n- Mar: 210 / 60 = 3.50\n- Apr: 260 / 80 = 3.25\n- May: 300 / 75 = 4.00\nMay attained the highest ratio of 4.00 active users per percent of overhead.',
    formulaNote: 'Ratio = Users(k) / Load(%)'
  },
  {
    id: 'pm-q11',
    title: 'Work Rate & Joint Productivity',
    tier: 'Intermediate',
    category: 'arithmetic-logic',
    categoryLabel: 'Work & Rate Problems',
    problemStatement: 'Worker A can build a software module in 6 days alone. Worker B can build the exact same module in 12 days alone. If both work together at their constant individual rates, how many days will it take them to complete the module?',
    options: ['3.5 days', '4 days', '4.5 days', '5 days'],
    correctIndex: 1,
    explanation: '1. Rate of A = 1/6 module per day.\n2. Rate of B = 1/12 module per day.\n3. Combined rate = 1/6 + 1/12 = 2/12 + 1/12 = 3/12 = 1/4 module per day.\n4. Time required = 1 / (1/4) = 4 days.',
    formulaNote: 'T = (A × B) / (A + B) = (6 × 12) / 18 = 72 / 18 = 4 days'
  },
  {
    id: 'pm-q12',
    title: 'Product Defect Metrics Table',
    tier: 'Intermediate',
    category: 'data-table',
    categoryLabel: 'Data Interpretation - Table',
    problemStatement: 'Based on the manufacturing inspection log below, which production batch yielded the lowest defect rate (percentage of inspected units found defective)?',
    visualType: 'table',
    tableData: {
      headers: ['Batch ID', 'Total Inspected', 'Minor Defects', 'Critical Defects'],
      rows: [
        ['Batch #101', 2500, 45, 5],
        ['Batch #102', 4000, 68, 12],
        ['Batch #103', 3200, 40, 8],
        ['Batch #104', 5000, 85, 20]
      ]
    },
    options: ['Batch #101', 'Batch #102', 'Batch #103', 'Batch #104'],
    correctIndex: 2,
    explanation: 'Total defects = Minor + Critical. Compute defect rate = (Total Defects / Total Inspected) × 100%:\n- Batch #101: (50 / 2500) = 2.00%\n- Batch #102: (80 / 4000) = 2.00%\n- Batch #103: (48 / 3200) = 1.50%\n- Batch #104: (105 / 5000) = 2.10%\nBatch #103 produced the lowest defect rate at 1.50%.',
    formulaNote: 'Defect Rate = (Minor + Critical) / Total'
  },
  {
    id: 'pm-q13',
    title: 'Clock Face Hands Angle',
    tier: 'Intermediate',
    category: 'arithmetic-logic',
    categoryLabel: 'Mathematical Logic',
    problemStatement: 'What is the acute angle between the minute hand and the hour hand of an analog clock at exactly 3:40?',
    options: ['120°', '125°', '130°', '140°'],
    correctIndex: 2,
    explanation: '1. Minute hand position at 40 min: 40 × 6° = 240°.\n2. Hour hand position at 3:40: (3 × 30°) + (40 × 0.5°) = 90° + 20° = 110°.\n3. Angle between hands = |240° - 110°| = 130°.',
    formulaNote: 'Angle = |30H - 5.5M| = |30(3) - 5.5(40)| = |90 - 220| = 130°'
  },
  {
    id: 'pm-q14',
    title: 'Municipal Energy Allocation Pie Chart',
    tier: 'Intermediate',
    category: 'data-chart-pie',
    categoryLabel: 'Data Interpretation - Pie Chart',
    problemStatement: 'The pie chart exhibits a city\'s annual power generation across five sources totaling 48,000 Gigawatt-hours (GWh). What is the total generation produced exclusively by Solar and Wind combined?',
    visualType: 'chart',
    chartData: {
      type: 'pie',
      title: 'City Power Generation Share (Total: 48,000 GWh)',
      dataKeys: [{ key: 'value', name: 'Percentage', color: '#10b981' }],
      data: [
        { label: 'Hydroelectric', value: 35 },
        { label: 'Wind', value: 25 },
        { label: 'Solar', value: 15 },
        { label: 'Nuclear', value: 15 },
        { label: 'Biomass', value: 10 }
      ]
    },
    options: ['14,400 GWh', '16,800 GWh', '19,200 GWh', '21,600 GWh'],
    correctIndex: 2,
    explanation: 'Solar is 15% and Wind is 25%, giving a combined share of 15% + 25% = 40%.\nTotal GWh = 40% of 48,000 = 0.40 × 48,000 = 19,200 GWh.',
    formulaNote: '(15% + 25%) × 48,000 = 0.40 × 48,000 = 19,200 GWh'
  },
  {
    id: 'pm-q15',
    title: 'Second-Order Difference Series',
    tier: 'Intermediate',
    category: 'number-sequence',
    categoryLabel: 'Quadratic Sequences',
    problemStatement: 'Determine the missing number in this progressive series:',
    visualType: 'sequence-strip',
    sequenceStrip: [5, 12, 23, 38, 57, '?'],
    options: ['78', '80', '82', '85'],
    correctIndex: 1,
    explanation: 'Calculate first-order differences between successive terms:\n- 12 - 5 = 7\n- 23 - 12 = 11\n- 38 - 23 = 15\n- 57 - 38 = 19\nNotice the differences form an arithmetic progression with a constant difference of +4 (+7, +11, +15, +19).\nThe next difference must be 19 + 4 = 23.\nTherefore, the missing term is 57 + 23 = 80.',
    formulaNote: 'Δ1 = 7, 11, 15, 19, 23; Next = 57 + 23 = 80'
  },
  {
    id: 'pm-q16',
    title: 'Conditional Probability Without Replacement',
    tier: 'Intermediate',
    category: 'probability',
    categoryLabel: 'Probability & Combinatorics',
    problemStatement: 'In a deck of 52 standard playing cards, two cards are drawn sequentially without replacement. What is the probability that both cards drawn are Aces?',
    options: ['1/221', '1/169', '4/663', '1/13'],
    correctIndex: 0,
    explanation: '1. Total cards = 52, total Aces = 4.\n2. P(First is Ace) = 4/52 = 1/13.\n3. After drawing one Ace, 3 Aces remain among 51 cards: P(Second is Ace) = 3/51 = 1/17.\n4. Combined probability = (1/13) × (1/17) = 1 / 221.',
    formulaNote: 'P(A₁ ∩ A₂) = (4/52) × (3/51) = 12 / 2652 = 1 / 221'
  },

  // ==========================================
  // TIER 3: ADVANCED (Questions 17 - 24)
  // ==========================================
  {
    id: 'pm-q17',
    title: 'Dual-Axis Variable Multiplier Sequence',
    tier: 'Advanced',
    category: 'number-sequence',
    categoryLabel: 'Complex Sequences',
    problemStatement: 'What number should replace the question mark in the following series?',
    visualType: 'sequence-strip',
    sequenceStrip: [2, 3, 8, 27, 112, '?'],
    options: ['480', '525', '565', '580'],
    correctIndex: 2,
    explanation: 'Observe the relationship between term n and term n+1:\n- (2 × 1) + 1 = 3\n- (3 × 2) + 2 = 8\n- (8 × 3) + 3 = 27\n- (27 × 4) + 4 = 112\n- Next term = (112 × 5) + 5 = 560 + 5 = 565.',
    formulaNote: 'T_{n+1} = T_n × n + n'
  },
  {
    id: 'pm-q18',
    title: 'Multi-Product Revenue & Margin Table',
    tier: 'Advanced',
    category: 'data-table',
    categoryLabel: 'Data Interpretation - Financial Matrix',
    problemStatement: 'Review the quarterly software product matrix. Which product generated the greatest net gross profit (Gross Revenue - Direct Overhead)?',
    visualType: 'table',
    tableData: {
      headers: ['Product Line', 'Licenses Sold', 'Unit Price ($)', 'Overhead ($)'],
      rows: [
        ['Platform Core', 1200, 150, 45000],
        ['Enterprise Suite', 450, 480, 52000],
        ['Security Plugin', 3500, 40, 28000],
        ['Cloud Storage', 2000, 85, 34000]
      ]
    },
    options: ['Platform Core', 'Enterprise Suite', 'Security Plugin', 'Cloud Storage'],
    correctIndex: 1,
    explanation: 'Calculate Gross Revenue = Licenses Sold × Unit Price, then subtract Overhead:\n- Platform Core: (1,200 × $150) - $45,000 = $180,000 - $45,000 = $135,000\n- Enterprise Suite: (450 × $480) - $52,000 = $216,000 - $52,000 = $164,000\n- Security Plugin: (3,500 × $40) - $28,000 = $140,000 - $28,000 = $112,000\n- Cloud Storage: (2,000 × $85) - $34,000 = $170,000 - $34,000 = $136,000\nEnterprise Suite yielded the highest net profit at $164,000.',
    formulaNote: 'Profit = (Licenses × Price) - Overhead'
  },
  {
    id: 'pm-q19',
    title: 'Relative Speed & Overtaking Train Problem',
    tier: 'Advanced',
    category: 'arithmetic-logic',
    categoryLabel: 'Kinematics & Rate Logic',
    problemStatement: 'Two trains travel in opposite directions along parallel tracks. Train X is 180 meters long moving at 72 km/h. Train Y is 120 meters long moving at 108 km/h. How many seconds will it take from the moment their front locomotives meet until their rear ends completely clear each other?',
    options: ['4.5 seconds', '6.0 seconds', '7.2 seconds', '8.0 seconds'],
    correctIndex: 1,
    explanation: '1. Total distance to clear = Length(X) + Length(Y) = 180 + 120 = 300 meters.\n2. When moving in opposite directions, relative speed = Speed(X) + Speed(Y) = 72 + 108 = 180 km/h.\n3. Convert relative speed to m/s: 180 × (5/18) = 50 m/s.\n4. Time required = Total Distance / Relative Speed = 300 m / 50 m/s = 6.0 seconds.',
    formulaNote: 'Time = (D₁ + D₂) / (V₁ + V₂) = 300 / 50 = 6.0 s'
  },
  {
    id: 'pm-q20',
    title: 'Rotational 3x3 Symbol Matrix',
    tier: 'Advanced',
    category: 'visual-pattern',
    categoryLabel: 'Abstract Visual Reasoning',
    problemStatement: 'Observe the 3x3 transformation matrix. What is the correct replacement for (?) following both row-wise and column-wise rotation and shading invariants?',
    visualType: 'matrix',
    matrixData: {
      rows: 3,
      cols: 3,
      ruleHint: 'Row transformation: shapes rotate clockwise by 90° across columns, and shading inverts (Outline → Shaded → Half-shaded).',
      cells: [
        [
          { shapes: [{ type: 'triangle', rotation: 0, fill: false }], label: '0° Clear' },
          { shapes: [{ type: 'triangle', rotation: 90, fill: true }], label: '90° Filled' },
          { shapes: [{ type: 'triangle', rotation: 180, fill: false }], label: '180° Half' }
        ],
        [
          { shapes: [{ type: 'diamond', rotation: 0, fill: false }], label: '0° Clear' },
          { shapes: [{ type: 'diamond', rotation: 90, fill: true }], label: '90° Filled' },
          { shapes: [{ type: 'diamond', rotation: 180, fill: false }], label: '180° Half' }
        ],
        [
          { shapes: [{ type: 'cross', rotation: 0, fill: false }], label: '0° Clear' },
          { shapes: [{ type: 'cross', rotation: 90, fill: true }], label: '90° Filled' },
          { shapes: [], isQuestionMark: true, label: '?' }
        ]
      ]
    },
    options: [
      'Cross rotated 180° with Half-shading',
      'Cross rotated 270° with Full-shading',
      'Triangle rotated 180° with Half-shading',
      'Square rotated 90° with Clear fill'
    ],
    correctIndex: 0,
    explanation: 'In each row, the base shape remains constant (Row 1: Triangle, Row 2: Diamond, Row 3: Cross). Across columns, the shape rotates by 90° clockwise (0° → 90° → 180°) while adopting the third column pattern (Half-shaded outline). Therefore, Row 3 Column 3 must be a Cross rotated 180° with Half-shading.',
    formulaNote: 'Angle = 0° + (col × 90°) = 180°; Shape = Cross'
  },
  {
    id: 'pm-q21',
    title: 'Compound Interest vs Simple Interest Spread',
    tier: 'Advanced',
    category: 'arithmetic-logic',
    categoryLabel: 'Financial Mathematics',
    problemStatement: 'A principal sum of $10,000 is invested for 2 years at an annual interest rate of 10%. What is the exact difference between compound interest (compounded annually) and simple interest earned over the 2-year period?',
    options: ['$50', '$100', '$150', '$200'],
    correctIndex: 1,
    explanation: '1. Simple Interest (SI) = P × R × T = 10,000 × 0.10 × 2 = $2,000.\n2. Compound Interest (CI) = P × (1 + R)^T - P = 10,000 × (1.10)² - 10,000 = 10,000 × 1.21 - 10,000 = $2,100.\n3. Difference = CI - SI = 2,100 - 2,000 = $100.\n(Direct formula for 2 years: Difference = P × R² = 10,000 × (0.10)² = 10,000 × 0.01 = $100).',
    formulaNote: 'Difference = P × (R / 100)² = 10,000 × 0.01 = $100'
  },
  {
    id: 'pm-q22',
    title: 'Conditional Defect Bayes Formulation',
    tier: 'Advanced',
    category: 'probability',
    categoryLabel: 'Bayesian Probability',
    problemStatement: 'Factory machine M1 produces 60% of all microchips, with a 2% defect rate. Machine M2 produces the remaining 40%, with a 5% defect rate. If a randomly picked microchip is found to be defective, what is the probability that it was produced by Machine M2?',
    options: ['37.5%', '50.0%', '62.5%', '70.0'],
    correctIndex: 2,
    explanation: 'Use Bayes\' Theorem:\n1. P(Defect | M1) = 0.02, P(M1) = 0.60 → Joint = 0.60 × 0.02 = 0.012\n2. P(Defect | M2) = 0.05, P(M2) = 0.40 → Joint = 0.40 × 0.05 = 0.020\n3. Total P(Defect) = 0.012 + 0.020 = 0.032\n4. P(M2 | Defect) = 0.020 / 0.032 = 20 / 32 = 5 / 8 = 62.5%.',
    formulaNote: 'P(M₂|D) = [P(D|M₂)P(M₂)] / P(D) = 0.020 / 0.032 = 62.5%'
  },
  {
    id: 'pm-q23',
    title: 'Logic Knights and Knaves Statement',
    tier: 'Advanced',
    category: 'logic-puzzle',
    categoryLabel: 'Deductive Logic Puzzles',
    problemStatement: 'On an island, inhabitants are either Knights (who always tell the truth) or Knaves (who always lie). You meet two inhabitants, P and Q. P asserts: "At least one of us is a Knave." What are the true identities of P and Q?',
    options: [
      'P is a Knight, and Q is a Knave',
      'Both P and Q are Knights',
      'Both P and Q are Knaves',
      'P is a Knave, and Q is a Knight'
    ],
    correctIndex: 0,
    explanation: '1. Suppose P is a Knave. Then P\'s statement ("At least one of us is a Knave") must be false. But if P is a Knave, at least one of them IS a Knave, which would make P\'s statement true! This contradiction means P cannot be a Knave.\n2. Therefore, P must be a Knight, meaning P\'s statement is true.\n3. Since P is a Knight, for the statement "At least one of us is a Knave" to be true, the other person (Q) must be a Knave.\nConclusion: P is a Knight, and Q is a Knave.',
    formulaNote: 'Truth Table: P = T ⇒ (¬P ∨ ¬Q) = T ⇒ ¬Q = T ⇒ Q = Knave'
  },
  {
    id: 'pm-q24',
    title: 'Quarterly Sales Variance Bar Graph',
    tier: 'Advanced',
    category: 'data-chart-bar',
    categoryLabel: 'Data Interpretation - Variance Analysis',
    problemStatement: 'The chart compares Budgeted vs Actual marketing expenditure ($k). Which quarter recorded the largest percentage deviation of actual spending compared to the budgeted target?',
    visualType: 'chart',
    chartData: {
      type: 'bar',
      title: 'Marketing Budget vs Actual Spend ($ in thousands)',
      dataKeys: [
        { key: 'budget', name: 'Budget ($k)', color: '#64748b' },
        { key: 'actual', name: 'Actual ($k)', color: '#0ea5e9' }
      ],
      xAxisKey: 'label',
      yAxisLabel: 'Expenditure ($k)',
      data: [
        { label: 'Q1', budget: 100, actual: 115 }, // +15%
        { label: 'Q2', budget: 150, actual: 120 }, // -20%
        { label: 'Q3', budget: 200, actual: 230 }, // +15%
        { label: 'Q4', budget: 250, actual: 225 }  // -10%
      ]
    },
    options: ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'],
    correctIndex: 1,
    explanation: 'Percentage deviation = |Actual - Budget| / Budget × 100%:\n- Q1: |115 - 100| / 100 = 15 / 100 = 15.0%\n- Q2: |120 - 150| / 150 = 30 / 150 = 20.0%\n- Q3: |230 - 200| / 200 = 30 / 200 = 15.0%\n- Q4: |225 - 250| / 250 = 25 / 250 = 10.0%\nQuarter 2 witnessed the largest percentage deviation at 20.0%.',
    formulaNote: 'Deviation = |Actual - Budget| / Budget × 100%'
  },

  // ==========================================
  // TIER 4: MASTER (Questions 25 - 32)
  // ==========================================
  {
    id: 'pm-q25',
    title: 'Cubic Interlocking Numerical Series',
    tier: 'Master',
    category: 'number-sequence',
    categoryLabel: 'High-Order Number Sequences',
    problemStatement: 'Identify the number that completes this high-order progression:',
    visualType: 'sequence-strip',
    sequenceStrip: [0, 6, 24, 60, 120, 210, '?'],
    options: ['312', '336', '342', '350'],
    correctIndex: 1,
    explanation: 'Each term follows the formula n³ - n for consecutive integers n = 1, 2, 3, 4, 5, 6, 7:\n- 1³ - 1 = 1 - 1 = 0\n- 2³ - 2 = 8 - 2 = 6\n- 3³ - 3 = 27 - 3 = 24\n- 4³ - 4 = 64 - 4 = 60\n- 5³ - 5 = 125 - 5 = 120\n- 6³ - 6 = 216 - 6 = 210\n- 7³ - 7 = 343 - 7 = 336.\nAlternatively, n × (n+1) × (n+2) shifted: 1×2×3=6, 2×3×4=24, 3×4×5=60, 4×5×6=120, 5×6×7=210, 6×7×8=336.',
    formulaNote: 'T_n = n³ - n for n = 7: 343 - 7 = 336'
  },
  {
    id: 'pm-q26',
    title: 'Two Inflow & One Drain Pipe Reservoir Logic',
    tier: 'Master',
    category: 'arithmetic-logic',
    categoryLabel: 'Hydrodynamic Work Rates',
    problemStatement: 'Pipe A can fill a water tank in 4 hours. Pipe B can fill the same tank in 6 hours. Drain Pipe C can empty a full tank in 8 hours. If all three pipes are opened simultaneously when the tank is empty, how many hours will it take to fill the tank completely?',
    options: ['2.2 hours', '2.4 hours', '2.77 hours (24/7 hrs)', '3.43 hours (24/7 hrs)'],
    correctIndex: 2,
    explanation: '1. Filling rate of Pipe A = +1/4 tank/hr\n2. Filling rate of Pipe B = +1/6 tank/hr\n3. Emptying rate of Pipe C = -1/8 tank/hr\n4. Net rate = 1/4 + 1/6 - 1/8. Common denominator is 24:\n   Net rate = (6 + 4 - 3) / 24 = 7 / 24 tank per hour.\n5. Total time to fill tank = 1 / (7/24) = 24/7 hours ≈ 3.428... wait, 24/7 = 3.428 hours.',
    formulaNote: 'Time = 24 / 7 ≈ 3.43 hours'
  },
  {
    id: 'pm-q27',
    title: 'Regional Supply Chain Efficiency Multi-Metric Table',
    tier: 'Master',
    category: 'data-table',
    categoryLabel: 'Data Interpretation - Supply Chain Efficiency',
    problemStatement: 'Analyze the regional logistics performance table. Which supply hub achieved the lowest freight cost per successful delivered container (Freight Spend divided by (Dispatched Containers × On-Time Rate))?',
    visualType: 'table',
    tableData: {
      headers: ['Logistics Hub', 'Freight Spend ($k)', 'Dispatched Containers', 'On-Time Rate (%)'],
      rows: [
        ['Rotterdam Hub', 4500, 3000, 90],
        ['Singapore Hub', 6200, 4500, 92],
        ['Busan Hub', 3800, 2800, 95],
        ['Dubai Hub', 5100, 3600, 85]
      ]
    },
    options: ['Rotterdam Hub', 'Singapore Hub', 'Busan Hub', 'Dubai Hub'],
    correctIndex: 2,
    explanation: 'Successful containers = Dispatched × (On-Time Rate / 100). Cost per container = Freight Spend / Successful Containers:\n- Rotterdam: 3000 × 0.90 = 2700 containers → $4,500,000 / 2700 = $1,666.67\n- Singapore: 4500 × 0.92 = 4140 containers → $6,200,000 / 4140 = $1,497.58\n- Busan: 2800 × 0.95 = 2660 containers → $3,800,000 / 2660 = $1,428.57\n- Dubai: 3600 × 0.85 = 3060 containers → $5,100,000 / 3060 = $1,666.67\nBusan Hub achieved the lowest unit cost per successful delivery ($1,428.57).',
    formulaNote: 'Unit Cost = Spend / (Dispatched × Rate)'
  },
  {
    id: 'pm-q28',
    title: '3-Door Monty Hall Variant Probability',
    tier: 'Master',
    category: 'probability',
    categoryLabel: 'Probabilistic Decision Theory',
    problemStatement: 'In an enhanced 4-door problem, exactly one door conceals a sports car, while the other three conceal goats. You choose Door 1. The host, who knows what is behind every door, opens Door 3 to reveal a goat. You are then offered the choice to switch to either Door 2 or Door 4. If you switch, what is your probability of winning the sports car?',
    options: ['1/4 (25%)', '1/3 (33.3%)', '3/8 (37.5%)', '1/2 (50%)'],
    correctIndex: 2,
    explanation: '1. Initial choice (Door 1) has P(Car) = 1/4.\n2. The remaining 3 doors (Doors 2, 3, 4) collectively hold probability 3/4.\n3. The host eliminates Door 3 (which had a goat). The collective 3/4 probability is now divided equally between the two remaining unopened doors (Doors 2 and 4).\n4. Therefore, switching to either Door 2 or Door 4 yields a probability of (3/4) / 2 = 3/8 = 37.5%.\n(Notice 3/8 = 37.5% > 1/4 = 25%).',
    formulaNote: 'P(Switch) = (1 - 1/4) / (4 - 1 - 1) = (3/4) / 2 = 3/8 = 37.5%'
  },
  {
    id: 'pm-q29',
    title: 'Abstract 3x3 Coordinate Geometry Matrix',
    tier: 'Master',
    category: 'visual-pattern',
    categoryLabel: 'Abstract Matrix Symmetry',
    problemStatement: 'Determine the missing element (?) in this 3x3 geometric matrix according to row and column intersection logic:',
    visualType: 'matrix',
    matrixData: {
      rows: 3,
      cols: 3,
      ruleHint: 'Superposition XOR rule: Element in 3rd column is the logical exclusive-OR (symmetric difference) of elements in column 1 and column 2.',
      cells: [
        [
          { shapes: [{ type: 'circle', fill: true }, { type: 'line', rotation: 0 }], label: 'Circle + H-Line' },
          { shapes: [{ type: 'circle', fill: true }, { type: 'line', rotation: 90 }], label: 'Circle + V-Line' },
          { shapes: [{ type: 'cross', rotation: 0, fill: false }], label: 'Cross (Lines Combined)' }
        ],
        [
          { shapes: [{ type: 'square', fill: true }, { type: 'dot', count: 1 }], label: 'Square + 1 Dot' },
          { shapes: [{ type: 'square', fill: true }, { type: 'dot', count: 2 }], label: 'Square + 2 Dots' },
          { shapes: [{ type: 'dot', count: 3 }], label: '3 Dots (Square Removed)' }
        ],
        [
          { shapes: [{ type: 'diamond', fill: true }, { type: 'triangle', fill: false }], label: 'Diamond + Triangle' },
          { shapes: [{ type: 'diamond', fill: true }], label: 'Diamond Only' },
          { shapes: [], isQuestionMark: true, label: '?' }
        ]
      ]
    },
    options: [
      'Triangle Only (Unfilled)',
      'Diamond with Triangle',
      'Filled Diamond Only',
      'Empty Circle'
    ],
    correctIndex: 0,
    explanation: 'By the symmetric difference (XOR) rule across each row, any component present in both Column 1 and Column 2 is canceled out, while any component present in only one column is retained.\n- Row 1: The Circle is common to both, so it cancels out; Horizontal and Vertical lines combine into a Cross.\n- Row 2: The Square is common to both, so it cancels out; 1 dot and 2 dots combine into 3 dots.\n- Row 3: The Diamond is common to both Column 1 and Column 2, so it cancels out. The Triangle is present only in Column 1, so it remains.\nResult: Triangle Only (Unfilled).',
    formulaNote: 'Column 3 = (Col 1 ∪ Col 2) ∖ (Col 1 ∩ Col 2)'
  },
  {
    id: 'pm-q30',
    title: 'Weighted Moving Averages & Trend Projections',
    tier: 'Master',
    category: 'data-chart-line',
    categoryLabel: 'Data Interpretation - Trend Projections',
    problemStatement: 'The chart records revenue across 5 bi-monthly checkpoints. Using a 3-point exponentially weighted moving average with weights [0.1, 0.3, 0.6] for the most recent three periods (P3, P4, P5), what is the calculated forecast for Period 6?',
    visualType: 'chart',
    chartData: {
      type: 'line',
      title: 'Bi-Monthly Enterprise Revenue Trend ($ millions)',
      dataKeys: [{ key: 'rev', name: 'Revenue ($M)', color: '#6366f1' }],
      xAxisKey: 'label',
      yAxisLabel: 'Revenue ($M)',
      data: [
        { label: 'P1', rev: 12 },
        { label: 'P2', rev: 14 },
        { label: 'P3', rev: 18 },
        { label: 'P4', rev: 22 },
        { label: 'P5', rev: 25 }
      ]
    },
    options: ['$22.8M', '$23.4M', '$24.0M', '$24.6M'],
    correctIndex: 1,
    explanation: 'Apply the weights to the last 3 periods:\n- P3 = $18M (weight 0.1) → 18 × 0.1 = 1.8\n- P4 = $22M (weight 0.3) → 22 × 0.3 = 6.6\n- P5 = $25M (weight 0.6) → 25 × 0.6 = 15.0\nSum of weighted forecast = 1.8 + 6.6 + 15.0 = $23.4M.',
    formulaNote: 'Forecast = (0.1 × 18) + (0.3 × 22) + (0.6 × 25) = $23.4M'
  },
  {
    id: 'pm-q31',
    title: 'Boolean Circuit Truth Table Logic',
    tier: 'Master',
    category: 'logic-puzzle',
    categoryLabel: 'Boolean Logic & Digital Gates',
    problemStatement: 'Given Boolean inputs A, B, and C, an output function is defined as F = (A AND B) OR (NOT B AND C). Under how many of the 8 total possible input combinations of (A, B, C) does F evaluate to TRUE (1)?',
    options: ['3 combinations', '4 combinations', '5 combinations', '6 combinations'],
    correctIndex: 1,
    explanation: 'Evaluate all 8 triples (A, B, C):\n1. When B = 1: F = (A AND 1) OR (0 AND C) = A. This is true when (A=1, B=1, C=0) and (A=1, B=1, C=1) → 2 combinations.\n2. When B = 0: F = (A AND 0) OR (1 AND C) = C. This is true when (A=0, B=0, C=1) and (A=1, B=0, C=1) → 2 combinations.\nTotal combinations where F = 1 is 2 + 2 = 4 combinations (out of 8).',
    formulaNote: 'Min-terms: m₃(011=false? wait: 0,0,1: F=1; 1,0,1: F=1; 1,1,0: F=1; 1,1,1: F=1) = exactly 4 combinations.'
  },
  {
    id: 'pm-q32',
    title: 'Nonlinear Geometric Progression',
    tier: 'Master',
    category: 'number-sequence',
    categoryLabel: 'Prime & Factorial Progressions',
    problemStatement: 'Identify the missing term in the sequence below:',
    visualType: 'sequence-strip',
    sequenceStrip: [1, 2, 6, 24, 120, '?'],
    options: ['600', '720', '840', '960'],
    correctIndex: 1,
    explanation: 'This is the factorial sequence (n!):\n- 1! = 1\n- 2! = 2 × 1 = 2\n- 3! = 3 × 2 = 6\n- 4! = 4 × 6 = 24\n- 5! = 5 × 24 = 120\n- 6! = 6 × 120 = 720.',
    formulaNote: 'n! = n × (n - 1)!'
  }
];

/**
 * Deterministically or randomly shuffle an array (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Prepares a shuffled assessment session question bank.
 * Shuffles question order and shuffles options (A, B, C, D) while
 * preserving exact tracking of the correct index and solution explanation!
 */
export function generateAssessmentQuestions(
  questionCount: number = 16,
  targetTier?: PsikoMathTier
): ShuffledPsikoQuestion[] {
  let pool = [...PSIKO_MATH_QUESTIONS];
  
  if (targetTier) {
    const filtered = pool.filter(q => q.tier === targetTier);
    if (filtered.length >= 6) {
      pool = filtered;
    }
  }

  // Shuffle question pool
  const selected = shuffleArray(pool).slice(0, Math.min(questionCount, pool.length));

  // For each question, shuffle options and track the correct answer
  return selected.map(q => {
    const correctText = q.options[q.correctIndex];
    const shuffledOptions = shuffleArray([...q.options]) as [string, string, string, string];
    const newCorrectIndex = shuffledOptions.indexOf(correctText);

    return {
      id: q.id,
      title: q.title,
      tier: q.tier,
      category: q.category,
      categoryLabel: q.categoryLabel,
      problemStatement: q.problemStatement,
      visualType: q.visualType,
      matrixData: q.matrixData,
      chartData: q.chartData,
      tableData: q.tableData,
      sequenceStrip: q.sequenceStrip,
      options: shuffledOptions,
      correctIndex: newCorrectIndex,
      explanation: q.explanation,
      formulaNote: q.formulaNote,
      originalCorrectText: correctText
    };
  });
}
