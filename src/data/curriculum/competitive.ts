import { Subject } from '../../types';

export const COMPETITIVE_CURRICULUM: Record<string, Subject[]> = {
    'NEET': [
        {
            id: 'neet-physics',
            name: 'Physics',
            icon: 'zap',
            topics: [
                { id: 'neet-mechanics', name: 'Mechanics', duration: '90 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Advanced projectile and rotational mechanics simulation' },
                { id: 'neet-optics', name: 'Optics', duration: '90 min', difficulty: 'advanced', visualType: 'interactive', visualPrompt: 'Lens maker\'s formula and ray optics solver' },
                { id: 'neet-modern-physics', name: 'Modern Physics', duration: '80 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Photoelectric effect and Bohr model transitions' }
            ]
        },
        {
            id: 'neet-chemistry',
            name: 'Chemistry',
            icon: 'test-tube',
            topics: [
                { id: 'neet-physical-chem', name: 'Physical Chemistry', duration: '90 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Chemical kinetics and thermodynamics energy profile diagrams' },
                { id: 'neet-organic-chem', name: 'Organic Chemistry', duration: '90 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Nucleophilic substitution (SN1/SN2) mechanism animation' }
            ]
        },
        {
            id: 'neet-biology',
            name: 'Biology',
            icon: 'dna',
            topics: [
                { id: 'neet-botany', name: 'Botany', duration: '120 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Detailed plant anatomy and photosynthesis pathway diagrams' },
                { id: 'neet-zoology', name: 'Zoology', duration: '120 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'Interactive 3D models of human organ systems' }
            ]
        }
    ],
    'JEE Main': [
        {
            id: 'jee-math',
            name: 'Mathematics',
            icon: 'calculator',
            topics: [
                { id: 'jee-calculus', name: 'Calculus', duration: '120 min', difficulty: 'advanced', visualType: 'interactive', visualPrompt: 'Dynamic derivative and integral visualizer' },
                { id: 'jee-algebra', name: 'Algebra', duration: '110 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Complex number plane and vector space visualizations' },
                { id: 'jee-coord-geo', name: 'Coordinate Geometry', duration: '100 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Conic sections (parabola, ellipse, hyperbola) derivation animation' }
            ]
        },
        {
            id: 'jee-physics',
            name: 'Physics',
            icon: 'zap',
            topics: [
                { id: 'jee-electrodynamics', name: 'Electrodynamics', duration: '110 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Electromagnetic wave propagation and Maxwell\'s equations visualization' },
                { id: 'jee-thermal-physics', name: 'Thermal Physics', duration: '90 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Carnot cycle and heat engine efficiency diagrams' }
            ]
        }
    ],
    'IIT': [
        {
            id: 'jee-adv-math',
            name: 'Mathematics',
            icon: 'calculator',
            topics: [
                { id: 'jee-adv-calculus', name: 'Advanced Calculus', duration: '120 min', difficulty: 'advanced', visualType: 'interactive', visualPrompt: 'Multivariable calculus and partial derivatives visualization' },
                { id: 'jee-adv-algebra', name: 'Linear Algebra', duration: '100 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Matrix transformations and eigenvalues exploration' },
                { id: 'jee-adv-vectors', name: 'Vector Algebra & 3D Geometry', duration: '110 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'Interactive 3D vector space and planes' },
                { id: 'jee-adv-prob', name: 'Probability & Statistics', duration: '90 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Baye\'s theorem and probability distribution simulations' }
            ]
        },
        {
            id: 'jee-adv-physics',
            name: 'Physics',
            icon: 'zap',
            topics: [
                { id: 'jee-adv-mechanics', name: 'Advanced Mechanics', duration: '120 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Rotational dynamics and moment of inertia simulations' },
                { id: 'jee-adv-em', name: 'Electromagnetism', duration: '110 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Faraday\'s law and Lenz\'s law interactive demonstrations' },
                { id: 'jee-adv-thermo', name: 'Thermodynamics & KT', duration: '100 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Entropy and Second Law of Thermodynamics cycles' },
                { id: 'jee-adv-optics', name: 'Wave Optics', duration: '90 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Interference and diffraction pattern simulations' }
            ]
        },
        {
            id: 'jee-adv-chemistry',
            name: 'Chemistry',
            icon: 'test-tube',
            topics: [
                { id: 'jee-adv-inorganic', name: 'Inorganic Chemistry', duration: '100 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Coordination compounds and d-block chemistry visualizations' },
                { id: 'jee-adv-organic-mech', name: 'Organic Reaction Mechanisms', duration: '120 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'E1, E2 and nucleophilic addition mechanisms' }
            ]
        }
    ],
    'EAMCET': [
        {
            id: 'eamcet-math',
            name: 'Mathematics',
            icon: 'calculator',
            topics: [
                { id: 'eamcet-algebra', name: 'Algebra', duration: '90 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Quadratic equations and polynomial functions' },
                { id: 'eamcet-trigonometry', name: 'Trigonometry', duration: '80 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Trigonometric identities and unit circle visualization' },
                { id: 'eamcet-calculus', name: 'Calculus Basics', duration: '100 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Limits and continuity interactive graph' }
            ]
        },
        {
            id: 'eamcet-physics',
            name: 'Physics',
            icon: 'zap',
            topics: [
                { id: 'eamcet-mechanics', name: 'Mechanics', duration: '90 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Newton\'s laws and projectile motion simulations' },
                { id: 'eamcet-heat', name: 'Heat & Thermodynamics', duration: '80 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Thermal expansion and calorimetry experiments' }
            ]
        }
    ],
    'GATE': [
        {
            id: 'gate-cs',
            name: 'Computer Science',
            icon: 'code',
            topics: [
                { id: 'gate-algorithms', name: 'Algorithms', duration: '120 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Sorting algorithms and complexity analysis visualization' },
                { id: 'gate-data-structures', name: 'Data Structures', duration: '110 min', difficulty: 'advanced', visualType: 'interactive', visualPrompt: 'Tree and graph traversal interactive demonstrations' },
                { id: 'gate-os', name: 'Operating Systems', duration: '100 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Process scheduling and memory management diagrams' },
                { id: 'gate-dbms', name: 'Database Management', duration: '110 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'SQL joins and normalization normal forms' },
                { id: 'gate-cn', name: 'Computer Networks', duration: '120 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'TCP/IP 3-way handshake and packet routing simulation' },
                { id: 'gate-system-design', name: 'System Design & API', duration: '90 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'RESTful API architecture and microservices' }
            ]
        },
        {
            id: 'gate-aptitude',
            name: 'General Aptitude',
            icon: 'brain',
            topics: [
                { id: 'gate-quant', name: 'Quantitative Aptitude', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Number systems and arithmetic progressions' },
                { id: 'gate-verbal', name: 'Verbal Ability', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Reading comprehension strategies' }
            ]
        }
    ]
};

