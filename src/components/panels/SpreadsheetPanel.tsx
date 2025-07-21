
"use client";

import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { SpreadsheetState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

interface SpreadsheetPanelProps {
  state: SpreadsheetState;
  setState: (update: Partial<SpreadsheetState> | ((prevState: SpreadsheetState) => Partial<SpreadsheetState>)) => void;
  onMenuClick: () => void;
  onClearClick: () => void;
  showMessageModal: (message: string) => void;
}

const ExportToggle = ({ onDragStart, disabled }: { onDragStart: (e: React.DragEvent) => void, disabled: boolean }) => {
    const [checked, setChecked] = React.useState(false);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2" draggable={checked && !disabled} onDragStart={onDragStart}>
                        <Switch id="export-sheet-toggle" checked={checked} onCheckedChange={setChecked} disabled={disabled} />
                        <Label htmlFor="export-sheet-toggle" className="text-xs text-muted-foreground" style={{cursor: (checked && !disabled) ? 'grab' : 'default'}}>Export</Label>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Drag to export spreadsheet data as TSV (tab-separated values).</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export function SpreadsheetPanel({ state, setState, onMenuClick, onClearClick, showMessageModal }: SpreadsheetPanelProps) {
  const { columns, activeCell, isEditing, editValue, selectionStart, selectionEnd } = state;
  const numCols = Math.max(columns.length + 5, 26);
  const numRows = 200;
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);
  
  const handleMouseDown = (e: React.MouseEvent<HTMLTableCellElement>) => {
    const col = parseInt(e.currentTarget.dataset.col || '-1');
    const row = parseInt(e.currentTarget.dataset.row || '-1');
    if (col === -1 && row === -1) return; // Ignore top-left corner
    
    setState({
        isEditing: false,
        activeCell: { col, row },
        isSelecting: true,
        selectionStart: { col, row },
        selectionEnd: { col, row },
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLTableCellElement>) => {
    if (!state.isSelecting) return;
    const col = parseInt(e.currentTarget.dataset.col || '-1');
    const row = parseInt(e.currentTarget.dataset.row || '-1');
    if (col === -1 && row === -1) return;

    if (state.selectionEnd?.col !== col || state.selectionEnd?.row !== row) {
        setState({ selectionEnd: { col, row } });
    }
  };

  const handleMouseUp = () => {
    setState({ isSelecting: false });
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLTableCellElement>) => {
    const col = parseInt(e.currentTarget.dataset.col || '-1');
    const row = parseInt(e.currentTarget.dataset.row || '-1');
    if ((col === -1 && row === -1)) return;
    
    const value = row === -1 
        ? (columns[col]?.name || '') 
        : (columns[col]?.data[row] || '');

    setState({
        isEditing: true,
        editValue: String(value),
        activeCell: { col, row }
    });
  };

  const finishEditing = (value: string, moveNext = false) => {
    setState(prevState => {
      const { activeCell } = prevState;
      const { col, row } = activeCell;
      const newColumns = [...prevState.columns];
      
      while (col >= newColumns.length) {
        newColumns.push({ name: String.fromCharCode(65 + newColumns.length), data: [] });
      }

      if (row === -1) { // Editing header
        newColumns[col] = { ...newColumns[col], name: value };
      } else { // Editing cell
        const numValue = parseFloat(value);
        newColumns[col].data[row] = isNaN(numValue) ? value : numValue;
      }
      
      const nextActiveCell = moveNext ? { col, row: row + 1 } : activeCell;

      return { ...prevState, isEditing: false, columns: newColumns, activeCell: nextActiveCell };
    });
  }

  const handleDragStart = (e: React.DragEvent<HTMLTableCellElement>) => {
    if (!e.currentTarget.classList.contains('in-selection')) {
        e.preventDefault();
        return;
    }
    const { selectionStart, selectionEnd } = state;
    if (!selectionStart || !selectionEnd) return;

    const minCol = Math.min(selectionStart.col, selectionEnd.col);
    const maxCol = Math.max(selectionStart.col, selectionEnd.col);
    
    let colIndices: number[] = [];
    for (let i = minCol; i <= maxCol; i++) {
        if(columns[i]?.name) {
          colIndices.push(i);
        }
    }
    
    if (colIndices.length === 0) {
        showMessageModal("Please select named columns to drag.");
        e.preventDefault();
        return;
    }

    if (colIndices.length > 2) {
        showMessageModal("You can only drag up to two columns at a time.");
        e.preventDefault();
        return;
    }
    
    e.dataTransfer.setData('application/json', JSON.stringify(colIndices));
    e.dataTransfer.effectAllowed = 'copy';
    e.currentTarget.classList.add('opacity-50', 'bg-primary');
  };

  const handleExportDrag = (e: React.DragEvent) => {
    const namedCols = columns.filter(c => c.name && !c.formula);
    if (namedCols.length === 0) {
        e.preventDefault();
        return;
    }
    
    const header = namedCols.map(c => c.name).join('\t');
    const numRows = Math.max(0, ...namedCols.map(c => c.data.length));
    const rows = Array.from({length: numRows}, (_, i) => 
        namedCols.map(c => c.data[i] ?? '').join('\t')
    );

    const tsv = [header, ...rows].join('\n');
    e.dataTransfer.setData('text/plain', tsv);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between py-3">
        <CardTitle className="text-base">Lists & Spreadsheet</CardTitle>
        <div className="flex items-center gap-4">
          <ExportToggle onDragStart={handleExportDrag} disabled={!columns.some(c => c.name)} />
          <div>
            <Button variant="outline" size="sm" onClick={onMenuClick}>Menu</Button>
            <Button variant="outline" size="sm" className="ml-2" onClick={onClearClick}>Clear Sheet</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow min-h-0 p-0">
        <ScrollArea className="w-full h-full" onMouseUp={handleMouseUp}>
            <table className="w-full border-collapse text-sm font-code">
              <thead className="sticky top-0 z-10 bg-card">
                <tr>
                  <th className="sticky left-0 z-20 bg-card p-2 border-r border-b w-12 min-w-12" data-col={-1} data-row={-1}></th>
                  {Array.from({ length: numCols }).map((_, c) => {
                      const col = columns[c];
                      const colName = col ? (col.formula ? `=${col.formula}` : col.name) : String.fromCharCode(65 + c);
                      const inSelection = selectionStart && selectionEnd && c >= Math.min(selectionStart.col, selectionEnd.col) && c <= Math.max(selectionStart.col, selectionEnd.col);
                      return (
                          <th key={c} data-col={c} data-row={-1}
                              className={cn("p-2 border-b border-r text-center font-semibold cursor-pointer select-none", inSelection && "bg-primary/50", activeCell.col === c && activeCell.row === -1 && "bg-primary/70", "col-header")}
                              draggable={inSelection && !!columns[c]?.name}
                              onDragStart={handleDragStart}
                              onDragEnd={(e) => e.currentTarget.classList.remove('opacity-50', 'bg-primary')}
                              onMouseDown={handleMouseDown}
                              onDoubleClick={handleDoubleClick}
                          >{colName || String.fromCharCode(65 + c)}</th>
                      )
                  })}
                </tr>
              </thead>
              <tbody onMouseMove={(e) => e.target instanceof HTMLTableCellElement && handleMouseMove(e)}>
                {Array.from({ length: numRows }).map((_, r) => (
                  <tr key={r}>
                    <td className="sticky left-0 bg-card p-2 border-r border-b text-center text-muted-foreground select-none w-12 min-w-12" data-col={-1} data-row={r}>{r + 1}</td>
                    {Array.from({ length: numCols }).map((_, c) => {
                      const cellValue = columns[c]?.data[r] ?? '';
                      let inSelection = false;
                      if (selectionStart && selectionEnd) {
                          const minCol = Math.min(selectionStart.col, selectionEnd.col);
                          const maxCol = Math.max(selectionStart.col, selectionEnd.col);
                          const minRow = Math.min(selectionStart.row, selectionEnd.row);
                          const maxRow = Math.max(selectionStart.row, selectionEnd.row);
                          if (c >= minCol && c <= maxCol && r >= minRow && r <= maxRow) {
                              inSelection = true;
                          }
                      }
                      const isSelected = activeCell.col === c && activeCell.row === r;
                      
                      return (
                        <td key={c} data-col={c} data-row={r}
                            className={cn("p-2 border-r border-b min-w-[80px] text-right whitespace-nowrap", 
                                inSelection && "bg-primary/20",
                                isSelected && "outline outline-2 outline-primary -outline-offset-1"
                            )}
                            onMouseDown={handleMouseDown}
                            onDoubleClick={handleDoubleClick}
                        >
                          {isEditing && isSelected ? (
                            <input
                              ref={editInputRef}
                              type="text"
                              defaultValue={editValue}
                              onBlur={(e) => finishEditing(e.target.value)}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter') finishEditing(e.currentTarget.value, true);
                                  if (e.key === 'Escape') setState({isEditing: false});
                              }}
                              className="w-full h-full bg-input text-right outline-none p-0 m-0 border-0"
                            />
                          ) : (
                            cellValue
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
