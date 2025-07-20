"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { SpreadsheetState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

interface SpreadsheetPanelProps {
  state: SpreadsheetState;
  setState: (update: Partial<SpreadsheetState>) => void;
  onMenuClick: () => void;
  onClearClick: () => void;
}

const ExportToggle = () => (
    <div className="flex items-center space-x-2">
      <Switch id="export-sheet-toggle" />
      <Label htmlFor="export-sheet-toggle" className="text-xs text-muted-foreground">Export</Label>
    </div>
);

export function SpreadsheetPanel({ state, setState, onMenuClick, onClearClick }: SpreadsheetPanelProps) {
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
    if (col === -1) return;
    
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
    if (col === -1) return;

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
    if (col === -1) return;
    
    const value = row === -1 
        ? (columns[col]?.name || '') 
        : (columns[col]?.data[row] || '');

    setState({
        isEditing: true,
        editValue: String(value),
        activeCell: { col, row }
    });
  };

  const finishEditing = (value: string) => {
    setState({isEditing: false});
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
        if(columns[i]?.name) colIndices.push(i);
    }
    
    if (colIndices.length > 2 || colIndices.length === 0) {
        e.preventDefault();
        return;
    }
    
    e.dataTransfer.setData('application/json', JSON.stringify(colIndices));
    e.dataTransfer.effectAllowed = 'copy';
    e.currentTarget.classList.add('opacity-50', 'bg-primary');
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Lists & Spreadsheet</CardTitle>
        <div className="flex items-center gap-4">
          <ExportToggle />
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
                  <th className="sticky left-0 z-20 bg-card p-2 border-r border-b w-12 min-w-12"></th>
                  {Array.from({ length: numCols }).map((_, c) => {
                      const col = columns[c];
                      const colName = col ? (col.formula ? `=${col.formula}` : col.name) : String.fromCharCode(65 + c);
                      const inSelection = selectionStart && selectionEnd && c >= Math.min(selectionStart.col, selectionEnd.col) && c <= Math.max(selectionStart.col, selectionEnd.col);
                      return (
                          <th key={c} data-col={c} data-row={-1}
                              className={cn("p-2 border-b border-r text-center font-semibold cursor-pointer select-none", inSelection && "bg-primary/50", activeCell.col === c && "bg-primary/70")}
                              draggable={inSelection && !!columns[c]?.name}
                              onDragStart={handleDragStart}
                              onDragEnd={(e) => e.currentTarget.classList.remove('opacity-50', 'bg-primary')}
                              onMouseDown={handleMouseDown}
                              onDoubleClick={handleDoubleClick}
                          >{colName}</th>
                      )
                  })}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: numRows }).map((_, r) => (
                  <tr key={r}>
                    <td className="sticky left-0 bg-card p-2 border-r border-b text-center text-muted-foreground select-none w-12 min-w-12">{r + 1}</td>
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
                            onMouseMove={handleMouseMove}
                            onDoubleClick={handleDoubleClick}
                        >
                          {isEditing && isSelected ? (
                            <input
                              ref={editInputRef}
                              type="text"
                              defaultValue={editValue}
                              onBlur={(e) => finishEditing(e.target.value)}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter') finishEditing(e.currentTarget.value);
                                  if (e.key === 'Escape') setState({isEditing: false});
                              }}
                              className="w-full h-full bg-transparent text-right outline-none p-0 m-0 border-0"
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
