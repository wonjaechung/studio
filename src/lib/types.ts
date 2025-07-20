export interface SpreadsheetColumn {
  name: string;
  data: (string | number)[];
  formula?: string;
}

export interface SpreadsheetState {
  columns: SpreadsheetColumn[];
  activeCell: { col: number; row: number };
  isEditing: boolean;
  editValue: string;
  selectionStart: { col: number; row: number } | null;
  selectionEnd: { col: number; row: number } | null;
  isSelecting: boolean;
  isDataLoaded: boolean;
}

export interface CalculatorEntry {
  id?: string;
  input: string;
  output: string;
  explanation?: string;
  type?: string;
  data?: any;
}

export interface CalculatorState {
  history: CalculatorEntry[];
}

export type PlotView = 
  | { type: 'default' }
  | { type: 'plot', data: any[]; layout: object }
  | { type: 'dataframe' }
  | { type: 'context-menu', colIndices: number[] };


export interface GraphingState {
  currentView: PlotView;
  functionInput: string;
  pendingPlot: { indices: number[] } | null;
}

export interface GameState {
    isActive: boolean;
    question: import('@/ai/flows/generate-game-question').GameQuestion | null;
    timeLeft: number;
}

export interface ModalField {
  id?: string;
  label: string;
  type?: 'text' | 'select' | 'static';
  options?: string[];
  value?: string;
}

export interface ModalButton {
  label: string;
  action: string;
  variant?: 'default' | 'primary' | 'destructive';
}

export interface ModalConfig {
  id: string;
  title: string;
  fields: ModalField[];
  buttons: ModalButton[];
}


export interface AppState {
  spreadsheet: SpreadsheetState;
  calculator: CalculatorState;
  graphing: GraphingState;
  modal: ModalConfig | null;
  isStatsMenuOpen: boolean;
  game: GameState;
}
