'use client';

import React from 'react';
import ImporterPanel from './ImporterPanel';
import CalculatorPanel from './CalculatorPanel';
import GraphingPanel from './GraphingPanel';
import SpreadsheetPanel from './SpreadsheetPanel';

export default function MainApp() {
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
        <SpreadsheetPanel />
      </div>
    </main>
  );
}
