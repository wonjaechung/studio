"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { ModalConfig, SpreadsheetColumn } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';

interface ActionModalProps {
  modalConfig: ModalConfig;
  columns: SpreadsheetColumn[];
  onClose: () => void;
  onAction: (action: string, data: Record<string, string | string[]>) => void;
}

export function ActionModal({ modalConfig, columns, onClose, onAction }: ActionModalProps) {
  const [formData, setFormData] = useState<Record<string, string | string[]>>(() => {
    const initialData: Record<string, string | string[]> = {};
    modalConfig.fields.forEach(field => {
      if (field.id) {
        if (field.type === 'select_multi') {
          initialData[field.id] = [];
        } else {
           initialData[field.id] = field.value || (field.type === 'select' ? (field.options || columns.map(c => c.name))[0] : '');
        }
      }
    });
    return initialData;
  });

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleMultiSelectChange = (id: string, value: string, checked: boolean) => {
    setFormData(prev => {
        const currentSelection = (prev[id] as string[] || []);
        if (checked) {
            return { ...prev, [id]: [...currentSelection, value] };
        } else {
            return { ...prev, [id]: currentSelection.filter(item => item !== value) };
        }
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{modalConfig.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {modalConfig.fields.map((field, index) => (
            <div key={field.id || index} className="grid grid-cols-4 items-start gap-4">
              {(field.type !== 'static' && field.type !== 'select_multi') && <Label htmlFor={field.id} className="text-right pt-2">{field.label}</Label>}
              
              {field.type === 'select' && field.id && (
                <Select value={formData[field.id] as string} onValueChange={(value) => handleInputChange(field.id!, value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={`Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options || columns.map(c => c.name)).map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === 'select_multi' && field.id && (
                <div className="col-span-4">
                    <Label className="text-sm font-medium">{field.label}</Label>
                    <ScrollArea className="h-32 w-full rounded-md border mt-2">
                        <div className="p-4 space-y-2">
                            {columns.map(c => (
                                <div key={c.name} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${field.id}-${c.name}`}
                                        checked={(formData[field.id!] as string[]).includes(c.name)}
                                        onCheckedChange={(checked) => handleMultiSelectChange(field.id!, c.name, !!checked)}
                                    />
                                    <Label htmlFor={`${field.id}-${c.name}`} className="font-normal">{c.name}</Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
              )}

              {field.type === 'text' && field.id && (
                <Input
                  id={field.id}
                  value={formData[field.id] as string}
                  onChange={(e) => handleInputChange(field.id!, e.target.value)}
                  className="col-span-3"
                />
              )}

              {field.type === 'static' && (
                <p className="col-span-4 text-sm text-muted-foreground">{field.label}</p>
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          {modalConfig.buttons.map(btn => (
            <Button
              key={btn.action}
              variant={btn.action === 'closeModal' || btn.action === 'cancel' ? 'outline' : 'default'}
              onClick={() => onAction(btn.action, formData)}
            >
              {btn.label}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
