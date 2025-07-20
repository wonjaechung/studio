"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ModalConfig } from '@/lib/types';

interface StatisticsMenuProps {
  onClose: () => void;
  onMenuAction: (config: ModalConfig) => void;
  hasData: boolean;
  showMessageModal: (message: string) => void;
}

const menuItems = [
    { label: 'One-Variable Stats', actionId: '1VarStats', requiresData: true },
    { label: 'LinReg (a+bx)', actionId: 'linReg', requiresData: true },
    { label: 't Interval', actionId: 'tInterval', requiresData: true },
    { label: 't Test', actionId: 'tTest', requiresData: false },
    { label: '2-Prop Z-Int', actionId: '2PropZInt', requiresData: false },
    { label: '2-Prop Z-Test', actionId: '2PropZTest', requiresData: false },
    { label: 'χ² GOF-Test', actionId: 'chi2GOF', requiresData: true },
    { label: 'χ²-Test', actionId: 'chi2Test', requiresData: true },
    { label: 'Normal Cdf', actionId: 'normalCdf', requiresData: false },
    { label: 'Inverse Normal', actionId: 'invNorm', requiresData: false },
    { label: 'Binomial Pdf', actionId: 'binomPdf', requiresData: false },
    { label: 'Binomial Cdf', actionId: 'binomCdf', requiresData: false },
    { label: 'Geometric Pdf', actionId: 'geomPdf', requiresData: false },
    { label: 'Geometric Cdf', actionId: 'geomCdf', requiresData: false }
];

