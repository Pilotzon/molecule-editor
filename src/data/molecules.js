// Chemistry reference colors and classroom-ready molecule structures.
// Standard Chemical CPK Color Palette with Atomic Radii & Colors
        export const CPK_COLORS = {
            'H':  { color: '#F3F3F1', textColor: '#0F172A', radius: 0.38, name: 'Hydrogen' },
            'C':  { color: '#3F3F3D', textColor: '#FFFFFF', radius: 0.65, name: 'Carbon' },
            'N':  { color: '#4682D5', textColor: '#FFFFFF', radius: 0.60, name: 'Nitrogen' },
            'O':  { color: '#B53333', textColor: '#FFFFFF', radius: 0.55, name: 'Oxygen' },
            'P':  { color: '#A87829', textColor: '#FFFFFF', radius: 0.75, name: 'Phosphorus' },
            'S':  { color: '#D19E41', textColor: '#0F172A', radius: 0.70, name: 'Sulfur' },
            'F':  { color: '#5A9130', textColor: '#FFFFFF', radius: 0.50, name: 'Fluorine' },
            'Cl': { color: '#437426', textColor: '#FFFFFF', radius: 0.65, name: 'Chlorine' },
            'Br': { color: '#7F2C28', textColor: '#FFFFFF', radius: 0.75, name: 'Bromine' },
            'I':  { color: '#5A4878', textColor: '#FFFFFF', radius: 0.85, name: 'Iodine' }
        };

        // Built-in Curriculum Presets
        export const PRESET_MOLECULES = {
            caffeine: {
                name: 'Caffeine',
                formula: 'C8H10N4O2',
                katex: '\\text{C}_8\\text{H}_{10}\\text{N}_4\\text{O}_2',
                desc: 'Central nervous system stimulant purine alkaloid found in coffee.',
                atoms: [
                    { elem: 'C', pos: [-0.8, -0.6, 0.0] },
                    { elem: 'N', pos: [0.5, -0.9, 0.0] },
                    { elem: 'C', pos: [1.2, 0.2, 0.0] },
                    { elem: 'C', pos: [0.5, 1.4, 0.0] },
                    { elem: 'C', pos: [-0.8, 1.2, 0.0] },
                    { elem: 'N', pos: [-1.4, 0.0, 0.0] },
                    { elem: 'O', pos: [-1.4, -1.7, 0.0] },
                    { elem: 'O', pos: [1.0, 2.5, 0.0] },
                    { elem: 'N', pos: [2.5, 0.0, 0.0] },
                    { elem: 'C', pos: [2.6, -1.3, 0.0] },
                    { elem: 'N', pos: [1.4, -1.9, 0.0] },
                    { elem: 'C', pos: [-2.8, -0.1, 0.0] },
                    { elem: 'C', pos: [-1.5, 2.4, 0.0] },
                    { elem: 'C', pos: [3.7, 0.8, 0.0] },
                    { elem: 'H', pos: [3.5, -1.9, 0.0] },
                    { elem: 'H', pos: [-3.2, 0.4, 0.9] }, { elem: 'H', pos: [-3.2, 0.4, -0.9] }, { elem: 'H', pos: [-3.1, -1.1, 0.0] },
                    { elem: 'H', pos: [-2.6, 2.3, 0.0] }, { elem: 'H', pos: [-1.2, 3.0, 0.9] }, { elem: 'H', pos: [-1.2, 3.0, -0.9] },
                    { elem: 'H', pos: [4.6, 0.2, 0.0] }, { elem: 'H', pos: [3.7, 1.4, 0.9] }, { elem: 'H', pos: [3.7, 1.4, -0.9] }
                ],
                bonds: [
                    { from: 0, to: 1, type: 1 }, { from: 1, to: 2, type: 1 }, { from: 2, to: 3, type: 2 },
                    { from: 3, to: 4, type: 1 }, { from: 4, to: 5, type: 1 }, { from: 5, to: 0, type: 1 },
                    { from: 0, to: 6, type: 2 }, { from: 4, to: 7, type: 2 }, { from: 2, to: 8, type: 1 },
                    { from: 8, to: 9, type: 1 }, { from: 9, to: 10, type: 2 }, { from: 10, to: 1, type: 1 },
                    { from: 5, to: 11, type: 1 }, { from: 3, to: 12, type: 1 }, { from: 8, to: 13, type: 1 },
                    { from: 9, to: 14, type: 1 }, { from: 11, to: 15, type: 1 }, { from: 11, to: 16, type: 1 },
                    { from: 11, to: 17, type: 1 }, { from: 12, to: 18, type: 1 }, { from: 12, to: 19, type: 1 },
                    { from: 12, to: 20, type: 1 }, { from: 13, to: 21, type: 1 }, { from: 13, to: 22, type: 1 },
                    { from: 13, to: 23, type: 1 }
                ]
            },
            water: {
                name: 'Water',
                formula: 'H2O',
                katex: '\\text{H}_2\\text{O}',
                desc: 'V-shaped polar inorganic molecule fundamental for life.',
                atoms: [
                    { elem: 'O', pos: [0.0, 0.1, 0.0] },
                    { elem: 'H', pos: [-0.85, -0.5, 0.0] },
                    { elem: 'H', pos: [0.85, -0.5, 0.0] }
                ],
                bonds: [
                    { from: 0, to: 1, type: 1 },
                    { from: 0, to: 2, type: 1 }
                ]
            },
            co2: {
                name: 'Carbon Dioxide',
                formula: 'CO2',
                katex: '\\text{CO}_2',
                desc: 'Linear non-polar greenhouse gas molecule.',
                atoms: [
                    { elem: 'C', pos: [0.0, 0.0, 0.0] },
                    { elem: 'O', pos: [-1.4, 0.0, 0.0] },
                    { elem: 'O', pos: [1.4, 0.0, 0.0] }
                ],
                bonds: [
                    { from: 0, to: 1, type: 2 },
                    { from: 0, to: 2, type: 2 }
                ]
            },
            methane: {
                name: 'Methane',
                formula: 'CH4',
                katex: '\\text{CH}_4',
                desc: 'Tetrahedral organic molecule, primary constituent of natural gas.',
                atoms: [
                    { elem: 'C', pos: [0.0, 0.0, 0.0] },
                    { elem: 'H', pos: [0.63, 0.63, 0.63] },
                    { elem: 'H', pos: [-0.63, -0.63, 0.63] },
                    { elem: 'H', pos: [-0.63, 0.63, -0.63] },
                    { elem: 'H', pos: [0.63, -0.63, -0.63] }
                ],
                bonds: [
                    { from: 0, to: 1, type: 1 }, { from: 0, to: 2, type: 1 },
                    { from: 0, to: 3, type: 1 }, { from: 0, to: 4, type: 1 }
                ]
            },
            ethanol: {
                name: 'Ethanol',
                formula: 'C2H6O',
                katex: '\\text{C}_2\\text{H}_6\\text{O}',
                desc: 'Primary simple alcohol compound found in beverages.',
                atoms: [
                    { elem: 'C', pos: [-1.1, -0.2, 0.0] },
                    { elem: 'C', pos: [0.2, 0.5, 0.0] },
                    { elem: 'O', pos: [1.3, -0.4, 0.0] },
                    { elem: 'H', pos: [2.1, 0.1, 0.0] },
                    { elem: 'H', pos: [-1.1, -0.8, 0.9] }, { elem: 'H', pos: [-1.1, -0.8, -0.9] }, { elem: 'H', pos: [-1.9, 0.5, 0.0] },
                    { elem: 'H', pos: [0.2, 1.1, 0.9] }, { elem: 'H', pos: [0.2, 1.1, -0.9] }
                ],
                bonds: [
                    { from: 0, to: 1, type: 1 }, { from: 1, to: 2, type: 1 }, { from: 2, to: 3, type: 1 },
                    { from: 0, to: 4, type: 1 }, { from: 0, to: 5, type: 1 }, { from: 0, to: 6, type: 1 },
                    { from: 1, to: 7, type: 1 }, { from: 1, to: 8, type: 1 }
                ]
            },
            benzene: {
                name: 'Benzene',
                formula: 'C6H6',
                katex: '\\text{C}_6\\text{H}_6',
                desc: 'Planar aromatic hydrocarbon ring with delocalized pi electrons.',
                atoms: [
                    { elem: 'C', pos: [1.4, 0.0, 0.0] }, { elem: 'C', pos: [0.7, 1.21, 0.0] },
                    { elem: 'C', pos: [-0.7, 1.21, 0.0] }, { elem: 'C', pos: [-1.4, 0.0, 0.0] },
                    { elem: 'C', pos: [-0.7, -1.21, 0.0] }, { elem: 'C', pos: [0.7, -1.21, 0.0] },
                    { elem: 'H', pos: [2.4, 0.0, 0.0] }, { elem: 'H', pos: [1.2, 2.08, 0.0] },
                    { elem: 'H', pos: [-1.2, 2.08, 0.0] }, { elem: 'H', pos: [-2.4, 0.0, 0.0] },
                    { elem: 'H', pos: [-1.2, -2.08, 0.0] }, { elem: 'H', pos: [1.2, -2.08, 0.0] }
                ],
                bonds: [
                    { from: 0, to: 1, type: 2 }, { from: 1, to: 2, type: 1 }, { from: 2, to: 3, type: 2 },
                    { from: 3, to: 4, type: 1 }, { from: 4, to: 5, type: 2 }, { from: 5, to: 0, type: 1 },
                    { from: 0, to: 6, type: 1 }, { from: 1, to: 7, type: 1 }, { from: 2, to: 8, type: 1 },
                    { from: 3, to: 9, type: 1 }, { from: 4, to: 10, type: 1 }, { from: 5, to: 11, type: 1 }
                ]
            },
            aspirin: {
                name: 'Aspirin',
                formula: 'C9H8O4',
                katex: '\\text{C}_9\\text{H}_8\\text{O}_4',
                desc: 'Acetylsalicylic acid, common nonsteroidal anti-inflammatory medication.',
                atoms: [
                    { elem: 'C', pos: [0.0, 0.0, 0.0] }, { elem: 'C', pos: [1.2, 0.7, 0.0] },
                    { elem: 'C', pos: [2.4, 0.0, 0.0] }, { elem: 'C', pos: [2.4, -1.4, 0.0] },
                    { elem: 'C', pos: [1.2, -2.1, 0.0] }, { elem: 'C', pos: [0.0, -1.4, 0.0] },
                    { elem: 'C', pos: [-1.2, 0.8, 0.0] }, { elem: 'O', pos: [-2.4, 0.3, 0.0] },
                    { elem: 'O', pos: [-1.0, 2.0, 0.0] }, { elem: 'O', pos: [1.2, 2.1, 0.0] },
                    { elem: 'C', pos: [2.3, 2.9, 0.0] }, { elem: 'O', pos: [3.4, 2.4, 0.0] },
                    { elem: 'C', pos: [2.0, 4.3, 0.0] }, { elem: 'H', pos: [-3.0, 0.9, 0.0] },
                    { elem: 'H', pos: [3.3, 0.5, 0.0] }, { elem: 'H', pos: [3.3, -1.9, 0.0] },
                    { elem: 'H', pos: [1.2, -3.2, 0.0] }, { elem: 'H', pos: [-0.9, -1.9, 0.0] },
                    { elem: 'H', pos: [1.0, 4.6, 0.0] }, { elem: 'H', pos: [2.5, 4.8, 0.8] }, { elem: 'H', pos: [2.5, 4.8, -0.8] }
                ],
                bonds: [
                    { from: 0, to: 1, type: 2 }, { from: 1, to: 2, type: 1 }, { from: 2, to: 3, type: 2 },
                    { from: 3, to: 4, type: 1 }, { from: 4, to: 5, type: 2 }, { from: 5, to: 0, type: 1 },
                    { from: 0, to: 6, type: 1 }, { from: 6, to: 7, type: 1 }, { from: 6, to: 8, type: 2 },
                    { from: 1, to: 9, type: 1 }, { from: 9, to: 10, type: 1 }, { from: 10, to: 11, type: 2 },
                    { from: 10, to: 12, type: 1 }, { from: 7, to: 13, type: 1 }, { from: 2, to: 14, type: 1 },
                    { from: 3, to: 15, type: 1 }, { from: 4, to: 16, type: 1 }, { from: 5, to: 17, type: 1 },
                    { from: 12, to: 18, type: 1 }, { from: 12, to: 19, type: 1 }, { from: 12, to: 20, type: 1 }
                ]
            },
            glycine: {
                name: 'Glycine',
                formula: 'C2H5NO2',
                katex: '\\text{C}_2\\text{H}_5\\text{NO}_2',
                desc: 'Simplest stable amino acid with a hydrogen side-chain.',
                atoms: [
                    { elem: 'C', pos: [0.0, -0.4, 0.0] }, { elem: 'C', pos: [1.2, 0.4, 0.0] },
                    { elem: 'O', pos: [1.2, 1.6, 0.0] }, { elem: 'O', pos: [2.3, -0.3, 0.0] },
                    { elem: 'H', pos: [3.0, 0.2, 0.0] }, { elem: 'N', pos: [-1.2, 0.4, 0.0] },
                    { elem: 'H', pos: [-1.3, 1.0, 0.8] }, { elem: 'H', pos: [-1.3, 1.0, -0.8] },
                    { elem: 'H', pos: [0.0, -1.0, 0.9] }, { elem: 'H', pos: [0.0, -1.0, -0.9] }
                ],
                bonds: [
                    { from: 0, to: 1, type: 1 }, { from: 1, to: 2, type: 2 }, { from: 1, to: 3, type: 1 },
                    { from: 3, to: 4, type: 1 }, { from: 0, to: 5, type: 1 }, { from: 5, to: 6, type: 1 },
                    { from: 5, to: 7, type: 1 }, { from: 0, to: 8, type: 1 }, { from: 0, to: 9, type: 1 }
                ]
            }
        };

        // ── Extensions to the original data ─────────────────────────────
        // More elements (CPK-style colors), atomic numbers, and the Glucose preset that the
        // original dropdown listed but never defined (selecting it did nothing).
        Object.assign(CPK_COLORS, {
            'Li': { color: '#9675B0', radius: 0.9,  name: 'Lithium' },
            'B':  { color: '#D2A08F', radius: 0.7,  name: 'Boron' },
            'Na': { color: '#697FA8', radius: 1.0,  name: 'Sodium' },
            'Mg': { color: '#78A466', radius: 0.95, name: 'Magnesium' },
            'Si': { color: '#BFAD8F', radius: 0.8,  name: 'Silicon' },
            'K':  { color: '#806A9B', radius: 1.1,  name: 'Potassium' },
            'Ca': { color: '#79A144', radius: 1.0,  name: 'Calcium' },
            'Fe': { color: '#A87829', radius: 0.8,  name: 'Iron' },
            'Cu': { color: '#A87829', radius: 0.8,  name: 'Copper' },
            'Zn': { color: '#8A9BAE', radius: 0.8,  name: 'Zinc' }
        });
        export const ATOMIC_NUM = { H:1, Li:3, B:5, C:6, N:7, O:8, F:9, Na:11, Mg:12, Si:14, P:15, S:16, Cl:17, K:19, Ca:20, Fe:26, Cu:29, Zn:30, Br:35, I:53 };
        export const DEFAULT_ELEM = { color: '#8C8B86', radius: 0.6 };

        PRESET_MOLECULES.glucose = {
            name: 'Glucose', formula: 'C6H12O6',
            katex: '\\text{C}_6\\text{H}_{12}\\text{O}_6',
            desc: 'β-D-glucopyranose in its chair form, the body’s main sugar fuel.',
            atoms: [
                { elem:'C', pos:[1.45,0,0.25] }, { elem:'C', pos:[0.725,1.256,-0.25] }, { elem:'C', pos:[-0.725,1.256,0.25] },
                { elem:'C', pos:[-1.45,0,-0.25] }, { elem:'C', pos:[-0.725,-1.256,0.25] }, { elem:'O', pos:[0.725,-1.256,-0.25] },
                { elem:'C', pos:[-1.43,-2.47,-0.1] }, { elem:'O', pos:[2.8,0.1,-0.1] }, { elem:'O', pos:[1.43,2.47,0.1] },
                { elem:'O', pos:[-1.43,2.47,-0.1] }, { elem:'O', pos:[-2.85,0,0.1] }, { elem:'O', pos:[-1.9,-3.7,0.3] },
                { elem:'H', pos:[1.5,0,1.35] }, { elem:'H', pos:[0.73,1.26,-1.35] }, { elem:'H', pos:[-0.73,1.26,1.35] },
                { elem:'H', pos:[-1.45,0,-1.35] }, { elem:'H', pos:[-0.73,-1.26,1.35] }, { elem:'H', pos:[-0.55,-2.75,0.5] },
                { elem:'H', pos:[-1.9,-2.0,-1.0] }, { elem:'H', pos:[3.3,-0.65,-0.3] }, { elem:'H', pos:[2.2,2.9,0.4] },
                { elem:'H', pos:[-2.2,2.9,-0.4] }, { elem:'H', pos:[-3.4,0.7,0.3] }, { elem:'H', pos:[-2.6,-4.2,0.0] }
            ],
            bonds: [
                {from:0,to:1,type:1},{from:1,to:2,type:1},{from:2,to:3,type:1},{from:3,to:4,type:1},{from:4,to:5,type:1},{from:5,to:0,type:1},{from:4,to:6,type:1},
                {from:0,to:7,type:1},{from:1,to:8,type:1},{from:2,to:9,type:1},{from:3,to:10,type:1},{from:6,to:11,type:1},
                {from:0,to:12,type:1},{from:1,to:13,type:1},{from:2,to:14,type:1},{from:3,to:15,type:1},{from:4,to:16,type:1},{from:6,to:17,type:1},{from:6,to:18,type:1},
                {from:7,to:19,type:1},{from:8,to:20,type:1},{from:9,to:21,type:1},{from:10,to:22,type:1},{from:11,to:23,type:1}
            ]
        };


        // Caffeine: the original coordinates/bonds put a methyl on a ring carbon and crossed bonds through atoms.
        // Rebuilt as the real purine skeleton (1,3,7-trimethylxanthine) with planar, non-overlapping geometry.
        PRESET_MOLECULES.caffeine = {
            name: 'Caffeine', formula: 'C8H10N4O2',
            katex: '\\text{C}_8\\text{H}_{10}\\text{N}_4\\text{O}_2',
            desc: 'Central nervous system stimulant purine alkaloid found in coffee.',
            atoms: [
                { elem:'N', pos:[-1.21, 0.7, 0.0] },
                { elem:'C', pos:[-1.21, -0.7, 0.0] },
                { elem:'N', pos:[0, -1.4, 0.0] },
                { elem:'C', pos:[1.21, -0.7, 0.0] },
                { elem:'C', pos:[1.21, 0.7, 0.0] },
                { elem:'C', pos:[0, 1.4, 0.0] },
                { elem:'O', pos:[-2.27, -1.31, 0.0] },
                { elem:'O', pos:[0, 2.62, 0.0] },
                { elem:'N', pos:[2.54, 1.13, 0.0] },
                { elem:'C', pos:[3.37, 0.0, 0.0] },
                { elem:'N', pos:[2.54, -1.13, 0.0] },
                { elem:'C', pos:[-2.48, 1.44, 0.0] },
                { elem:'C', pos:[0.0, -2.87, 0.0] },
                { elem:'C', pos:[3.0, 2.53, 0.0] },
                { elem:'H', pos:[-3.31, 0.73, 0.0] },
                { elem:'H', pos:[-2.54, 2.06, 0.89] },
                { elem:'H', pos:[-2.54, 2.06, -0.89] },
                { elem:'H', pos:[1.02, -3.23, 0.0] },
                { elem:'H', pos:[-0.51, -3.23, 0.89] },
                { elem:'H', pos:[-0.51, -3.23, -0.89] },
                { elem:'H', pos:[2.13, 3.19, 0.0] },
                { elem:'H', pos:[3.6, 2.71, 0.89] },
                { elem:'H', pos:[3.6, 2.71, -0.89] },
                { elem:'H', pos:[4.45, 0, 0] }
            ],
            bonds: [{from:0,to:1,type:1}, {from:1,to:2,type:1}, {from:2,to:3,type:1}, {from:3,to:4,type:2}, {from:4,to:5,type:1}, {from:5,to:0,type:1}, {from:5,to:7,type:2}, {from:1,to:6,type:2}, {from:0,to:11,type:1}, {from:2,to:12,type:1}, {from:4,to:8,type:1}, {from:8,to:9,type:1}, {from:9,to:10,type:2}, {from:10,to:3,type:1}, {from:8,to:13,type:1}, {from:11,to:14,type:1}, {from:11,to:15,type:1}, {from:11,to:16,type:1}, {from:12,to:17,type:1}, {from:12,to:18,type:1}, {from:12,to:19,type:1}, {from:13,to:20,type:1}, {from:13,to:21,type:1}, {from:13,to:22,type:1}, {from:9,to:23,type:1}]
        };

        