import parse from 'html-react-parser';
import markup from '../templates/stage.html?raw';

/** The WebGL/2D canvas, view tools, feedback and hover affordances. */
export default function MoleculeStage() {
  return parse(markup);
}