const modalConfigs: Record<string, ModalConfig> = {
    '1VarStats': { id: '1VarStats', title: 'One-Variable Statistics', fields: [{ id: 'x1list', label: 'X1 List', type: 'select' }], buttons: [{ label: 'OK', action: 'run1VarStats' }, { label: 'Cancel', action: 'closeModal' }] },
    'tInterval': { id: 'tInterval', title: 't Interval (Data)', fields: [{ id: 'list', label: 'List', type: 'select' }, { id: 'clevel', label: 'C Level', value: '0.95', type: 'text' }], buttons: [{ label: 'OK', action: 'runTIntervalFromData' }, { label: 'Cancel', action: 'closeModal' }] },
    'tTest': { id: 'tTest', title: 't Test (Stats)', fields: [{ id: 'mu0', label: 'μ₀', type: 'text' }, { id: 'mean', label: 'x̄', type: 'text' }, { id: 'sx', label: 'Sx', type: 'text' }, { id: 'n', label: 'n', type: 'text' }, { id: 'alt', label: 'Alternate Hyp', type: 'select', options: ['μ ≠ μ₀', 'μ < μ₀', 'μ > μ₀'] }], buttons: [{ label: 'OK', action: 'runTTest' }, { label: 'Cancel', action: 'closeModal' }] },
    'linReg': { id: 'linReg', title: 'Linear Regression (a+bx)', fields: [{ id: 'xlist', label: 'X List', type: 'select' }, { id: 'ylist', label: 'Y List', type: 'select' }], buttons: [{ label: 'OK', action: 'runLinReg' }, { label: 'Cancel', action: 'closeModal' }] },
    '2PropZInt': { id: '2PropZInt', title: '2-Proportion Z-Interval', fields: [{ id: 'x1', label: 'x1', type: 'text' }, { id: 'n1', label: 'n1', type: 'text' }, { id: 'x2', label: 'x2', type: 'text' }, { id: 'n2', label: 'n2', type: 'text' }, { id: 'clevel', label: 'C-Level', value: '0.95', type: 'text' }], buttons: [{ label: 'OK', action: 'run2PropZInt' }, { label: 'Cancel', action: 'closeModal' }] },
    '2PropZTest': { id: '2PropZTest', title: '2-Proportion Z-Test', fields: [{ id: 'x1', label: 'x1', type: 'text' }, { id: 'n1', label: 'n1', type: 'text' }, { id: 'x2', label: 'x2', type: 'text' }, { id: 'n2', label: 'n2', type: 'text' }, { id: 'alt', label: 'p1', type: 'select', options: ['≠ p2', '< p2', '> p2'] }], buttons: [{ label: 'OK', action: 'run2PropZTest' }, { label: 'Cancel', action: 'closeModal' }] },
    'chi2GOF': { id: 'chi2GOF', title: 'Chi-Square GOF Test', fields: [{ id: 'observed', label: 'Observed List', type: 'select' }, { id: 'expected', label: 'Expected List', type: 'select' }, { id: 'df', label: 'Degrees of Freedom', type: 'text' }], buttons: [{ label: 'OK', action: 'runChi2GOF' }, { label: 'Cancel', action: 'closeModal' }] },
    'chi2Test': { id: 'chi2Test', title: 'Chi-Square 2-Way Test', fields: [{ id: 'observedMatrixInfo', label: 'Select 2+ columns to form the observed matrix.', type: 'static' }, { id: 'observed', label: 'Observed Columns', type: 'select_multi' }], buttons: [{ label: 'OK', action: 'runChi2Test' }, { label: 'Cancel', action: 'closeModal' }] },
    'normalCdf': { id: 'normalCdf', title: 'Normal Cdf', fields: [{ id: 'lower', label: 'Lower Bound', value: '-1E99', type: 'text' }, { id: 'upper', label: 'Upper Bound', type: 'text' }, { id: 'mu', label: 'μ', value: '0', type: 'text' }, { id: 'sigma', label: 'σ', value: '1', type: 'text' }], buttons: [{ label: 'OK', action: 'runNormalCdf' }, { label: 'Cancel', action: 'closeModal' }] },
    'invNorm': { id: 'invNorm', title: 'Inverse Normal', fields: [{ id: 'area', label: 'Area', type: 'text' }, { id: 'mu', label: 'μ', value: '0', type: 'text' }, { id: 'sigma', label: 'σ', value: '1', type: 'text' }], buttons: [{ label: 'OK', action: 'runInvNorm' }, { label: 'Cancel', action: 'closeModal' }] },
    'binomPdf': { id: 'binomPdf', title: 'Binomial Pdf', fields: [{ id: 'n', label: 'Num Trials, n', type: 'text' }, { id: 'p', label: 'Prob Success, p', type: 'text' }, { id: 'x', label: 'X Value', type: 'text' }], buttons: [{ label: 'OK', action: 'runBinomPdf' }, { label: 'Cancel', action: 'closeModal' }] },
    'binomCdf': { id: 'binomCdf', title: 'Binomial Cdf', fields: [{ id: 'n', label: 'Num Trials, n', type: 'text' }, { id: 'p', label: 'Prob Success, p', type: 'text' }, { id: 'x', label: 'Upper Bound', type: 'text' }], buttons: [{ label: 'OK', action: 'runBinomCdf' }, { label: 'Cancel', action: 'closeModal' }] },
    'geomPdf': { id: 'geomPdf', title: 'Geometric Pdf', fields: [{ id: 'p', label: 'Prob Success, p', type: 'text' }, { id: 'x', label: 'X Value', type: 'text' }], buttons: [{ label: 'OK', action: 'runGeomPdf' }, { label: 'Cancel', action: 'closeModal' }] },
    'geomCdf': { id: 'geomCdf', title: 'Geometric Cdf', fields: [{ id: 'p', label: 'Prob Success, p', type: 'text' }, { id: 'lower', label: 'Lower Bound', type: 'text' }, { id: 'upper', label: 'Upper Bound', type: 'text' }], buttons: [{ label: 'OK', action: 'runGeomCdf' }, { label: 'Cancel', action: 'closeModal' }] },
};


export function StatisticsMenu({ onClose, onMenuAction, hasData, showMessageModal }: StatisticsMenuProps) {
  const handleActionClick = (actionId: string, requiresData: boolean) => {
    if (requiresData && !hasData) {
        showMessageModal('This function requires data. Please load data into the spreadsheet first.');
        return;
    }
    const config = modalConfigs[actionId];
    if (config) {
        onMenuAction(config);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Statistics & Distributions</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 my-4">
          {menuItems.map(item => (
            <Button
              key={item.actionId}
              variant="outline"
              onClick={() => handleActionClick(item.actionId, item.requiresData)}
              className="justify-start"
            >
              {item.label}
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
