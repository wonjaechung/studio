
'use client';

import React, { useRef, useEffect } from 'react';
import type { SpreadsheetState, Cell } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SpreadsheetPanelProps {
  spreadsheetState: SpreadsheetState;
  setSpreadsheetState: (newState: Partial<SpreadsheetState>) => void;
  onCellChange: (col: number, row: number, value: string) => void;
  onHeaderChange: (col: number, value: string) => void;
}

export default function SpreadsheetPanel({
  spreadsheetState,
  setSpreadsheetState,
  onCellChange,
  onHeaderChange,
}: SpreadsheetPanelProps) {
  const {
    columns,
    activeCell,
    isEditing,
    editValue,
    isSelecting,
    selectionStart,
    selectionEnd,
  } = spreadsheetState;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      setSpreadsheetState({ isSelecting: false });
    };

    const container = containerRef.current;
    if (container) {
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setSpreadsheetState]);

  const handleMouseDown = (e: React.MouseEvent<HTMLTableCellElement>) => {
    const { col, row } = getCellFromEvent(e);
    if (col === null || row === null) return;
    setSpreadsheetState({
      isEditing: false,
      activeCell: { col, row },
      isSelecting: true,
      selectionStart: { col, row },
      selectionEnd: { col, row },
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLTableCellElement>) => {
    if (!isSelecting) return;
    const { col, row } = getCellFromEvent(e);
    if (col === null || row === null) return;

    if (selectionEnd?.col !== col || selectionEnd?.row !== row) {
      setSpreadsheetState({ selectionEnd: { col, row } });
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLTableCellElement>) => {
    const { col, row } = getCellFromEvent(e);
    if (col === null || row === null) return;
    
    const value = row === -1 
      ? columns[col]?.name || '' 
      : columns[col]?.data[row] || '';
      
    setSpreadsheetState({
      isEditing: true,
      editValue: value,
      activeCell: { col, row },
    });
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      finishEditing((e.target as HTMLInputElement).value, true);
    } else if (e.key === 'Escape') {
      setSpreadsheetState({ isEditing: false, editValue: '' });
    }
  };
  
  const finishEditing = (value: string, fromEnter = false) => {
    if (!isEditing) return;
    const { col, row } = activeCell;
    
    if (row === -1) {
      onHeaderChange(col, value);
    } else {
      onCellChange(col, value);
    }

    const nextActiveCell = fromEnter ? { col, row: row + 1 } : activeCell;
    
    setSpreadsheetState({
      isEditing: false,
      editValue: '',
      activeCell: nextActiveCell,
    });
  };

  const getCellFromEvent = (e: React.MouseEvent<HTMLTableCellElement>): Cell | { col: null; row: null } => {
    const target = e.target as HTMLTableCellElement;
    const colStr = target.dataset.col;
    const rowStr = target.dataset.row;
    if (colStr && rowStr) {
      return { col: parseInt(colStr, 10), row: parseInt(rowStr, 10) };
    }
    return { col: null, row: null };
  };

  const isInSelection = (c: number, r: number) => {
    if (!selectionStart || !selectionEnd) return false;
    const minCol = Math.min(selectionStart.col, selectionEnd.col);
    const maxCol = Math.max(selectionStart.col, selectionEnd.col);
    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);
    return c >= minCol && c <= maxCol && r >= minRow && r <= maxRow;
  };
  
  const numRows = 200;

  return (
    <div ref={containerRef} className="panel-content" id="spreadsheet-content">
      <div className="spreadsheet-container">
        <table className="spreadsheet-table">
          <thead>
            <tr>
              <th data-col={-1} data-row={-1}></th>
              {columns.map((col, c) => (
                <th
                  key={c}
                  data-col={c}
                  data-row={-1}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onDoubleClick={handleDoubleClick}
                  className={cn(
                    'col-header',
                    { 'selected': activeCell.col === c && activeCell.row === -1 },
                    { 'in-selection': isInSelection(c, -1) }
                  )}
                >
                  {isEditing && activeCell.col === c && activeCell.row === -1 ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setSpreadsheetState({ editValue: e.target.value })}
                      onBlur={(e) => finishEditing(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      autoFocus
                    />
                  ) : (
                    col.name
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numRows }).map((_, r) => (
              <tr key={r}>
                <td className="row-header" data-col={-1} data-row={r}>{r + 1}</td>
                {columns.map((col, c) => (
                  <td
                    key={`${c}-${r}`}
                    data-col={c}
                    data-row={r}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onDoubleClick={handleDoubleClick}
                    className={cn(
                        { 'selected': activeCell.col === c && activeCell.row === r },
                        { 'in-selection': isInSelection(c, r) }
                    )}
                  >
                    {isEditing && activeCell.col === c && activeCell.row === r ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setSpreadsheetState({ editValue: e.target.value })}
                        onBlur={(e) => finishEditing(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        autoFocus
                      />
                    ) : (
                      col.data[r]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
