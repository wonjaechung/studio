
export type Cell = {
  col: number;
  row: number;
};

export type Column = {
  name: string;
  data: string[];
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
