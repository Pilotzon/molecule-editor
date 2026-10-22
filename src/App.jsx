import { useEffect } from 'react';
import parse from 'html-react-parser';
import symbols from './templates/symbols.html?raw';
import Header from './components/Header.jsx';
import MoleculeInspector from './components/MoleculeInspector.jsx';
import MoleculeStage from './components/MoleculeStage.jsx';
import { SettingsDialog, EquationDialog } from './components/Dialogs.jsx';
import { initialize } from './engine.js';

export default function App() {
  useEffect(() => {
    initialize();
  }, []);

  return <>
    {parse(symbols)}
    <Header />
    <div className="app side-open" id="app">
      <MoleculeInspector />
      <MoleculeStage />
    </div>
    <SettingsDialog />
    <EquationDialog />
    <div className="modal-backdrop" id="export-modal" aria-hidden="true">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="export-title" tabIndex={-1}>
        <div className="modal-head"><div><h2 id="export-title">Export molecule</h2><p>Save the current 2D or 3D view for a lesson or worksheet.</p></div><button className="btn icon" type="button" data-modal-close aria-label="Close export options">×</button></div>
        <div className="modal-content"><div className="modal-group"><h3>Choose a format</h3><div className="row"><span className="name">Scalable vector</span><div className="ctl"><button className="btn" id="btn-export-svg" type="button">Download SVG</button></div></div><div className="row"><span className="name">High-resolution image</span><div className="ctl"><button className="btn primary" id="btn-export-png" type="button">Download PNG</button></div></div><p className="hint">SVG stays sharp at any size. PNG is ready to drop into slides.</p></div></div>
        <div className="modal-actions"><button className="btn" type="button" data-modal-close>Cancel</button></div>
      </section>
    </div>
  </>;
}
