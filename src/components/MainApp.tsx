
'use client';

import React, { useState, useCallback } from 'react';
import type { SpreadsheetState, Cell } from '@/lib/types';
import ImporterPanel from './ImporterPanel';
import CalculatorPanel from './CalculatorPanel';
import GraphingPanel from './GraphingPanel';
import SpreadsheetPanel from './SpreadsheetPanel';

const initialColumns = Array.from({ length: 10 }, (_, i) => ({
  name: String.fromCharCode(65 + i),
  data: Array(200).fill(''),
}));

export default function MainApp() {
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetState>({
    columns: initialColumns,
    activeCell: { col: 0, row: 0 },
    isEditing: false,
    editValue: '',
    isSelecting: false,
    selectionStart: null,
    selectionEnd: null,
  });

  const updateSpreadsheetState = (newState: Partial<SpreadsheetState>) => {
    setSpreadsheet((prev) => ({ ...prev, ...newState }));
  };
  
  const handleCellChange = (col: number, row: number, value: string) => {
    setSpreadsheet(prev => {
        const newColumns = [...prev.columns];
        if (!newColumns[col]) {
            // This should not happen if columns are pre-initialized, but as a safeguard
            newColumns[col] = { name: String.fromCharCode(65 + col), data: Array(200).fill('') };
        }
        
        const newData = [...newColumns[col].data];
        newData[row] = value;
        newColumns[col] = { ...newColumns[col], data: newData };
        
        return { ...prev, columns: newColumns };
    });
  };

  const handleHeaderChange = (col: number, value: string) => {
    setSpreadsheet(prev => {
      const newColumns = [...prev.columns];
      if (newColumns[col]) {
        newColumns[col] = { ...newColumns[col], name: value };
      }
      return { ...prev, columns: newColumns };
    });
  };

  return (
    <main className="main-grid">
      <div id="importer" className="panel">
        <ImporterPanel />
      </div>

      <div id="calculator" className="panel">
        <CalculatorPanel />
      </div>

      <div id="graphing" className="panel">
        <GraphingPanel />
      </div>

      <div id="spreadsheet" className="panel">
        <SpreadsheetPanel
          spreadsheetState={spreadsheet}
          setSpreadsheetState={updateSpreadsheetState}
          onCellChange={handleCellChange}
          onHeaderChange={handleHeaderChange}
        />
      </div>
    </main>
  );
}
