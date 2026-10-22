import parse from 'html-react-parser';
import markup from '../templates/sidebar.html?raw';

/** Molecule metadata and high-frequency atom/bond controls. */
export default function MoleculeInspector() {
  return parse(markup);
}
