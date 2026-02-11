import { Subject } from '../../types';

// Intermediate Groups/Streams
export const INTERMEDIATE_GROUPS = [
    'MPC',   // Mathematics, Physics, Chemistry
    'BiPC',  // Biology, Physics, Chemistry
    'CEC',   // Commerce, Economics, Civics
    'MEC',   // Mathematics, Economics, Commerce
    'HEC',   // History, Economics, Civics
];

export const INTERMEDIATE_YEARS = [
    'Inter 1st Year',
    'Inter 2nd Year'
];

// Group-wise subject mapping
export const GROUP_SUBJECTS: Record<string, string[]> = {
    'MPC': ['Mathematics', 'Physics', 'Chemistry'],
    'BiPC': ['Biology', 'Physics', 'Chemistry'],
    'CEC': ['Commerce', 'Economics', 'Civics'],
    'MEC': ['Mathematics', 'Economics', 'Commerce'],
    'HEC': ['History', 'Economics', 'Civics'],
};

// MPC Group Curriculum
export const MPC_CURRICULUM: Record<string, Subject[]> = {
    'Inter 1st Year': [
        {
            id: 'mpc-i1-math',
            name: 'Mathematics',
            icon: 'calculator',
            topics: [
                { id: 'functions', name: 'Functions', duration: '65 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Domain, codomain, and range mapping diagrams' },
                { id: 'mathematical-induction', name: 'Mathematical Induction', duration: '60 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Step-by-step induction proof visualization' },
                { id: 'matrices-i1', name: 'Matrices', duration: '70 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Matrix operations and multiplication visualization' },
                { id: 'addition-vectors', name: 'Addition of Vectors', duration: '55 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Vector addition using parallelogram law animation' },
                { id: 'product-vectors', name: 'Product of Vectors', duration: '65 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: '3D visualization of dot and cross products' },
                { id: 'trigonometric-ratios', name: 'Trigonometric Ratios', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Unit circle animation showing all trigonometric ratios' },
                { id: 'trigonometric-equations', name: 'Trigonometric Equations', duration: '65 min', difficulty: 'advanced', visualType: 'interactive', visualPrompt: 'Interactive equation solver with graphical solutions' },
                { id: 'hyperbolic-functions', name: 'Hyperbolic Functions', duration: '55 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Graphs of hyperbolic functions and their inverses' },
            ]
        },
        {
            id: 'mpc-i1-physics',
            name: 'Physics',
            icon: 'zap',
            topics: [
                { id: 'physical-world', name: 'Physical World', duration: '45 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Branches of physics and their interconnections' },
                { id: 'units-dimensions', name: 'Units and Dimensions', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Dimensional analysis flowchart' },
                { id: 'motion-straight-line', name: 'Motion in a Straight Line', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Position-time and velocity-time graph animations' },
                { id: 'motion-plane-i1', name: 'Motion in a Plane', duration: '65 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Projectile motion with air resistance visualization' },
                { id: 'laws-motion-i1', name: 'Laws of Motion', duration: '70 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Free body diagram builder with force calculations' },
                { id: 'work-energy-i1', name: 'Work, Energy and Power', duration: '65 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Energy transformation in various mechanical systems' },
                { id: 'oscillations', name: 'Oscillations', duration: '70 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Simple harmonic motion with phase diagrams' },
                { id: 'waves-i1', name: 'Waves', duration: '75 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Transverse and longitudinal wave propagation' },
            ]
        },
        {
            id: 'mpc-i1-chemistry',
            name: 'Chemistry',
            icon: 'test-tube',
            topics: [
                { id: 'atomic-structure-i1', name: 'Atomic Structure', duration: '65 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: 'Bohr and quantum mechanical atomic models' },
                { id: 'classification-elements', name: 'Classification of Elements', duration: '55 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Interactive periodic table with electron configurations' },
                { id: 'chemical-bonding-i1', name: 'Chemical Bonding and Molecular Structure', duration: '75 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'VSEPR theory molecular geometries in 3D' },
                { id: 'states-matter', name: 'States of Matter: Gases and Liquids', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Kinetic theory and gas law animations' },
                { id: 'thermodynamics-i1', name: 'Thermodynamics', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Enthalpy diagrams and Hess law visualization' },
                { id: 'equilibrium-i1', name: 'Equilibrium', duration: '65 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Dynamic equilibrium and Le Chatelier principle' },
                { id: 'stoichiometry', name: 'Stoichiometry', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Mole concept and balanced equation calculations' },
            ]
        }
    ],
    'Inter 2nd Year': [
        {
            id: 'mpc-i2-math',
            name: 'Mathematics',
            icon: 'calculator',
            topics: [
                { id: 'circles', name: 'Circles', duration: '65 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Circle equations and tangent line explorer' },
                { id: 'system-circles', name: 'System of Circles', duration: '60 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Radical axis and coaxial circles visualization' },
                { id: 'parabola', name: 'Parabola', duration: '65 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Parabola focus, directrix, and tangent playground' },
                { id: 'ellipse', name: 'Ellipse', duration: '60 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Ellipse properties with foci and eccentricity controls' },
                { id: 'hyperbola', name: 'Hyperbola', duration: '65 min', difficulty: 'advanced', visualType: 'interactive', visualPrompt: 'Hyperbola asymptotes and rectangular hyperbola' },
                { id: 'integration-i2', name: 'Integration', duration: '80 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Area under curve and definite integral visualization' },
                { id: 'differential-equations-i2', name: 'Differential Equations', duration: '75 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Slope fields and solution curves' },
                { id: 'probability-i2', name: 'Probability', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Probability distributions and Bayes theorem visual' },
            ]
        },
        {
            id: 'mpc-i2-physics',
            name: 'Physics',
            icon: 'zap',
            topics: [
                { id: 'waves-optics', name: 'Wave Optics', duration: '70 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Interference and diffraction pattern simulations' },
                { id: 'ray-optics-i2', name: 'Ray Optics and Optical Instruments', duration: '75 min', difficulty: 'advanced', visualType: 'interactive', visualPrompt: 'Lens and mirror ray tracing simulator' },
                { id: 'electrostatics-i2', name: 'Electrostatics', duration: '70 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Electric field lines and equipotential surfaces' },
                { id: 'current-electricity-i2', name: 'Current Electricity', duration: '65 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Circuit builder with ammeter and voltmeter' },
                { id: 'magnetism-i2', name: 'Moving Charges and Magnetism', duration: '75 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'Magnetic field around current-carrying conductors' },
                { id: 'electromagnetic-induction', name: 'Electromagnetic Induction', duration: '70 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Faraday law and Lenz law demonstrations' },
                { id: 'atoms-nuclei-i2', name: 'Atoms and Nuclei', duration: '65 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Nuclear reactions and binding energy curve' },
                { id: 'semiconductors', name: 'Semiconductor Electronics', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'P-N junction and transistor operations' },
            ]
        },
        {
            id: 'mpc-i2-chemistry',
            name: 'Chemistry',
            icon: 'test-tube',
            topics: [
                { id: 'solid-state-i2', name: 'Solid State', duration: '65 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: 'Crystal lattice structures and unit cells' },
                { id: 'solutions-i2', name: 'Solutions', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Colligative properties and Raoult law' },
                { id: 'electrochemistry-i2', name: 'Electrochemistry', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Electrochemical cells and Nernst equation' },
                { id: 'chemical-kinetics-i2', name: 'Chemical Kinetics', duration: '65 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Rate laws and reaction mechanisms' },
                { id: 'organic-chemistry-i2', name: 'Organic Chemistry: Hydrocarbons', duration: '75 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'Alkanes, alkenes, alkynes molecular structures' },
                { id: 'haloalkanes', name: 'Haloalkanes and Haloarenes', duration: '65 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'SN1 and SN2 reaction mechanisms' },
                { id: 'alcohols-phenols', name: 'Alcohols, Phenols and Ethers', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Functional group reactions flowchart' },
                { id: 'polymers', name: 'Polymers', duration: '55 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: 'Polymer chain structures and classifications' },
            ]
        }
    ]
};

// BiPC Group Curriculum
export const BIPC_CURRICULUM: Record<string, Subject[]> = {
    'Inter 1st Year': [
        {
            id: 'bipc-i1-biology',
            name: 'Biology',
            icon: 'dna',
            topics: [
                { id: 'diversity-living', name: 'Diversity in the Living World', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Taxonomic hierarchy and classification systems' },
                { id: 'structural-org-plants', name: 'Structural Organisation in Plants', duration: '65 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: 'Plant tissue systems and anatomy' },
                { id: 'structural-org-animals', name: 'Structural Organisation in Animals', duration: '70 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: 'Animal tissue types and organ systems' },
                { id: 'cell-structure-bio', name: 'Cell Structure and Function', duration: '75 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'Detailed cell organelle 3D models' },
                { id: 'plant-physiology', name: 'Plant Physiology', duration: '80 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Photosynthesis and respiration processes' },
                { id: 'human-physiology-i1', name: 'Human Physiology', duration: '85 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'Major organ systems interactive anatomy' },
            ]
        },
        {
            id: 'bipc-i1-physics',
            name: 'Physics',
            icon: 'zap',
            topics: [
                { id: 'physical-world-bi', name: 'Physical World', duration: '45 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Branches of physics overview' },
                { id: 'units-dimensions-bi', name: 'Units and Dimensions', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'SI units and dimensional analysis' },
                { id: 'motion-bi', name: 'Motion', duration: '65 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Kinematics graphs and equations' },
                { id: 'laws-motion-bi', name: 'Laws of Motion', duration: '70 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Force analysis simulator' },
                { id: 'work-energy-bi', name: 'Work and Energy', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Energy conservation demonstrations' },
                { id: 'thermal-properties', name: 'Thermal Properties of Matter', duration: '65 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Heat transfer mechanisms' },
            ]
        },
        {
            id: 'bipc-i1-chemistry',
            name: 'Chemistry',
            icon: 'test-tube',
            topics: [
                { id: 'atomic-structure-bi', name: 'Atomic Structure', duration: '65 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: 'Quantum mechanical model of atom' },
                { id: 'periodic-table-bi', name: 'Classification of Elements', duration: '55 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Interactive periodic table' },
                { id: 'chemical-bonding-bi', name: 'Chemical Bonding', duration: '70 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'Molecular orbital diagrams' },
                { id: 'states-matter-bi', name: 'States of Matter', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Gas laws and liquid properties' },
                { id: 'thermodynamics-bi', name: 'Thermodynamics', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Thermodynamic cycles and energy diagrams' },
                { id: 'equilibrium-bi', name: 'Equilibrium', duration: '65 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Chemical equilibrium dynamics' },
            ]
        }
    ],
    'Inter 2nd Year': [
        {
            id: 'bipc-i2-biology',
            name: 'Biology',
            icon: 'dna',
            topics: [
                { id: 'reproduction-organisms', name: 'Reproduction in Organisms', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Asexual and sexual reproduction comparison' },
                { id: 'human-reproduction-i2', name: 'Human Reproduction', duration: '70 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'Reproductive system anatomy' },
                { id: 'genetics-inheritance', name: 'Genetics and Inheritance', duration: '80 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Punnett squares and pedigree charts' },
                { id: 'molecular-genetics', name: 'Molecular Genetics', duration: '85 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'DNA replication and protein synthesis' },
                { id: 'evolution-bio', name: 'Evolution', duration: '65 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Evolutionary timeline and mechanisms' },
                { id: 'biotechnology', name: 'Biotechnology and its Applications', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Genetic engineering techniques' },
                { id: 'ecology-environment', name: 'Ecology and Environment', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Ecosystem structure and food webs' },
            ]
        },
        {
            id: 'bipc-i2-physics',
            name: 'Physics',
            icon: 'zap',
            topics: [
                { id: 'ray-optics-bi', name: 'Ray Optics', duration: '70 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Lens and mirror ray diagrams' },
                { id: 'wave-optics-bi', name: 'Wave Optics', duration: '65 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Interference patterns' },
                { id: 'electrostatics-bi', name: 'Electrostatics', duration: '65 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Electric field visualization' },
                { id: 'current-electricity-bi', name: 'Current Electricity', duration: '60 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Circuit analysis tool' },
                { id: 'magnetism-bi', name: 'Magnetism', duration: '65 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: 'Magnetic field patterns' },
                { id: 'modern-physics-bi', name: 'Modern Physics', duration: '70 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Photoelectric effect and atomic models' },
            ]
        },
        {
            id: 'bipc-i2-chemistry',
            name: 'Chemistry',
            icon: 'test-tube',
            topics: [
                { id: 'solid-state-bi', name: 'Solid State', duration: '60 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: 'Crystal structures' },
                { id: 'solutions-bi', name: 'Solutions', duration: '55 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Colligative properties' },
                { id: 'electrochemistry-bi', name: 'Electrochemistry', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Electrochemical cells' },
                { id: 'organic-chem-bi', name: 'Organic Chemistry', duration: '75 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'Organic compound structures' },
                { id: 'biomolecules-bi', name: 'Biomolecules', duration: '65 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: 'Protein and nucleic acid structures' },
                { id: 'chemistry-everyday', name: 'Chemistry in Everyday Life', duration: '50 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Medicines and materials applications' },
            ]
        }
    ]
};

// CEC Group Curriculum (Commerce, Economics, Civics)
export const CEC_CURRICULUM: Record<string, Subject[]> = {
    'Inter 1st Year': [
        {
            id: 'cec-i1-commerce',
            name: 'Commerce',
            icon: 'briefcase',
            topics: [
                { id: 'nature-business', name: 'Nature and Purpose of Business', duration: '50 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Business types and objectives flowchart' },
                { id: 'forms-business-org', name: 'Forms of Business Organisation', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Sole proprietorship to corporation comparison' },
                { id: 'business-services', name: 'Business Services', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Banking, insurance, and transport services map' },
                { id: 'emerging-business', name: 'Emerging Modes of Business', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'E-commerce and outsourcing models' },
                { id: 'social-responsibility', name: 'Social Responsibility of Business', duration: '45 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'CSR framework and stakeholder map' },
                { id: 'internal-trade', name: 'Internal Trade', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Wholesale and retail distribution channels' },
            ]
        },
        {
            id: 'cec-i1-economics',
            name: 'Economics',
            icon: 'trending-up',
            topics: [
                { id: 'intro-economics', name: 'Introduction to Economics', duration: '50 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Economic problem and basic concepts' },
                { id: 'consumer-equilibrium', name: 'Consumer Equilibrium', duration: '65 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Utility curves and budget lines' },
                { id: 'demand-supply', name: 'Demand and Supply', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Supply-demand curves and equilibrium' },
                { id: 'elasticity', name: 'Elasticity of Demand and Supply', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Price elasticity graphs' },
                { id: 'production-cost', name: 'Production and Costs', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Cost curves and production function' },
                { id: 'market-forms', name: 'Forms of Market', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Perfect competition to monopoly spectrum' },
            ]
        },
        {
            id: 'cec-i1-civics',
            name: 'Civics',
            icon: 'landmark',
            topics: [
                { id: 'indian-constitution', name: 'Indian Constitution', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Constitutional structure and preamble' },
                { id: 'fundamental-rights', name: 'Fundamental Rights', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Rights and their scope visualization' },
                { id: 'directive-principles', name: 'Directive Principles of State Policy', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'DPSP categories and implementation' },
                { id: 'union-executive', name: 'Union Executive', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'President, PM, and Council of Ministers' },
                { id: 'parliament', name: 'Parliament', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Lok Sabha and Rajya Sabha structure' },
                { id: 'judiciary', name: 'Judiciary', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Supreme Court and judicial hierarchy' },
            ]
        }
    ],
    'Inter 2nd Year': [
        {
            id: 'cec-i2-commerce',
            name: 'Commerce',
            icon: 'briefcase',
            topics: [
                { id: 'principles-management', name: 'Principles of Management', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Management functions and principles' },
                { id: 'business-environment', name: 'Business Environment', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Internal and external environment factors' },
                { id: 'planning', name: 'Planning', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Planning process and types' },
                { id: 'organising', name: 'Organising', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Organizational structures' },
                { id: 'directing', name: 'Directing', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Leadership styles and motivation theories' },
                { id: 'controlling', name: 'Controlling', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Control process and techniques' },
                { id: 'financial-management', name: 'Financial Management', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Capital structure and financing decisions' },
            ]
        },
        {
            id: 'cec-i2-economics',
            name: 'Economics',
            icon: 'trending-up',
            topics: [
                { id: 'national-income', name: 'National Income Accounting', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'GDP, GNP, and circular flow' },
                { id: 'money-banking', name: 'Money and Banking', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Banking system and money creation' },
                { id: 'aggregate-demand-supply', name: 'Aggregate Demand and Supply', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'AD-AS model and equilibrium' },
                { id: 'government-budget', name: 'Government Budget', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Budget components and fiscal policy' },
                { id: 'balance-payments', name: 'Balance of Payments', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'BOP accounts and forex market' },
                { id: 'indian-economy', name: 'Indian Economy', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Economic development indicators' },
            ]
        },
        {
            id: 'cec-i2-civics',
            name: 'Civics',
            icon: 'landmark',
            topics: [
                { id: 'state-executive', name: 'State Executive', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Governor and Chief Minister roles' },
                { id: 'state-legislature', name: 'State Legislature', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'State assembly structure' },
                { id: 'local-government', name: 'Local Government', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Panchayati Raj and municipal bodies' },
                { id: 'election-commission', name: 'Election Commission', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Electoral process in India' },
                { id: 'political-parties', name: 'Political Parties', duration: '45 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Party system and ideology spectrum' },
                { id: 'contemporary-issues', name: 'Contemporary Issues', duration: '55 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Current political and social challenges' },
            ]
        }
    ]
};

// MEC Group Curriculum (Mathematics, Economics, Commerce)
export const MEC_CURRICULUM: Record<string, Subject[]> = {
    'Inter 1st Year': [
        // Mathematics topics same as MPC
        {
            id: 'mec-i1-math',
            name: 'Mathematics',
            icon: 'calculator',
            topics: [
                { id: 'functions-mec', name: 'Functions', duration: '65 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Domain and range mapping diagrams' },
                { id: 'matrices-mec', name: 'Matrices and Determinants', duration: '70 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Matrix operations visualization' },
                { id: 'trigonometry-mec', name: 'Trigonometry', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Trigonometric functions on unit circle' },
                { id: 'sequences-series', name: 'Sequences and Series', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'AP and GP pattern visualization' },
                { id: 'permutations-mec', name: 'Permutations and Combinations', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Counting principles tree diagrams' },
                { id: 'probability-mec', name: 'Probability', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Probability concepts and distributions' },
            ]
        },
        // Economics same as CEC
        {
            id: 'mec-i1-economics',
            name: 'Economics',
            icon: 'trending-up',
            topics: [
                { id: 'intro-economics-mec', name: 'Introduction to Economics', duration: '50 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Economic problem and scarcity' },
                { id: 'consumer-theory-mec', name: 'Consumer Theory', duration: '65 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Utility and indifference curves' },
                { id: 'demand-supply-mec', name: 'Demand and Supply', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Market equilibrium dynamics' },
                { id: 'elasticity-mec', name: 'Elasticity', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Elastic and inelastic demand curves' },
                { id: 'production-mec', name: 'Theory of Production', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Production function and isoquants' },
                { id: 'cost-theory-mec', name: 'Theory of Cost', duration: '60 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Short-run and long-run cost curves' },
            ]
        },
        // Commerce same as CEC
        {
            id: 'mec-i1-commerce',
            name: 'Commerce',
            icon: 'briefcase',
            topics: [
                { id: 'business-nature-mec', name: 'Nature of Business', duration: '50 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Business objectives and types' },
                { id: 'business-org-mec', name: 'Business Organisation', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Business structure comparison' },
                { id: 'business-services-mec', name: 'Business Services', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Service sector overview' },
                { id: 'trade-mec', name: 'Trade', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Trade channels and intermediaries' },
                { id: 'business-ethics-mec', name: 'Business Ethics', duration: '45 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Ethics framework in business' },
            ]
        }
    ],
    'Inter 2nd Year': [
        {
            id: 'mec-i2-math',
            name: 'Mathematics',
            icon: 'calculator',
            topics: [
                { id: 'calculus-mec', name: 'Differential Calculus', duration: '75 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Derivatives and tangent lines' },
                { id: 'integration-mec', name: 'Integral Calculus', duration: '80 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Area under curves visualization' },
                { id: 'linear-programming', name: 'Linear Programming', duration: '65 min', difficulty: 'advanced', visualType: 'interactive', visualPrompt: 'Feasible region and optimization' },
                { id: 'statistics-mec', name: 'Statistics', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Statistical measures and distributions' },
                { id: 'diff-equations-mec', name: 'Differential Equations', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Solution methods visualization' },
            ]
        },
        {
            id: 'mec-i2-economics',
            name: 'Economics',
            icon: 'trending-up',
            topics: [
                { id: 'national-income-mec', name: 'National Income', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Circular flow and GDP measurement' },
                { id: 'money-banking-mec', name: 'Money and Banking', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Monetary system and RBI' },
                { id: 'macro-equilibrium', name: 'Macroeconomic Equilibrium', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'IS-LM model visualization' },
                { id: 'fiscal-policy-mec', name: 'Fiscal Policy', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Government budget and deficit' },
                { id: 'international-trade-mec', name: 'International Trade', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Trade theory and BOP' },
            ]
        },
        {
            id: 'mec-i2-commerce',
            name: 'Commerce',
            icon: 'briefcase',
            topics: [
                { id: 'management-mec', name: 'Principles of Management', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Management process and functions' },
                { id: 'marketing-mec', name: 'Marketing', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Marketing mix and strategies' },
                { id: 'finance-mec', name: 'Financial Management', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Capital structure decisions' },
                { id: 'stock-market', name: 'Stock Market', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Stock exchange operations' },
                { id: 'entrepreneurship', name: 'Entrepreneurship', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Startup ecosystem and funding' },
            ]
        }
    ]
};

// HEC Group Curriculum (History, Economics, Civics)
export const HEC_CURRICULUM: Record<string, Subject[]> = {
    'Inter 1st Year': [
        {
            id: 'hec-i1-history',
            name: 'History',
            icon: 'history',
            topics: [
                { id: 'ancient-india-intro', name: 'Introduction to Ancient Indian History', duration: '60 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Timeline of ancient Indian civilizations' },
                { id: 'indus-valley', name: 'Indus Valley Civilization', duration: '70 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: '3D reconstruction of Harappan city' },
                { id: 'vedic-culture', name: 'Vedic Period and Culture', duration: '65 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Social structure of Vedic society' },
                { id: 'mauryan-empire', name: 'The Mauryan Empire', duration: '75 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Map of Ashoka\'s empire' },
                { id: 'gupta-age', name: 'The Golden Age of Guptas', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Contributions to science and art in Gupta period' },
            ]
        },
        // Economics same as CEC
        {
            id: 'hec-i1-economics',
            name: 'Economics',
            icon: 'trending-up',
            topics: CEC_CURRICULUM['Inter 1st Year'].find(s => s.name === 'Economics')?.topics || []
        },
        // Civics same as CEC
        {
            id: 'hec-i1-civics',
            name: 'Civics',
            icon: 'landmark',
            topics: CEC_CURRICULUM['Inter 1st Year'].find(s => s.name === 'Civics')?.topics || []
        }
    ],
    'Inter 2nd Year': [
        {
            id: 'hec-i2-history',
            name: 'History',
            icon: 'history',
            topics: [
                { id: 'medieval-india-intro', name: 'Medieval Indian History Overview', duration: '65 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Timeline of Delhi Sultanate and Mughal Empire' },
                { id: 'mughal-administration', name: 'Mughal Administration and Art', duration: '75 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Mansabdari system flowchart' },
                { id: 'colonial-rule-india', name: 'British Colonial Rule in India', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Economic impact of British rule' },
                { id: 'indian-independence-movement', name: 'Indian Independence Movement', duration: '80 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Animated map of major independence movements' },
                { id: 'post-independence-india', name: 'Post-Independence Consolidation', duration: '70 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Integration of princely states' },
            ]
        },
        // Economics same as CEC
        {
            id: 'hec-i2-economics',
            name: 'Economics',
            icon: 'trending-up',
            topics: CEC_CURRICULUM['Inter 2nd Year'].find(s => s.name === 'Economics')?.topics || []
        },
        // Civics same as CEC
        {
            id: 'hec-i2-civics',
            name: 'Civics',
            icon: 'landmark',
            topics: CEC_CURRICULUM['Inter 2nd Year'].find(s => s.name === 'Civics')?.topics || []
        }
    ]
};

// Combined intermediate curriculum with all groups
export const INTERMEDIATE_CURRICULUM = {
    MPC: MPC_CURRICULUM,
    BiPC: BIPC_CURRICULUM,
    CEC: CEC_CURRICULUM,
    MEC: MEC_CURRICULUM,
    HEC: HEC_CURRICULUM,
};
