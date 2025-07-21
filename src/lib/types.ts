

export type Cell = {
  col: number;
  row: number;
};

export type Column = {
  name: string;
  data: (string | number)[];
  formula?: string;
};

export type SpreadsheetState = {
  columns: Column[];
  activeCell: Cell;
  isEditing: boolean;
  editValue: string;
  isSelecting: boolean;
  selectionStart: Cell | null;
  selectionEnd: Cell | null;
};

export type CalculatorEntry = {
  input: string;
  output: string;
  type?: string;
  data?: any;
  explanation?: string;
};

export type CalculatorState = {
  history: CalculatorEntry[];
};

export type GameState = {
  isActive: boolean;
  startTime: number | null;
  question: Question | null;
  questionsAnswered: number;
  correctAnswers: number;
};

export type GraphingState = {
  plotType: 'function' | 'histogram' | 'boxplot' | 'scatter' | 'default';
  plotData: any;
  plotLayout: any;
  isDragging: boolean;
  pendingPlot: { indices: number[] } | null;
};

export type AppState = {
  spreadsheet: SpreadsheetState;
  calculator: CalculatorState;
  game: GameState;
  graphing: GraphingState;
  modal: ModalConfig | null;
  activePanel: string | null;
  exportState: {
    calculator: boolean;
    graphing: boolean;
    spreadsheet: boolean;
  };
  isDataLoaded: boolean;
};

export type ModalConfig = {
    id: string;
    title: string;
    requiresData?: boolean;
    fields: {
        id: string;
        label: string;
        type: 'select' | 'text' | 'static' | 'number';
        options?: string[];
        value?: string | number;
    }[];
    buttons: {
        label: string;
        action: 'confirm' | 'cancel';
        variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    }[];
    onConfirm: (formData: any) => void;
};

export type Question = {
  id: string;
  year: number;
  questionNumber: number;
  questionText: string;
  chartType?: 'Histogram' | 'BoxPlot' | 'ScatterPlot' | 'StemPlot' | 'SegmentedBarChart';
  chartData?: any;
  answerOptions: { text: string; isCorrect: boolean }[];
  explanation: any; // Can be more specific if needed
  tags: string[];
  difficulty: string;
};
