export function SettingsDialog() {
  return (
    <div className="modal-backdrop" id="settings-modal" aria-hidden="true">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title" tabIndex={-1}>
        <div className="modal-head">
          <div><h2 id="settings-title">Studio settings</h2><p>Make the workspace yours. Changes are saved on this device.</p></div>
          <button className="btn icon" type="button" data-modal-close aria-label="Close settings">×</button>
        </div>
        <div className="modal-content">
          <div className="modal-group">
            <h3>Appearance</h3>
            <div className="row"><span className="name">Theme</span><div className="ctl"><div className="seg" data-key="appearance" role="group" aria-label="Appearance"><button type="button" data-val="auto">System</button><button type="button" data-val="light">Light</button><button type="button" data-val="dark">Dark</button></div></div></div>
            <div className="row"><span className="name">Canvas</span><div className="ctl"><div className="seg" data-key="bgMode" role="group" aria-label="Canvas background"><button type="button" data-val="theme">Theme</button><button type="button" data-val="custom">Custom</button></div><input type="color" data-key="bgColor" aria-label="Custom canvas color" /></div></div>
          </div>
          <div className="modal-group">
            <h3>Label typography</h3>
            <div className="row"><label htmlFor="s-labelFont">Typeface</label><div className="ctl"><select className="field" id="s-labelFont" data-key="labelFont"><option value="system">System sans</option><option value="rounded">Rounded sans</option><option value="serif">Serif</option></select></div></div>
            <div className="row"><label htmlFor="s-labelWeight">Weight</label><div className="ctl"><select className="field" id="s-labelWeight" data-key="labelWeight"><option value="400">Regular</option><option value="500">Medium</option><option value="600">Semibold</option><option value="700">Bold</option></select></div></div>
            <div className="row"><label htmlFor="s-labelSize">Size</label><div className="ctl slider"><input type="range" id="s-labelSize" data-key="labelSize" min="9" max="28" step="1" /><span className="val" data-val-for="labelSize"></span></div></div>
          </div>
        </div>
        <div className="modal-actions"><button className="btn" type="button" data-modal-close>Done</button></div>
      </section>
    </div>
  );
}

export function EquationDialog() {
  return (
    <div className="modal-backdrop" id="equation-modal" aria-hidden="true">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="equation-title" tabIndex={-1}>
        <div className="modal-head">
          <div><h2 id="equation-title">Reaction equation</h2><p>Write a reaction and preview properly typeset chemical formulas.</p></div>
          <button className="btn icon" type="button" data-modal-close aria-label="Close equation editor">×</button>
        </div>
        <div className="modal-content">
          <div className="modal-group">
            <label htmlFor="equation-input"><h3>Equation</h3></label>
            <textarea className="field equation-editor" id="equation-input" placeholder="2 H2 + O2 -> 2 H2O" spellCheck="false" aria-describedby="equation-help" />
            <p className="hint" id="equation-help">Type element symbols, subscripts as numbers, coefficients, and use → or -&gt; between sides.</p>
          </div>
          <div className="modal-group"><h3>Live preview</h3><div className="equation-preview" id="equation-preview" aria-live="polite">Enter a reaction to preview its typeset form.</div></div>
        </div>
        <div className="modal-actions"><button className="btn" type="button" id="btn-clear-equation">Clear</button><button className="btn" type="button" data-modal-close>Cancel</button><button className="btn primary" type="button" id="btn-apply-equation">Apply to workspace</button></div>
      </section>
    </div>
  );
}
