import parse from 'html-react-parser';
import markup from '../templates/header.html?raw';

/** Search, molecule identity, view switcher and export/settings entry points. */
export default function Header() {
  return parse(markup);
}
