
'use client';

import React, { useState, useEffect } from 'react';
import type { ModalConfig, AppState } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface ModalProps {
  config: ModalConfig;
  appState: AppState;
  onClose: () => void;
}

export default function Modal({ config, appState, onClose }: ModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const colNames = appState.spreadsheet.columns.map(c => c.name).filter(Boolean);

  useEffect(() => {
    const initialData: Record<string, any> = {};
    config.fields.forEach(field => {
      initialData[field.id] = field.value ?? (field.type === 'select' ? colNames[0] : '');
    });
    setFormData(initialData);
  }, [config, colNames]);

  const handleInputChange = (id: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleConfirm = () => {
    config.onConfirm(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {config.fields.map(field => (
            <div key={field.id} className="grid grid-cols-4 items-center gap-4 mb-4">
              <Label htmlFor={field.id} className="text-right">
                {field.label}
              </Label>
              {field.type === 'static' ? (
                <p className="col-span-3">{field.value}</p>
              ) : field.type === 'select' ? (
                <Select
                  value={formData[field.id]}
                  onValueChange={(value) => handleInputChange(field.id, value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={`Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options || colNames).map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.id}
                  type={field.type}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="col-span-3"
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          {config.buttons.map(button => (
             <Button
                key={button.label}
                variant={button.variant || 'default'}
                onClick={button.action === 'confirm' ? handleConfirm : onClose}
             >
                {button.label}
             </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
