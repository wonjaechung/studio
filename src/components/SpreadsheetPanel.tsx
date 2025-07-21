
'use client';

import React, { useRef, useEffect } from 'react';
import type { SpreadsheetState, Cell } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const getCellFromEvent = (e: React.MouseEvent): Cell | { col: null; row: null } => {
    const target = e.target as HTMLElement;
    const cell = target.closest('[data-col][data-row]');
    if (cell) {
      const colStr = cell.getAttribute('data-col');
      const rowStr = cell.getAttribute('data-row');
      if (colStr && rowStr) {
        return { col: parseInt(colStr, 10), row: parseInt(rowStr, 10) };
      }
    }
    return { col: null, row: null };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting) return;
    const { col, row } = getCellFromEvent(e);
    if (col === null || row === null) return;

    if (selectionEnd?.col !== col || selectionEnd?.row !== row) {
      setSpreadsheetState({ selectionEnd: { col, row } });
    }
  };

  const handleMouseUp = () => {
    setSpreadsheetState({ isSelecting: false });
  };
  
  useEffect(() => {
    const mainContainer = mainContainerRef.current;
    if (mainContainer) {
        mainContainer.addEventListener('mouseup', handleMouseUp);
        return () => {
          mainContainer.removeEventListener('mouseup', handleMouseUp);
        };
    }
  }, []);

  const finishEditing = (value: string, fromEnter = false) => {
    if (!isEditing) return;
    const { col, row } = activeCell;
    
    if (row === -1) {
      onHeaderChange(col, value);
    } else {
      onCellChange(col, row, value);
    }
    const nextActiveCell = fromEnter && row + 1 < 200 ? { col, row: row + 1 } : activeCell;
    
    setSpreadsheetState({
      isEditing: false,
      editValue: '',
      activeCell: nextActiveCell,
    });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const { col, row } = getCellFromEvent(e);
    if (col === null || row === null) return;
    
    const value = row === -1 
      ? columns[col]?.name || '' 
      : String(columns[col]?.data[row] || '');
      
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

  const handleDragStart = (e: React.DragEvent<HTMLTableCellElement>) => {
      const { col, row } = getCellFromEvent(e as any);
      if (col === null || row !== -1 || !selectionStart || !selectionEnd) {
          e.preventDefault();
          return;
      }

      const minCol = Math.min(selectionStart.col, selectionEnd.col);
      const maxCol = Math.max(selectionStart.col, selectionEnd.col);
      const indices = [];
      for(let i = minCol; i <= maxCol; i++) {
          if (columns[i]?.name) { // Only allow dragging named columns
              indices.push(i);
          }
      }

      if (indices.length > 0 && indices.length <= 2) {
          e.dataTransfer.setData('application/json', JSON.stringify(indices));
          e.dataTransfer.effectAllowed = 'copy';
      } else {
          e.preventDefault();
      }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text/plain');
    const rows = pastedText.split(/\r?\n/).filter(row => row.trim() !== '');
    const data = rows.map(row => row.split('\t'));

    const { col: startCol, row: startRow } = activeCell;

    data.forEach((rowData, r) => {
        rowData.forEach((cellData, c) => {
            const targetRow = startRow + r;
            const targetCol = startCol + c;
            if (targetRow < 200 && targetCol < columns.length) {
                onCellChange(targetCol, targetRow, cellData);
            }
        });
    });
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
    <ScrollArea 
        className="h-full w-full" 
        onMouseDown={handleMouseDown} 
        onMouseMove={handleMouseMove}
        onPaste={handlePaste}
        ref={mainContainerRef}
    >
        <div className="relative">
            <table className="w-full border-collapse text-sm font-mono">
            <thead>
                <tr>
                <th className="sticky top-0 left-0 z-20 bg-card border border-border w-12 text-center select-none"></th>
                {columns.map((col, c) => (
                    <th
                    key={c}
                    data-col={c}
                    data-row={-1}
                    onDoubleClick={handleDoubleClick}
                    onDragStart={handleDragStart}
                    draggable={isInSelection(c, -1) && columns[c]?.name?.length > 0}
                    className={cn(
                        'sticky top-0 z-10 bg-card border border-border p-1 text-center font-semibold select-none min-w-[100px] h-8',
                        { 'bg-primary/20 ring-2 ring-primary': isInSelection(c, -1) },
                        { 'cursor-grab': isInSelection(c, -1) && columns[c]?.name?.length > 0 }
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
                        className="w-full bg-background outline-none text-center"
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
                    <td className="sticky left-0 z-10 bg-card border border-border w-12 text-center select-none text-muted-foreground">{r + 1}</td>
                    {columns.map((col, c) => (
                    <td
                        key={`${c}-${r}`}
                        data-col={c}
                        data-row={r}
                        onDoubleClick={handleDoubleClick}
                        className={cn(
                            'border border-border p-1 text-right min-w-[100px] h-8',
                            { 'bg-primary/20 ring-1 ring-inset ring-primary': isInSelection(c, r) },
                            { 'ring-2 ring-primary': activeCell.col === c && activeCell.row === r}
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
                            className="w-full bg-background outline-none text-right"
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
    </ScrollArea>
  );
}
