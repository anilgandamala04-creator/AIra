import { Subject } from '../../types';

export const SENIOR_SECONDARY_GRADES = [
    'Grade 11',
    'Grade 12'
];

export const SENIOR_SECONDARY_CURRICULUM: Record<string, Subject[]> = {
    'Grade 11': [
        {
            id: 'g11-physics',
            name: 'Physics',
            icon: 'zap',
            topics: [
                { id: 'units-measurements', name: 'Units and Measurements', duration: '50 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Chart of SI base units and their relationships to derived units' },
                { id: 'motion-plane', name: 'Motion in a Plane', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Projectile motion trajectory animation with vector components' },
                { id: 'laws-of-motion', name: 'Laws of Motion', duration: '65 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Free-body diagram simulator with customizable forces' },
                { id: 'work-energy-power', name: 'Work, Energy and Power', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Conservation of mechanical energy in a pendulum' },
                { id: 'rotational-motion', name: 'System of Particles and Rotational Motion', duration: '75 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Torque and angular momentum visualization' },
                { id: 'gravitation-11', name: 'Gravitation', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Kepler\'s Laws of planetary motion simulation' },
                { id: 'thermodynamics-11', name: 'Thermodynamics', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'P-V diagrams for isothermal and adiabatic processes' },
                { id: 'kinetic-theory', name: 'Kinetic Theory of Gases', duration: '55 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Gas molecule collision and pressure visualization' },
                { id: 'oscillations', name: 'Oscillations', duration: '60 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Simple Harmonic Motion vs Circular Motion projection' },
                { id: 'waves', name: 'Waves', duration: '60 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Stationary waves and beats interference animation' }
            ]
        },
        {
            id: 'g11-chemistry',
            name: 'Chemistry',
            icon: 'test-tube',
            topics: [
                { id: 'basic-chem-concepts', name: 'Some Basic Concepts of Chemistry', duration: '50 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Mole concept map showing links between mass, volume, and particles' },
                { id: 'structure-atom-11', name: 'Structure of Atom', duration: '65 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Quantum mechanical model of atom with probability clouds' },
                { id: 'classification-elements', name: 'Classification of Elements and Periodicity', duration: '55 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Periodic table highlighting trends in atomic radius and electronegativity' },
                { id: 'chemical-bonding', name: 'Chemical Bonding and Molecular Structure', duration: '70 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'VSEPR geometry interactive 3D models' },
                { id: 'states-of-matter', name: 'States of Matter', duration: '55 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Maxwell-Boltzmann distribution of molecular speeds in different states' },
                { id: 'thermodynamics-chem', name: 'Chemical Thermodynamics', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Enthalpy and entropy change diagrams for various chemical processes' },
                { id: 'equilibrium', name: 'Equilibrium', duration: '75 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Dynamic equilibrium at molecular level (Le Chatelier\'s Principle)' },
                { id: 'redox-reactions', name: 'Redox Reactions', duration: '55 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Electron transfer in electrochemical cells' },
                { id: 'organic-chem-basics', name: 'Organic Chemistry: Basic Principles and Techniques', duration: '75 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Reaction mechanisms: Electrophilic and Nucleophilic substitution' },
                { id: 'hydrocarbons', name: 'Hydrocarbons', duration: '70 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: '3D structural isomers of alkanes, alkenes, and alkynes' }
            ]
        },
        {
            id: 'g11-biology',
            name: 'Biology',
            icon: 'dna',
            topics: [
                { id: 'living-world', name: 'The Living World', duration: '50 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Diversity of life forms classification chart' },
                { id: 'biological-classification', name: 'Biological Classification', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Kingdom classification hierarchy tree' },
                { id: 'plant-kingdom', name: 'Plant Kingdom', duration: '60 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: 'Life cycles of different plant groups: bryophytes, pteridophytes, gymnosperms' },
                { id: 'animal-kingdom', name: 'Animal Kingdom', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Phylum classification chart with key distinguishing features' },
                { id: 'cell-structure', name: 'Cell: The Unit of Life', duration: '60 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: 'Interactive prokaryotic and eukaryotic cell 3D models' },
                { id: 'cell-cycle', name: 'Cell Cycle and Cell Division', duration: '70 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Mitosis and Meiosis cell division animation' }
            ]
        },
        {
            id: 'g11-math',
            name: 'Mathematics',
            icon: 'calculator',
            topics: [
                { id: 'sets', name: 'Sets', duration: '50 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Venn diagrams showing set operations (union, intersection, complement)' },
                { id: 'relations-functions', name: 'Relations and Functions', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Arrow diagrams showing domain, codomain, and range' },
                { id: 'trigonometric-functions', name: 'Trigonometric Functions', duration: '65 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Unit circle animation with all six trigonometric ratios' },
                { id: 'complex-numbers', name: 'Complex Numbers and Quadratic Equations', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Argand plane representation of complex numbers' },
                { id: 'permutations-combinations', name: 'Permutations and Combinations', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Visual counting principles using tree diagrams' },
                { id: 'binomial-theorem', name: 'Binomial Theorem', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Pascal\'s Triangle and binomial expansion visualization' },
                { id: 'limits-derivatives', name: 'Limits and Derivatives', duration: '75 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Interactive tangent line visualization approaching a curve' }
            ]
        },
        {
            id: 'g11-english',
            name: 'English',
            icon: 'book-open',
            topics: [
                { id: 'hornbill-prose', name: 'Hornbill: The Portrait of a Lady', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Character relationship map and thematic visual' },
                { id: 'hornbill-poetry', name: 'Hornbill: A Photograph', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Visual of nostalgia and memory themes through old family photographs' },
                { id: 'snapshots', name: 'Snapshots: The Summer of the Beautiful White Horse', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Story setting visual of rural Armenia and character themes' },
                { id: 'advanced-writing-11', name: 'Advanced Writing: Articles and Reports', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Comparative layout of article vs report formats' }
            ]
        }
    ],
    'Grade 12': [
        {
            id: 'g12-physics',
            name: 'Physics',
            icon: 'zap',
            topics: [
                { id: 'electrostatics', name: 'Electric Charges and Fields', duration: '65 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Electric field lines for point charges and dipoles' },
                { id: 'current-electricity', name: 'Current Electricity', duration: '70 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Wheatstone bridge and Potentiometer circuit simulator' },
                { id: 'moving-charges-mag', name: 'Moving Charges and Magnetism', duration: '75 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Cyclotron and Lorentz force visualization' },
                { id: 'mag-matter', name: 'Magnetism and Matter', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Comparison of diamagnetic, paramagnetic, and ferromagnetic material properties' },
                { id: 'emi', name: 'Electromagnetic Induction', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Lenz\'s Law and AC generator animation' },
                { id: 'alternating-current', name: 'Alternating Current', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Phasor diagrams for LCR circuits' },
                { id: 'em-waves', name: 'Electromagnetic Waves', duration: '45 min', difficulty: 'beginner', visualType: 'animation', visualPrompt: 'Oscillating E and B fields propagation' },
                { id: 'ray-optics', name: 'Ray Optics and Optical Instruments', duration: '75 min', difficulty: 'advanced', visualType: 'interactive', visualPrompt: 'Compound microscope and Telescope ray tracer' },
                { id: 'wave-optics', name: 'Wave Optics', duration: '70 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Young\'s Double Slit Experiment interference pattern' },
                { id: 'dual-nature', name: 'Dual Nature of Radiation and Matter', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Photoelectric effect apparatus animation' },
                { id: 'atoms-nuclei', name: 'Atoms and Nuclei', duration: '65 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Nuclear fission and fusion chain reaction' },
                { id: 'semiconductor-electronics', name: 'Semiconductor Electronics', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'P-N junction diode characteristic curves' }
            ]
        },
        {
            id: 'g12-chemistry',
            name: 'Chemistry',
            icon: 'test-tube',
            topics: [
                { id: 'the-solid-state', name: 'The Solid State', duration: '60 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: 'Crystalline lattice structures (bcc, fcc, hcp) in 3D' },
                { id: 'solutions', name: 'Solutions', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Vapor pressure lowering and boiling point elevation molecular animation' },
                { id: 'electrochemistry', name: 'Electrochemistry', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Galvanic and Electrolytic cell setup diagrams' },
                { id: 'chemical-kinetics', name: 'Chemical Kinetics', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Activation energy and Collision theory energy profile' },
                { id: 'surface-chemistry', name: 'Surface Chemistry', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Physisorption vs chemisorption energy profiles and colloidal types' },
                { id: 'p-block-elements', name: 'The p-Block Elements', duration: '75 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: '3D geometry of oxyacids and interhalogen compounds' },
                { id: 'df-block-elements', name: 'The d- and f- Block Elements', duration: '65 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Visualization of lanthanide contraction and d-orbital transition trends' },
                { id: 'coordination-compounds', name: 'Coordination Compounds', duration: '70 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'Crystal field theory splitting patterns in 3D' },
                { id: 'haloalkanes-haloarenes', name: 'Haloalkanes and Haloarenes', duration: '65 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Walden inversion in SN2 and carbocation stability in SN1 pathways' },
                { id: 'alcohols-phenols-ethers', name: 'Alcohols, Phenols and Ethers', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Acidity of phenols vs alcohols based on resonance stabilization' },
                { id: 'aldehydes-ketones-acids', name: 'Aldehydes, Ketones and Carboxylic Acids', duration: '75 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Nucleophilic addition at carbonyl group and aldol condensation mechanism' },
                { id: 'amines', name: 'Amines', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Basicity order of amines in gaseous vs aqueous phases' },
                { id: 'biomolecules', name: 'Biomolecules', duration: '60 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: 'DNA double helix and protein folding 3D models' }
            ]
        },
        {
            id: 'g12-biology',
            name: 'Biology',
            icon: 'dna',
            topics: [
                { id: 'reproduction-organisms', name: 'Reproduction in Organisms', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Asexual and sexual reproduction comparison chart' },
                { id: 'human-reproduction', name: 'Human Reproduction', duration: '65 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'Human reproductive system 3D anatomy' },
                { id: 'inheritance-variation', name: 'Principles of Inheritance and Variation', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Punnett squares and pedigree charts for genetic inheritance' },
                { id: 'molecular-genetics', name: 'Molecular Basis of Inheritance', duration: '75 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'DNA replication and transcription 3D animation' },
                { id: 'evolution', name: 'Evolution', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Animated evolutionary timeline from origin of life' },
                { id: 'ecology', name: 'Organisms and Populations', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Population ecology graphs and habitat diagrams' }
            ]
        },
        {
            id: 'g12-math',
            name: 'Mathematics',
            icon: 'calculator',
            topics: [
                { id: 'relations-functions-12', name: 'Relations and Functions (Advanced)', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Composite and inverse function mapping diagrams' },
                { id: 'inverse-trig', name: 'Inverse Trigonometric Functions', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Range and domain restrictions for inverse trig functions' },
                { id: 'matrices-determinants', name: 'Matrices and Determinants', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Matrix operations and determinant expansion visualization' },
                { id: 'continuity-differentiability', name: 'Continuity and Differentiability', duration: '65 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Animated discontinuity examples and derivative graphs' },
                { id: 'integrals', name: 'Integrals', duration: '75 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Area under curve visualization using Riemann sums' },
                { id: 'differential-equations', name: 'Differential Equations', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Slope field diagrams for various differential equations' },
                { id: 'probability-12', name: 'Probability (Advanced)', duration: '60 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Bayes\' theorem and conditional probability tree diagrams' }
            ]
        },
        {
            id: 'g12-english',
            name: 'English',
            icon: 'book-open',
            topics: [
                { id: 'flamingo-prose', name: 'Flamingo: The Last Lesson', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'French-Prussian War context and classroom setting visual' },
                { id: 'flamingo-poetry', name: 'Flamingo: My Mother at Sixty-six', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Visual of aging and parent-child relationship themes' },
                { id: 'vistas', name: 'Vistas: The Tiger King', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Satire and irony visual representation in the story' },
                { id: 'advanced-writing-12', name: 'Advanced Writing: Speech and Debate', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Speech structure visual: Opening, Body, Conclusion with rhetorical devices' }
            ]
        }
    ]
};
