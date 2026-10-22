import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import katex from 'katex';
import { CPK_COLORS, PRESET_MOLECULES, ATOMIC_NUM, DEFAULT_ELEM } from './data/molecules.js';
// ── Application state (persisted) ───────────────────────────────
        const DEFAULTS = {
            view: '3d', atomScale: 1.0, bondScale: 1.0,
            showLabels: true, labelContent: 'symbol', labelSize: 13, labelWeight: '600',
            labelColorMode: 'auto', labelColor: '#FFFFFF', labelFont: 'system',
            bondStyle: 'uniform', bondColor: null, bondColor1: '#8E8E93', bondColor2: '#4682D5', bondColor3: '#D19E41',
            bgMode: 'theme', bgColor: '#151515', appearance: 'dark',
            autoRotate: false, elemColors: {}, equationText: ''
        };
        const STORE_KEY = 'molteacher.v3';
        const S = Object.assign({}, DEFAULTS, loadStored());
        function loadStored() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; } }
        function saveStored() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {} }

        // Runtime
        let scene, camera, renderer, controls, raycaster, mouse;
        let moleculeGroup = new THREE.Group();
        let currentMolecule = null;      // working copy (bond edits apply here, never to presets)
        let pristineMolecule = null;
        let atomMeshList = [], bondGroupList = [], labelElementsList = [];
        let hoverBond = -1;
        let glOk = true;

        // ── Helpers ─────────────────────────────────────────────────────
        const $ = (id) => document.getElementById(id);
        const elemInfo = (e) => Object.assign({}, DEFAULT_ELEM, { name: e }, CPK_COLORS[e] || {});
        const elemColor = (e) => S.elemColors[e] || elemInfo(e).color;
        const isDark = () => document.documentElement.dataset.theme === 'dark';
        function contrastText(hex) {
            const c = new THREE.Color(hex);
            const lin = (v) => v;                                   // THREE.Color r128 stores sRGB-ish values
            const L = 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
            return L > 0.55 ? '#111114' : '#FFFFFF';
        }
        function labelFontFamily() { return S.labelFont === 'serif' ? 'Georgia, Times, serif' : S.labelFont === 'rounded' ? 'ui-rounded, system-ui, sans-serif' : 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'; }
        function labelText(atom) {
            if (S.labelContent === 'name') return elemInfo(atom.elem).name;
            if (S.labelContent === 'number') return String(ATOMIC_NUM[atom.elem] || '?');
            return atom.elem;
        }
        function atomRadius(elem) { return elemInfo(elem).radius * 0.65 * S.atomScale; }
        function bondColorFor(type) {
            if (S.bondStyle === 'order') return S['bondColor' + Math.min(3, Math.max(1, type))];
            return S.bondColor || getComputedStyle(document.documentElement).getPropertyValue('--bond-auto').trim();
        }
        function bgColor() {
            return S.bgMode === 'custom' ? S.bgColor : getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim();
        }
        const BOND_NAMES = ['', 'Single', 'Double', 'Triple'];
        const atomTag = (i) => `${currentMolecule.atoms[i].elem}${i + 1}`;

        // ══════════════════════ 3D ENGINE ══════════════════════
        function initThreeJS() {
            const container = $('canvas-container');
            if (typeof THREE === 'undefined' || typeof OrbitControls === 'undefined') throw new Error('Three.js not loaded');
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
            camera.position.set(0, 0, 10);

            renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            container.appendChild(renderer.domElement);
            renderer.domElement.setAttribute('role', 'img');
            renderer.domElement.setAttribute('aria-label', '3D molecule. Drag to rotate, scroll to zoom.');

            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.07;
            controls.autoRotateSpeed = 2.0;
            controls.autoRotate = S.autoRotate;
            controls.minDistance = 2;
            controls.maxDistance = 80;

            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();

            scene.add(new THREE.AmbientLight(0xffffff, 0.75));
            const key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(10, 15, 10); scene.add(key);
            const fill = new THREE.DirectionalLight(0xdfe8ff, 0.4); fill.position.set(-10, -10, -10); scene.add(fill);
            scene.add(moleculeGroup);

            new ResizeObserver(onResize).observe(container);
            onResize();
        }

        function onResize() {
            if (!renderer) return;
            const c = $('canvas-container');
            const w = c.clientWidth, h = c.clientHeight;
            if (!w || !h) return;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }

        // Rebuild geometry ONLY. Never touches camera/controls, so slider moves and bond edits keep the user's view.
        function buildMolecule3D() {
            if (!glOk) return;
            clearMoleculeGroup();
            const mol = currentMolecule;
            const center = molCenter(mol);

            mol.atoms.forEach((atom, idx) => {
                const sphere = new THREE.Mesh(
                    new THREE.SphereGeometry(atomRadius(atom.elem), 32, 24),
                    new THREE.MeshPhongMaterial({ color: new THREE.Color(elemColor(atom.elem)), shininess: 70, specular: 0x444444 })
                );
                sphere.position.set(atom.pos[0] - center.x, atom.pos[1] - center.y, atom.pos[2] - center.z);
                sphere.userData = { type: 'atom', index: idx, elem: atom.elem };
                moleculeGroup.add(sphere);
                atomMeshList.push(sphere);
                createAtomLabelHTML(atom, sphere);
            });

            mol.bonds.forEach((bond, bondIdx) => {
                const pA = atomMeshList[bond.from].position, pB = atomMeshList[bond.to].position;
                const g = renderBondMeshGroup(pA.clone(), pB.clone(), bond.type || 1, bondIdx);
                moleculeGroup.add(g);
                bondGroupList.push(g);
            });
            applyBondHighlight3D();
        }

        function molCenter(mol) {
            const c = new THREE.Vector3();
            mol.atoms.forEach(a => c.add(new THREE.Vector3(a.pos[0], a.pos[1], a.pos[2])));
            return c.divideScalar(Math.max(1, mol.atoms.length));
        }

        // Single / double / triple cylinders. Offsets are perpendicular to the bond axis.
        function renderBondMeshGroup(vA, vB, bondType, bondIndex) {
            const bondGroup = new THREE.Group();
            bondGroup.userData = { type: 'bond', index: bondIndex, bondType };
            const distance = vA.distanceTo(vB);
            const midpoint = new THREE.Vector3().addVectors(vA, vB).multiplyScalar(0.5);
            const dir = new THREE.Vector3().subVectors(vB, vA).normalize();

            let perp = new THREE.Vector3(0, 1, 0).cross(dir);
            if (perp.length() < 0.1) perp = new THREE.Vector3(1, 0, 0).cross(dir);
            perp.normalize().multiplyScalar(0.12 * S.bondScale);

            const baseRadius = 0.1 * S.bondScale;
            const color = new THREE.Color(bondColorFor(bondType));
            const makeCylinder = (offset, rad) => {
                const cyl = new THREE.Mesh(
                    new THREE.CylinderGeometry(rad, rad, distance, 16),
                    new THREE.MeshPhongMaterial({ color: color.clone(), shininess: 50, emissive: 0x000000 })
                );
                cyl.position.copy(midpoint).add(offset);
                cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
                cyl.userData = { bondIdx: bondIndex };
                return cyl;
            };
            const zero = new THREE.Vector3();
            if (bondType === 2) {
                bondGroup.add(makeCylinder(perp.clone(), baseRadius * 0.85), makeCylinder(perp.clone().negate(), baseRadius * 0.85));
            } else if (bondType === 3) {
                bondGroup.add(makeCylinder(zero, baseRadius * 0.75), makeCylinder(perp.clone(), baseRadius * 0.75), makeCylinder(perp.clone().negate(), baseRadius * 0.75));
            } else {
                bondGroup.add(makeCylinder(zero, baseRadius));
            }
            return bondGroup;
        }

        function applyBondHighlight3D() {
            const accent = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0062CC');
            bondGroupList.forEach(g => g.children.forEach(m => {
                if (g.userData.index === hoverBond) { m.material.emissive.copy(accent).multiplyScalar(0.7); }
                else m.material.emissive.setRGB(0, 0, 0);
            }));
        }

        // ── Labels (HTML overlay) with depth-aware occlusion ──
        function createAtomLabelHTML(atom, mesh) {
            const div = document.createElement('div');
            div.className = 'atom-label';
            div.textContent = labelText(atom);
            div.style.fontSize = `${S.labelSize}px`;
            div.style.fontWeight = S.labelWeight;
            div.style.fontFamily = labelFontFamily();
            div.style.fontFamily = labelFontFamily();
            div.style.color = S.labelColorMode === 'custom' ? S.labelColor : contrastText(elemColor(atom.elem));
            $('labels-overlay').appendChild(div);
            labelElementsList.push({ element: div, mesh, radius: mesh.geometry.parameters.radius });
        }

        const _p = new THREE.Vector3(), _d = new THREE.Vector3(), _q = new THREE.Vector3(), _c = new THREE.Vector3();
        function updateAtomLabelsPositions() {
            if (!glOk || S.view !== '3d') return;
            const n = labelElementsList.length;
            if (!S.showLabels) { labelElementsList.forEach(it => it.element.style.opacity = '0'); return; }
            const w = renderer.domElement.clientWidth / 2, h = renderer.domElement.clientHeight / 2;
            camera.getWorldPosition(_c);
            const world = labelElementsList.map(it => it.mesh.getWorldPosition(new THREE.Vector3()));
            for (let i = 0; i < n; i++) {
                const it = labelElementsList[i];
                _p.copy(world[i]).project(camera);
                if (_p.z > 1 || _p.z < -1) { it.element.style.opacity = '0'; continue; }
                it.element.style.left = `${_p.x * w + w}px`;
                it.element.style.top = `${-_p.y * h + h}px`;

                // Occlusion: does a nearer sphere cover the ray camera → this atom's centre?
                _d.subVectors(world[i], _c);
                const dist = _d.length(); _d.divideScalar(dist);
                let vis = 1;
                for (let j = 0; j < n; j++) {
                    if (j === i) continue;
                    _q.subVectors(world[j], _c);
                    const t = _q.dot(_d);
                    if (t <= 0 || t >= dist) continue;                       // behind camera, or behind this atom
                    const perp = _q.addScaledVector(_d, -t).length();        // distance from sphere centre to the ray
                    const r = labelElementsList[j].radius;
                    const f = Math.min(1, Math.max(0, (perp - r * 0.55) / (r * 0.45)));
                    if (f < vis) vis = f;
                    if (vis === 0) break;
                }
                it.element.style.opacity = vis.toFixed(2);
            }
        }

        function disposeObject(o) {
            o.traverse(n => { if (n.geometry) n.geometry.dispose(); if (n.material) n.material.dispose(); });
        }
        function clearMoleculeGroup() {
            while (moleculeGroup.children.length) { const o = moleculeGroup.children[0]; moleculeGroup.remove(o); disposeObject(o); }
            atomMeshList = []; bondGroupList = [];
            $('labels-overlay').innerHTML = '';
            labelElementsList = [];
        }

        function fitCameraToMolecule() {
            if (!glOk) return;
            const box = new THREE.Box3().setFromObject(moleculeGroup);
            const sphere = box.getBoundingSphere(new THREE.Sphere());
            const vFov = THREE.MathUtils.degToRad(camera.fov);
            const fov = Math.min(vFov, 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect));
            const dist = Math.max(5, (sphere.radius + 0.4) / Math.sin(fov / 2));
            camera.position.set(0, 0, dist);
            camera.up.set(0, 1, 0);
            controls.target.set(0, 0, 0);
            controls.update();
        }

        function animate() {
            requestAnimationFrame(animate);
            if (!glOk || S.view !== '3d') return;
            controls.update();
            renderer.render(scene, camera);
            updateAtomLabelsPositions();
        }

        // ── 3D pointer interaction: hover + click-to-cycle (drag never triggers an edit) ──
        function pickBond3D(ev) {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const hits = raycaster.intersectObjects(moleculeGroup.children, true);   // atoms occlude bonds
            if (!hits.length) return -1;
            const o = hits[0].object;
            return o.userData.bondIdx !== undefined ? o.userData.bondIdx : -1;
        }
        function setupPointer3D() {
            const el = renderer.domElement;
            let down = null;
            el.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
            el.addEventListener('pointermove', e => { if (e.buttons) { setHover(-1); return; } setHover(pickBond3D(e), e); });
            el.addEventListener('pointerleave', () => setHover(-1));
            el.addEventListener('pointerup', e => {
                if (!down || e.button !== 0) return;
                const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
                down = null;
                if (moved < 5) { const b = pickBond3D(e); if (b >= 0) cycleBond(b); }
            });
        }

        // ══════════════════════ 2D MODE ══════════════════════
        // Real 2D layout: the molecule is projected onto its best-fit plane (PCA), then a small
        // relaxation pass separates overlapping atoms (e.g. methyl H's that stack in a flat projection).
        let layout2D = [];           // [[x, y]] in Å, y up
        let vb2d = null;             // current viewBox [x, y, w, h]
        let vbTouched = false;

        function computeLayout2D(mol) {
            const P = mol.atoms.map(a => a.pos);
            const n = P.length;
            const heavy = P.filter((_, i) => mol.atoms[i].elem !== 'H');
            const ref = heavy.length >= 3 ? heavy : P;
            const c = [0, 0, 0]; ref.forEach(p => { for (let k = 0; k < 3; k++) c[k] += p[k] / ref.length; });
            const cov = [[0,0,0],[0,0,0],[0,0,0]];
            ref.forEach(p => { const d = [p[0]-c[0], p[1]-c[1], p[2]-c[2]]; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) cov[a][b] += d[a]*d[b]; });
            const mulv = (M, v) => M.map(r => r[0]*v[0] + r[1]*v[1] + r[2]*v[2]);
            const norm = v => { const l = Math.hypot(v[0], v[1], v[2]); return l < 1e-9 ? null : v.map(x => x / l); };
            const power = (M, seed) => { let v = norm(seed); for (let i = 0; i < 80 && v; i++) { const w = norm(mulv(M, v)); if (!w) return null; v = w; } return v; };
            let v1 = power(cov, [1, 0.37, 0.21]) || [1, 0, 0];
            const lam1 = (() => { const w = mulv(cov, v1); return w[0]*v1[0] + w[1]*v1[1] + w[2]*v1[2]; })();
            const cov2 = cov.map((r, a) => r.map((x, b) => x - lam1 * v1[a] * v1[b]));
            let v2 = power(cov2, [0.3, 1, 0.17]);
            if (v2) { const dp = v2[0]*v1[0] + v2[1]*v1[1] + v2[2]*v1[2]; v2 = norm(v2.map((x, k) => x - dp * v1[k])); }
            if (!v2) { const t = Math.abs(v1[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]; const dp = t[0]*v1[0] + t[1]*v1[1] + t[2]*v1[2]; v2 = norm(t.map((x, k) => x - dp * v1[k])); }
            const nrm = [v1[1]*v2[2]-v1[2]*v2[1], v1[2]*v2[0]-v1[0]*v2[2], v1[0]*v2[1]-v1[1]*v2[0]];
            const flat = Math.abs(nrm[2]) > 0.98;                      // already drawn in the xy-plane → keep as authored
            if (flat) { v1 = [1, 0, 0]; v2 = [0, 1, 0]; }
            let L = P.map(p => { const d = [p[0]-c[0], p[1]-c[1], p[2]-c[2]]; return [d[0]*v1[0]+d[1]*v1[1]+d[2]*v1[2], d[0]*v2[0]+d[1]*v2[1]+d[2]*v2[2]]; });

            // Relaxation
            const adj = Array.from({ length: n }, () => new Set());
            mol.bonds.forEach(b => { adj[b.from].add(b.to); adj[b.to].add(b.from); });
            const target = mol.bonds.map(b => { const a = P[b.from], d = P[b.to]; return Math.min(1.6, Math.max(0.95, Math.hypot(a[0]-d[0], a[1]-d[1], a[2]-d[2]))); });
            L = L.map((p, i) => [p[0] + Math.cos(i * 2.399) * 0.02, p[1] + Math.sin(i * 2.399) * 0.02]);   // deterministic jitter
            const near13 = (i, j) => { for (const k of adj[i]) if (adj[k].has(j)) return true; return false; };
            for (let it = 0; it < 160; it++) {
                const F = L.map(() => [0, 0]);
                for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
                    if (adj[i].has(j)) continue;
                    const dx = L[j][0]-L[i][0], dy = L[j][1]-L[i][1], d = Math.hypot(dx, dy) || 1e-6;
                    const min = near13(i, j) ? 1.9 : 1.05;
                    if (d < min) { const f = (min - d) * 0.35 / d; F[i][0] -= dx*f; F[i][1] -= dy*f; F[j][0] += dx*f; F[j][1] += dy*f; }
                }
                mol.bonds.forEach((b, k) => {
                    const dx = L[b.to][0]-L[b.from][0], dy = L[b.to][1]-L[b.from][1], d = Math.hypot(dx, dy) || 1e-6;
                    const f = (d - target[k]) * 0.25 / d;
                    F[b.from][0] += dx*f; F[b.from][1] += dy*f; F[b.to][0] -= dx*f; F[b.to][1] -= dy*f;
                });
                L.forEach((p, i) => { p[0] += F[i][0]; p[1] += F[i][1]; });
            }
            return L;
        }

        function bbox2D(pad = 0.9) {
            let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
            currentMolecule.atoms.forEach((a, i) => {
                const r = atomRadius(a.elem), X = layout2D[i][0], Y = -layout2D[i][1];
                x0 = Math.min(x0, X - r); x1 = Math.max(x1, X + r); y0 = Math.min(y0, Y - r); y1 = Math.max(y1, Y + r);
            });
            return [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad];
        }
        function fitViewBox(aspect) {
            const [x, y, w, h] = bbox2D();
            let W = w, H = h;
            if (W / H < aspect) W = H * aspect; else H = W / aspect;
            return [x + w / 2 - W / 2, y + h / 2 - H / 2, W, H];
        }
        const darken = (hex, k = 0.72) => { const c = new THREE.Color(hex); return '#' + new THREE.Color(c.r * k, c.g * k, c.b * k).getHexString(); };

        // Build the SVG markup for a given viewBox. Used for both the live view and exports.
        function buildSVG2D(vb, pxWidth, opts = {}) {
            const mol = currentMolecule, bs = S.bondScale;
            const px = pxWidth / vb[2];                       // device px per Å
            const fs = S.labelSize / (opts.fitPx || px);      // labels scale with the molecule
            const bw = 0.13 * bs, off = 0.12 * bs;
            let s = '';
            if (opts.background) s += `<rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="${opts.background}"/>`;
            mol.bonds.forEach((b, k) => {
                const A = layout2D[b.from], B = layout2D[b.to];
                const x1 = A[0], y1 = -A[1], x2 = B[0], y2 = -B[1];
                const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
                const nx = -dy / len * off, ny = dx / len * off;
                const type = b.type || 1, col = bondColorFor(type);
                const offsets = type === 2 ? [[nx, ny], [-nx, -ny]] : type === 3 ? [[0, 0], [nx, ny], [-nx, -ny]] : [[0, 0]];
                const w = bw * (type === 1 ? 1 : type === 2 ? 0.85 : 0.75);
                const lines = offsets.map(o => `<line class="vis" x1="${(x1+o[0]).toFixed(3)}" y1="${(y1+o[1]).toFixed(3)}" x2="${(x2+o[0]).toFixed(3)}" y2="${(y2+o[1]).toFixed(3)}" stroke="${col}" stroke-width="${w.toFixed(3)}" stroke-linecap="round"/>`).join('');
                if (opts.export) s += lines;
                else s += `<g class="b2d${k === hoverBond ? ' hover' : ''}" data-idx="${k}">${lines}<line class="hit" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${Math.max(0.5, 14 / px)}"/></g>`;
            });
            mol.atoms.forEach((a, i) => {
                const X = layout2D[i][0], Y = -layout2D[i][1], col = elemColor(a.elem), r = atomRadius(a.elem);
                s += `<circle cx="${X.toFixed(3)}" cy="${Y.toFixed(3)}" r="${r.toFixed(3)}" fill="${col}" stroke="${darken(col)}" stroke-width="${(1.2 / px).toFixed(3)}"/>`;
                if (S.showLabels) {
                    const fill = S.labelColorMode === 'custom' ? S.labelColor : contrastText(col);
                    s += `<text x="${X.toFixed(3)}" y="${Y.toFixed(3)}" fill="${fill}" font-size="${fs.toFixed(3)}" font-weight="${S.labelWeight}" font-family="${labelFontFamily()}" text-anchor="middle" dominant-baseline="central" style="pointer-events:none;user-select:none">${escapeXML(labelText(a))}</text>`;
                }
            });
            return s;
        }
        const escapeXML = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

        function render2D() {
            const host = $('view2d');
            if (!currentMolecule) return;
            const W = host.clientWidth || 800, H = host.clientHeight || 600;
            const fit = fitViewBox(W / H);
            if (!vb2d || !vbTouched) vb2d = fit;
            else { const cx = vb2d[0] + vb2d[2] / 2, cy = vb2d[1] + vb2d[3] / 2, h = vb2d[3], w = h * (W / H); vb2d = [cx - w / 2, cy - h / 2, w, h]; }
            host.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb2d.map(v => +v.toFixed(3)).join(' ')}" role="img" aria-label="2D structure of ${escapeXML(currentMolecule.name)}">${buildSVG2D(vb2d, W, { fitPx: W / fit[2] })}</svg>`;
        }
        function resetView2D() { vbTouched = false; vb2d = null; render2D(); }

        function setupPointer2D() {
            const host = $('view2d');
            const pts = new Map();
            let down = null, pinch0 = null;
            const toWorld = (cx, cy) => { const r = host.getBoundingClientRect(); return [vb2d[0] + (cx - r.left) / r.width * vb2d[2], vb2d[1] + (cy - r.top) / r.height * vb2d[3]]; };
            const apply = () => { host.querySelector('svg').setAttribute('viewBox', vb2d.map(v => +v.toFixed(3)).join(' ')); };
            const zoomAt = (cx, cy, k) => {
                const [wx, wy] = toWorld(cx, cy), r = host.getBoundingClientRect();
                const nw = Math.min(Math.max(vb2d[2] * k, 1.5), 400), kk = nw / vb2d[2];
                const nh = vb2d[3] * kk;
                vb2d = [wx - (cx - r.left) / r.width * nw, wy - (cy - r.top) / r.height * nh, nw, nh];
                vbTouched = true; apply(); render2D();
            };
            host.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, Math.exp(e.deltaY * 0.0015)); }, { passive: false });
            host.addEventListener('pointerdown', e => {
                host.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
                down = { x: e.clientX, y: e.clientY, vb: vb2d.slice(), moved: false };
                if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a[0]-b[0], a[1]-b[1]); }
                host.classList.add('dragging');
            });
            host.addEventListener('pointermove', e => {
                if (!pts.has(e.pointerId)) {                      // hover (no buttons)
                    const g = e.target.closest && e.target.closest('.b2d');
                    setHover(g ? +g.dataset.idx : -1, e); return;
                }
                pts.set(e.pointerId, [e.clientX, e.clientY]);
                if (pts.size === 2 && pinch0) {
                    const [a, b] = [...pts.values()], d = Math.hypot(a[0]-b[0], a[1]-b[1]);
                    zoomAt((a[0]+b[0]) / 2, (a[1]+b[1]) / 2, pinch0 / d); pinch0 = d; down && (down.moved = true); return;
                }
                if (!down) return;
                const dx = e.clientX - down.x, dy = e.clientY - down.y;
                if (Math.hypot(dx, dy) > 4) { down.moved = true; setHover(-1); }
                if (down.moved) {
                    const r = host.getBoundingClientRect();
                    vb2d = [down.vb[0] - dx / r.width * down.vb[2], down.vb[1] - dy / r.height * down.vb[3], down.vb[2], down.vb[3]];
                    vbTouched = true; apply();
                }
            });
            const end = e => {
                const wasClick = down && !down.moved && pts.size === 1;
                pts.delete(e.pointerId); pinch0 = null; host.classList.remove('dragging');
                if (wasClick && e.type === 'pointerup') { const g = document.elementFromPoint(e.clientX, e.clientY)?.closest('.b2d'); if (g) cycleBond(+g.dataset.idx); }
                if (!pts.size) down = null;
            };
            host.addEventListener('pointerup', end); host.addEventListener('pointercancel', end);
            host.addEventListener('pointerleave', () => setHover(-1));
            new ResizeObserver(() => { if (S.view === '2d') render2D(); }).observe(host);
        }

        // ══════════════════════ MOLECULE LOADING & UI ══════════════════════
        const clone = (o) => JSON.parse(JSON.stringify(o));

        // Full load: new molecule → new layout, new camera framing.
        function loadMolecule(molData) {
            pristineMolecule = clone(molData);
            currentMolecule = clone(molData);        // edits never leak back into the presets
            layout2D = computeLayout2D(currentMolecule);
            hoverBond = -1; vbTouched = false; vb2d = null;
            buildMolecule3D();
            fitCameraToMolecule();
            if (S.view === '2d') render2D();
            updateUI(currentMolecule);
            buildBondList();
        }
        // Geometry-only refresh: used by sliders, colors, bond edits. Camera and controls are untouched.
        function rebuild() {
            if (!currentMolecule) return;
            buildMolecule3D();
            if (S.view === '2d') render2D();
            refreshBondList();
        }

        const SUB = '₀₁₂₃₄₅₆₇₈₉';
        const subscript = (f) => f.replace(/\d/g, d => SUB[+d]);
        function updateUI(mol) {
            $('mol-name').textContent = mol.name;
            $('mol-formula-sub').textContent = subscript(mol.formula);
            $('mol-description').textContent = mol.desc;
            $('mol-atom-count').textContent = `${mol.atoms.length} atoms`;
            const h = $('katex-header');
            try { if (typeof katex === 'undefined') throw 0; katex.render(mol.katex || mol.formula, h, { throwOnError: false }); }
            catch (e) { h.textContent = subscript(mol.formula); }
            generateCPKLegend(mol);
        }

        function generateCPKLegend(mol) {
            const list = $('cpk-legend-list');
            list.innerHTML = '';
            const counts = {};
            mol.atoms.forEach(a => counts[a.elem] = (counts[a.elem] || 0) + 1);
            Object.keys(counts).forEach((elem, i) => {
                const row = document.createElement('div');
                row.className = 'legend-row'; row.style.setProperty('--stagger', `${i * 30}ms`);
                const info = elemInfo(elem);
                row.innerHTML = `<input type="color" aria-label="Color for ${escapeXML(info.name)}" value="${toHex6(elemColor(elem))}">
                    <span class="nm">${escapeXML(info.name)} <span class="hint">${escapeXML(elem)}</span></span><span class="ct">${counts[elem]}</span>`;
                row.querySelector('input').addEventListener('input', e => { S.elemColors[elem] = e.target.value; saveStored(); rebuild(); });
                list.appendChild(row);
            });
        }
        const toHex6 = (c) => '#' + new THREE.Color(c).getHexString();

        // ── Bond hover / edit ──
        let lastPointerEvent = null;
        function setHover(idx, ev) {
            const tip = $('bond-tip');
            if (ev) lastPointerEvent = { clientX: ev.clientX, clientY: ev.clientY };
            if (idx !== hoverBond) {
                hoverBond = idx;
                if (glOk) applyBondHighlight3D();
                document.querySelectorAll('#view2d .b2d').forEach(g => g.classList.toggle('hover', +g.dataset.idx === idx));
                document.querySelectorAll('.bond-item').forEach(b => b.classList.toggle('hl', +b.dataset.idx === idx));
                $('stage').classList.toggle('over-bond', idx >= 0);
            }
            if (idx >= 0 && ev) {
                const b = currentMolecule.bonds[idx], t = b.type || 1;
                tip.innerHTML = `<b>${atomTag(b.from)} – ${atomTag(b.to)}</b> <span class="o">${BOND_NAMES[t]} bond · click to change</span>`;
                const r = $('stage').getBoundingClientRect();
                const x = Math.min(ev.clientX - r.left + 14, r.width - tip.offsetWidth - 8), y = ev.clientY - r.top + 16;
                tip.style.left = `${Math.max(8, x)}px`; tip.style.top = `${y}px`;
                tip.classList.add('on');
            } else tip.classList.remove('on');
        }
        function cycleBond(idx) {
            const b = currentMolecule.bonds[idx];
            b.type = (b.type || 1) >= 3 ? 1 : (b.type || 1) + 1;
            rebuild();
            if (hoverBond === idx) setHover(idx, lastPointerEvent);                                   // geometry only — camera is not reset
            showToast(`${atomTag(b.from)} – ${atomTag(b.to)} is now a ${BOND_NAMES[b.type].toLowerCase()} bond`, 'info');
        }
        function buildBondList() {
            const el = $('bond-list'); el.innerHTML = '';
            currentMolecule.bonds.forEach((b, i) => {
                const btn = document.createElement('button');
                btn.type = 'button'; btn.className = 'bond-item'; btn.dataset.idx = i; btn.style.setProperty('--stagger', `${Math.min(i, 10) * 22}ms`);
                btn.innerHTML = `<span></span><span class="o"></span>`;
                btn.addEventListener('click', () => cycleBond(i));
                btn.addEventListener('mouseenter', () => setHover(i));
                btn.addEventListener('mouseleave', () => setHover(-1));
                btn.addEventListener('focus', () => setHover(i));
                btn.addEventListener('blur', () => setHover(-1));
                el.appendChild(btn);
            });
            refreshBondList();
        }
        function refreshBondList() {
            document.querySelectorAll('.bond-item').forEach(btn => {
                const b = currentMolecule.bonds[+btn.dataset.idx], t = b.type || 1;
                btn.children[0].textContent = `${atomTag(b.from)} – ${atomTag(b.to)}`;
                btn.children[1].textContent = BOND_NAMES[t];
                btn.setAttribute('aria-label', `${atomTag(b.from)} to ${atomTag(b.to)}, ${BOND_NAMES[t]} bond. Activate to change.`);
            });
        }

        // ══════════════════════ PUBCHEM ══════════════════════
        let fetchCtl = null;
        async function fetchSDF(query, recordType, signal) {
            const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/SDF?record_type=${recordType}`;
            const res = await fetch(url, { signal });
            if (res.status === 404) return null;
            if (!res.ok) throw new Error(`PubChem responded with an error (${res.status}). Try again in a moment.`);
            return res.text();
        }
        async function fetchPubChemStructure(query) {
            if (fetchCtl) fetchCtl.abort();
            const ctl = fetchCtl = new AbortController();
            const timer = setTimeout(() => ctl.abort('timeout'), 15000);
            setBusy(true);
            try {
                let sdf = await fetchSDF(query, '3d', ctl.signal), flat = false;
                if (!sdf) { sdf = await fetchSDF(query, '2d', ctl.signal); flat = true; }
                if (!sdf) throw new Error(`“${query}” wasn’t found in PubChem. Check the spelling or try a common name.`);
                const mol = parseSDF3D(sdf, query, flat);
                loadMolecule(mol);
                $('preset-dropdown').selectedIndex = -1;
                showToast(flat ? `Loaded “${mol.name}” — only a 2D structure exists, so 3D view is flat` : `Loaded “${mol.name}” from PubChem`, flat ? 'info' : 'success');
            } catch (err) {
                if (ctl.signal.aborted && ctl.signal.reason !== 'timeout') return;       // superseded by a newer search
                const offline = err.name === 'TypeError' || ctl.signal.reason === 'timeout';
                showToast(offline ? 'Couldn’t reach PubChem. Check your connection and try again.' : err.message, 'error');
            } finally {
                clearTimeout(timer);
                if (fetchCtl === ctl) { fetchCtl = null; setBusy(false); }
            }
        }
        function setBusy(on) {
            $('btn-search').parentElement.classList.toggle('loading', on);
            $('btn-search').disabled = on; $('btn-search').setAttribute('aria-busy', on);
            $('busy').classList.toggle('on', on);
        }

        // V2000 SDF parser with validation
        function parseSDF3D(sdfText, queryName, flat) {
            if (/V3000/.test(sdfText)) throw new Error('This record uses an unsupported SDF format.');
            const lines = sdfText.split(/\r?\n/);
            const ci = lines.findIndex(l => l.includes('V2000'));
            if (ci < 0) throw new Error('PubChem returned data this app can’t read.');
            const numAtoms = parseInt(lines[ci].substring(0, 3)), numBonds = parseInt(lines[ci].substring(3, 6));
            if (!(numAtoms > 0)) throw new Error('The structure has no atoms.');
            if (numAtoms > 400) throw new Error(`That molecule is too large to display (${numAtoms} atoms).`);
            const atoms = [], bonds = [];
            for (let i = 0; i < numAtoms; i++) {
                const l = lines[ci + 1 + i] || '';
                const x = parseFloat(l.substring(0, 10)), y = parseFloat(l.substring(10, 20)), z = parseFloat(l.substring(20, 30));
                let elem = l.substring(31, 34).trim();
                elem = elem.charAt(0).toUpperCase() + elem.slice(1).toLowerCase();
                if (!elem || [x, y, z].some(Number.isNaN)) throw new Error('The structure data is malformed.');
                atoms.push({ elem, pos: [x, y, z] });
            }
            const start = ci + 1 + numAtoms;
            for (let i = 0; i < (numBonds || 0); i++) {
                const l = lines[start + i] || '';
                const from = parseInt(l.substring(0, 3)) - 1, to = parseInt(l.substring(3, 6)) - 1, type = parseInt(l.substring(6, 9));
                if (!(from >= 0 && from < numAtoms && to >= 0 && to < numAtoms)) continue;
                bonds.push({ from, to, type: type >= 1 && type <= 3 ? type : 1 });
            }
            // Hill-system formula
            const counts = {}; atoms.forEach(a => counts[a.elem] = (counts[a.elem] || 0) + 1);
            const keys = Object.keys(counts).sort();
            const order = counts.C ? ['C', ...(counts.H ? ['H'] : []), ...keys.filter(k => k !== 'C' && k !== 'H')] : keys;
            const formula = order.map(e => e + (counts[e] > 1 ? counts[e] : '')).join('');
            const katexF = order.map(e => `\\text{${e}}` + (counts[e] > 1 ? `_{${counts[e]}}` : '')).join('');
            return {
                name: queryName.charAt(0).toUpperCase() + queryName.slice(1),
                formula, katex: katexF,
                desc: flat ? 'Structure from PubChem (2D only — no 3D conformer available).' : '3D structure fetched from the PubChem database.',
                atoms, bonds
            };
        }

        // ══════════════════════ TOAST ══════════════════════
        let toastTimer = null;
        function showToast(message, type = 'info') {
            const t = $('toast');
            $('toast-text').textContent = message;
            t.className = `toast on ${type}`;
            $('toast-icon').firstElementChild.setAttribute('href', type === 'error' ? '#i-warn' : type === 'success' ? '#i-check' : '#i-info');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => t.classList.remove('on'), type === 'error' ? 5000 : 3000);
        }

        // ══════════════════════ SETTINGS BINDING ══════════════════════
        function fmtVal(key, v) { return key === 'labelSize' ? `${v}px` : `${(+v).toFixed(2).replace(/0$/, '')}×`; }
        function syncControls() {
            document.querySelectorAll('[data-key]').forEach(el => {
                const k = el.dataset.key;
                if (el.matches('input[type=range]')) {
                    el.value = S[k];
                    el.style.setProperty('--fill', `${(el.value - el.min) / (el.max - el.min) * 100}%`);
                    const out = document.querySelector(`[data-val-for="${k}"]`); if (out) out.textContent = fmtVal(k, S[k]);
                } else if (el.matches('input[type=checkbox]')) el.checked = !!S[k];
                else if (el.matches('input[type=color]')) el.value = toHex6(S[k] || getComputedStyle(document.documentElement).getPropertyValue('--bond-auto').trim() || '#888888');
                else if (el.matches('select')) el.value = S[k];
                else if (el.classList.contains('seg')) el.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.val === String(S[k])));
            });
            $('row-bond-solid').style.display = S.bondStyle === 'uniform' ? '' : 'none';
            $('row-bond-order').style.display = S.bondStyle === 'order' ? '' : 'none';
            document.querySelector('[data-key="labelColor"]').style.display = S.labelColorMode === 'custom' ? '' : 'none';
            document.querySelector('[data-key="bgColor"]').style.display = S.bgMode === 'custom' ? '' : 'none';
            ['labelContent', 'labelSize', 'labelWeight', 'labelColorMode'].forEach(k => {
                const row = document.querySelector(`[data-key="${k}"]`).closest('.row'); row.style.opacity = S.showLabels ? '' : '.45'; row.style.pointerEvents = S.showLabels ? '' : 'none';
            });
            $('btn-autorotate').setAttribute('aria-pressed', S.autoRotate);
            $('btn-bond-auto').setAttribute('aria-pressed', S.bondColor === null);
        }
        function onSetting(key) {
            saveStored();
            if (key === 'appearance') { applyTheme(); return; }
            if (key === 'bgMode' || key === 'bgColor') { applyBackground(); }
            syncControls();
            rebuild();
        }
        function bindControls() {
            document.querySelectorAll('[data-key]').forEach(el => {
                const k = el.dataset.key;
                if (el.matches('input[type=range]')) el.addEventListener('input', () => { S[k] = parseFloat(el.value); onSetting(k); });
                else if (el.matches('input[type=checkbox]')) el.addEventListener('change', () => { S[k] = el.checked; onSetting(k); });
                else if (el.matches('input[type=color]')) el.addEventListener('input', () => { S[k] = el.value; onSetting(k); });
                else if (el.matches('select')) el.addEventListener('change', () => { S[k] = el.value; onSetting(k); });
                else if (el.classList.contains('seg')) el.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { S[k] = b.dataset.val; onSetting(k); } });
            });
            $('btn-bond-auto').addEventListener('click', () => { S.bondColor = null; onSetting('bondColor'); });
            $('btn-reset-colors').addEventListener('click', () => { S.elemColors = {}; saveStored(); generateCPKLegend(currentMolecule); rebuild(); });
            $('btn-reset-bonds').addEventListener('click', () => { currentMolecule = clone(pristineMolecule); rebuild(); showToast('Bonds restored', 'info'); });
        }

        // ── Theme & background ──
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        function applyTheme() {
            const dark = S.appearance === 'dark' || (S.appearance === 'auto' && mq.matches);
            document.documentElement.dataset.theme = dark ? 'dark' : 'light';
            $('btn-toggle-theme').firstElementChild.firstElementChild.setAttribute('href', dark ? '#i-sun' : '#i-moon');
            applyBackground();
            syncControls();
            rebuild();
        }
        function applyBackground() {
            const root = document.documentElement.style, custom = S.bgMode === 'custom';
            $('stage').style.background = custom ? S.bgColor : '';
            if (custom) root.setProperty('--bond-auto', contrastText(S.bgColor) === '#FFFFFF' ? '#C4C4CA' : '#55555B'); else root.removeProperty('--bond-auto');
            if (scene) scene.background = new THREE.Color(bgColor());
        }

        // ── View mode ──
        function setView(v) {
            if (v === '3d' && !glOk) { v = '2d'; showToast('3D isn’t available on this device', 'error'); }
            S.view = v; saveStored();
            $('stage').classList.toggle('mode-2d', v === '2d');
            $('app').classList.toggle('mode-2d', v === '2d');
            document.querySelectorAll('#seg-view button').forEach(b => b.setAttribute('aria-pressed', b.dataset.val === v));
            $('btn-autorotate').disabled = v === '2d';
            setHover(-1);
            $('hintbar').innerHTML = v === '3d'
                ? 'Drag to rotate · Scroll to zoom · Right-drag to pan · Click a bond to change it'
                : 'Drag to pan · Scroll to zoom · Click a bond to change it';
            if (v === '2d') render2D(); else { onResize(); }
        }
        function resetView() { if (S.view === '3d') fitCameraToMolecule(); else resetView2D(); }

        // ══════════════════════ EXPORT ══════════════════════
        const fileBase = () => `${currentMolecule.name.replace(/[^\w\-]+/g, '_')}_${S.view.toUpperCase()}`;
        function download(blob, name) {
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
            document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        }
        function exportSVGString() {
            if (S.view === '2d') {
                const host = $('view2d'), asp = (host.clientWidth || 800) / (host.clientHeight || 600);
                const vb = fitViewBox(asp), W = 1600, H = Math.round(W / asp);
                return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(v => +v.toFixed(3)).join(' ')}" width="${W}" height="${H}">${buildSVG2D(vb, W, { export: true, background: bgColor(), fitPx: (host.clientWidth || 800) / vb[2] })}</svg>`;
            }
            // 3D: project the *rendered* scene (the original projected un-centred coordinates)
            renderer.render(scene, camera); camera.updateMatrixWorld();
            const cw = renderer.domElement.clientWidth, ch = renderer.domElement.clientHeight;
            const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
            const proj = (v) => { const p = v.clone().project(camera); const vz = -v.clone().applyMatrix4(camera.matrixWorldInverse).z; return { x: (p.x * .5 + .5) * cw, y: (-p.y * .5 + .5) * ch, d: vz, k: (ch / 2) / (tanH * vz) }; };
            const items = [], defs = [];
            atomMeshList.forEach((m, i) => {
                const wp = m.getWorldPosition(new THREE.Vector3()), p = proj(wp), r = m.geometry.parameters.radius * p.k;
                const col = elemColor(m.userData.elem);
                defs.push(`<radialGradient id="g${i}" cx=".35" cy=".32" r=".75"><stop offset="0" stop-color="${new THREE.Color(col).lerp(new THREE.Color('#fff'), .45).getStyle()}"/><stop offset=".55" stop-color="${col}"/><stop offset="1" stop-color="${darken(col, .6)}"/></radialGradient>`);
                let t = '';
                const lab = labelElementsList[i], op = lab ? parseFloat(lab.element.style.opacity || '1') : 0;
                if (S.showLabels && op > 0.05) t = `<text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" fill="${lab.element.style.color}" opacity="${op}" font-size="${S.labelSize}" font-weight="${S.labelWeight}" font-family="${labelFontFamily()}" text-anchor="middle" dominant-baseline="central">${escapeXML(lab.element.textContent)}</text>`;
                items.push({ d: p.d, svg: `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#g${i})"/>`, label: t });
            });
            bondGroupList.forEach((g, bi) => {
                const b = currentMolecule.bonds[bi], A = proj(atomMeshList[b.from].position), B = proj(atomMeshList[b.to].position), type = b.type || 1;
                const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1, k = (A.k + B.k) / 2;
                const off = 0.12 * S.bondScale * k, nx = -dy / len * off, ny = dx / len * off, w = 0.2 * S.bondScale * k * (type === 1 ? 1 : type === 2 ? .85 : .75);
                const os = type === 2 ? [[nx, ny], [-nx, -ny]] : type === 3 ? [[0, 0], [nx, ny], [-nx, -ny]] : [[0, 0]];
                const svg = os.map(o => `<line x1="${(A.x + o[0]).toFixed(1)}" y1="${(A.y + o[1]).toFixed(1)}" x2="${(B.x + o[0]).toFixed(1)}" y2="${(B.y + o[1]).toFixed(1)}" stroke="${bondColorFor(type)}" stroke-width="${w.toFixed(1)}" stroke-linecap="round"/>`).join('');
                items.push({ d: (A.d + B.d) / 2, svg, label: '' });
            });
            items.sort((a, b) => b.d - a.d);
            const labels = items.map(i => i.label).join('');
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cw} ${ch}" width="${cw * 2}" height="${ch * 2}"><defs>${defs.join('')}</defs><rect width="${cw}" height="${ch}" fill="${bgColor()}"/>${items.map(i => i.svg).join('')}${labels}</svg>`;
        }
        function exportSVG() {
            try { download(new Blob([exportSVGString()], { type: 'image/svg+xml;charset=utf-8' }), `${fileBase()}.svg`); showToast('Saved SVG', 'success'); }
            catch (e) { console.error(e); showToast('SVG export failed', 'error'); }
        }
        function exportPNG() {
            try {
                if (S.view === '3d') {
                    renderer.render(scene, camera); updateAtomLabelsPositions();
                    const src = renderer.domElement, cv = document.createElement('canvas'); cv.width = src.width; cv.height = src.height;
                    const ctx = cv.getContext('2d'), sc = src.width / src.clientWidth;
                    ctx.fillStyle = bgColor(); ctx.fillRect(0, 0, cv.width, cv.height); ctx.drawImage(src, 0, 0);
                    if (S.showLabels) labelElementsList.forEach(it => {      // HTML labels aren't in the WebGL buffer — composite them
                        const op = parseFloat(it.element.style.opacity || '1'); if (op < 0.05) return;
                        ctx.globalAlpha = op; ctx.fillStyle = it.element.style.color;
                        ctx.font = `${S.labelWeight} ${S.labelSize * sc}px ${labelFontFamily()}`;
                        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                        ctx.fillText(it.element.textContent, parseFloat(it.element.style.left) * sc, parseFloat(it.element.style.top) * sc);
                    });
                    ctx.globalAlpha = 1;
                    cv.toBlob(b => { download(b, `${fileBase()}.png`); showToast('Saved PNG', 'success'); });
                } else {
                    const svg = exportSVGString(), img = new Image();
                    img.onload = () => {
                        const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
                        cv.getContext('2d').drawImage(img, 0, 0);
                        cv.toBlob(b => { download(b, `${fileBase()}.png`); showToast('Saved PNG', 'success'); });
                    };
                    img.onerror = () => showToast('PNG export failed', 'error');
                    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
                }
            } catch (e) { console.error(e); showToast('PNG export failed', 'error'); }
        }

        // ══════════════════════ INIT ══════════════════════
        function equationToLatex(raw) {
            const clean = String(raw).replace(/[^A-Za-z0-9+=→⇌(). -]/g, '').trim();
            if (!clean) return '';
            const pieces = clean.replace(/<->|->|→|⇌|=/g, token => `@@${token}@@`).split(/(@@.*?@@)/g);
            return pieces.map(piece => {
                if (piece.startsWith('@@')) {
                    const op = piece.slice(2, -2);
                    return op === '⇌' || op === '<->' ? '\\;\\rightleftharpoons\\;' : '\\;\\rightarrow\\;';
                }
                return piece.split('+').map(term => {
                    const m = term.trim().match(/^(\d+(?:\.\d+)?\s*)?(.*)$/);
                    const coefficient = (m?.[1] || '').trim(), formula = (m?.[2] || '').trim();
                    if (!formula) return coefficient ? `\\mathrm{${coefficient}}` : '';
                    const atoms = formula.replace(/([A-Z][a-z]?|\(|\))(\d*)/g, (_, symbol, count) => {
                        const atom = symbol === '(' || symbol === ')' ? symbol : `\\mathrm{${symbol}}`;
                        return `${atom}${count ? `_{${count}}` : ''}`;
                    });
                    return `${coefficient ? `\\mathrm{${coefficient}}\\,` : ''}${atoms}`;
                }).join('\\;+\\;');
            }).join('');
        }
        function renderEquationPreview() {
            const input = $('equation-input'), preview = $('equation-preview'), dock = $('equation-dock');
            if (!input || !preview) return;
            const text = input.value.trim();
            try {
                const latex = equationToLatex(text);
                if (latex) katex.render(latex, preview, { displayMode: true, throwOnError: false });
                else preview.textContent = 'Enter a reaction to preview its typeset form.';
            } catch (_) { preview.textContent = 'Check the formula characters and try again.'; }
            if (dock) {
                dock.classList.toggle('on', Boolean(S.equationText));
                if (S.equationText) {
                    const dockEquation = $('equation-dock-formula');
                    if (dockEquation) katex.render(equationToLatex(S.equationText), dockEquation, { displayMode: true, throwOnError: false });
                }
            }
        }
        function openModal(id) { const el = $(id); if (!el) return; el.classList.add('open'); el.setAttribute('aria-hidden','false'); el.querySelector('.modal')?.focus(); }
        function closeModal(id) { const el = $(id); if (!el) return; el.classList.remove('open'); el.setAttribute('aria-hidden','true'); }
        function setSidebar(open) {
            $('app').classList.toggle('side-hidden', !open);
            $('btn-sidebar').setAttribute('aria-pressed', open);
        }
        function setAutoRotate(on) { S.autoRotate = on; if (controls) controls.autoRotate = on; saveStored(); syncControls(); }

        export function initialize() {
            try { initThreeJS(); setupPointer3D(); renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); glOk = false; setView('2d'); showToast('3D graphics were interrupted — switched to 2D', 'error'); }); }
            catch (err) {
                console.warn('3D disabled:', err); glOk = false;
                $('seg-view').querySelector('[data-val="3d"]').disabled = true;
                $('gl-error').classList.add('on'); setTimeout(() => $('gl-error').classList.remove('on'), 4000);
            }
            setupPointer2D();
            bindControls();
            mq.addEventListener && mq.addEventListener('change', () => { if (S.appearance === 'auto') applyTheme(); });
            if (window.matchMedia('(max-width:900px)').matches) setSidebar(false);
            applyTheme();                                   // also syncs controls
            loadMolecule(PRESET_MOLECULES.caffeine);
            renderEquationPreview();
            setView(glOk ? S.view : '2d');
            setAutoRotate(S.autoRotate && glOk);
            animate();

            $('search-form').addEventListener('submit', e => { e.preventDefault(); const q = $('molecule-search-input').value.trim().slice(0, 100); if (q) fetchPubChemStructure(q); });
            $('preset-dropdown').addEventListener('change', e => { const m = PRESET_MOLECULES[e.target.value]; if (m) loadMolecule(m); });
            document.querySelectorAll('#seg-view button').forEach(b => b.addEventListener('click', () => setView(b.dataset.val)));
            $('btn-reset-view').addEventListener('click', resetView);
            $('btn-autorotate').addEventListener('click', () => setAutoRotate(!S.autoRotate));
            $('btn-toggle-theme').addEventListener('click', () => { S.appearance = isDark() ? 'light' : 'dark'; onSetting('appearance'); });
            $('btn-sidebar').addEventListener('click', () => setSidebar($('app').classList.contains('side-hidden')));
            $('btn-export-png').addEventListener('click', () => { exportPNG(); closeModal('export-modal'); });
            $('btn-export-svg').addEventListener('click', () => { exportSVG(); closeModal('export-modal'); });
            $('btn-open-settings').addEventListener('click', () => openModal('settings-modal'));
            $('btn-open-equation').addEventListener('click', () => { renderEquationPreview(); openModal('equation-modal'); });
            $('equation-input').value = S.equationText || '';
            $('equation-input').addEventListener('input', renderEquationPreview);
            $('btn-apply-equation').addEventListener('click', () => { S.equationText = $('equation-input').value.trim(); saveStored(); renderEquationPreview(); closeModal('equation-modal'); showToast('Equation saved to this workspace', 'success'); });
            $('btn-clear-equation').addEventListener('click', () => { $('equation-input').value = ''; S.equationText = ''; saveStored(); renderEquationPreview(); });
            $('btn-open-export').addEventListener('click', () => openModal('export-modal'));
            document.querySelectorAll('[data-modal-close]').forEach(b => b.addEventListener('click', () => closeModal(b.closest('.modal-backdrop').id)));
            document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(backdrop.id); }));
            document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.modal-backdrop.open').forEach(m => closeModal(m.id)); });

            document.addEventListener('keydown', e => {
                if (e.metaKey || e.ctrlKey || e.altKey) return;
                const t = e.target; if (t.closest && t.closest('input:not([type=checkbox]):not([type=range]):not([type=color]), select, textarea')) return;
                const k = e.key.toLowerCase();
                if (k === '2') setView('2d'); else if (k === '3') setView('3d');
                else if (k === 'r') resetView();
                else if (k === 'l') { S.showLabels = !S.showLabels; onSetting('showLabels'); }
                else if (k === 'a' && S.view === '3d') setAutoRotate(!S.autoRotate);
                else if (k === 'b') setSidebar($('app').classList.contains('side-hidden'));
                else if (k === '/') { e.preventDefault(); $('molecule-search-input').focus(); }
            });
        }