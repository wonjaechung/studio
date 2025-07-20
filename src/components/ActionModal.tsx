"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { ModalConfig, SpreadsheetColumn } from '@/lib/types';

interface ActionModalProps {
  modalConfig: ModalConfig;
  columns: SpreadsheetColumn[];
  onClose: () => void;
  onAction: (action: string, data: Record<string, string>) => void;
}

export function ActionModal({ modalConfig, columns, onClose, onAction }: ActionModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initialData: Record<string, string> = {};
    modalConfig.fields.forEach(field => {
      if (field.id) {
        initialData[field.id] = field.value || (field.type === 'select' ? (field.options || columns.map(c => c.name))[0] : '');
      }
    });
    return initialData;
  });

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{modalConfig.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {modalConfig.fields.map((field, index) => (
            <div key={field.id || index} className="grid grid-cols-4 items-center gap-4">
              {field.type !== 'static' && <Label htmlFor={field.id} className="text-right">{field.label}</Label>}
              
              {field.type === 'select' && field.id && (
                <Select value={formData[field.id]} onValueChange={(value) => handleInputChange(field.id!, value)}>
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

              {field.type === 'text' && field.id && (
                <Input
                  id={field.id}
                  value={formData[field.id]}
                  onChange={(e) => handleInputChange(field.id!, e.target.value)}
                  className="col-span-3"
                />
              )}

              {field.type === 'static' && (
                <p className="col-span-4">{field.label}</p>
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
