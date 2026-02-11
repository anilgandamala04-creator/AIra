import { Subject } from '../../types';

export const SECONDARY_GRADES = [
    'Grade 9',
    'Grade 10'
];

export const SECONDARY_CURRICULUM: Record<string, Subject[]> = {
    'Grade 9': [
        {
            id: 'g9-math',
            name: 'Mathematics',
            icon: 'calculator',
            topics: [
                { id: 'number-systems', name: 'Number Systems', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Recursive visualization of real number subsets' },
                { id: 'polynomials', name: 'Polynomials', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Dynamic graphing of quadratic and cubic polynomials' },
                { id: 'coord-geometry', name: 'Coordinate Geometry', duration: '45 min', difficulty: 'beginner', visualType: 'interactive', visualPrompt: 'Interactive Cartesian plane for plotting points' },
                { id: 'linear-eq-2-vars', name: 'Linear Equations in Two Variables', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Graphical representation of intersecting lines' },
                { id: 'euclids-geometry', name: 'Introduction to Euclid\'s Geometry', duration: '40 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Visual representation of Euclid\'s five postulates and axioms' },
                { id: 'lines-angles', name: 'Lines and Angles', duration: '55 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Proof of sum of angles in a triangle through vertex movement' },
                { id: 'triangles', name: 'Triangles', duration: '60 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Congruency criteria visual comparison (SSS, SAS, ASA, RHS)' },
                { id: 'quadrilaterals', name: 'Quadrilaterals', duration: '60 min', difficulty: 'advanced', visualType: 'interactive', visualPrompt: 'Parallelogram to rectangle morphing tool' },
                { id: 'circles', name: 'Circles', duration: '60 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Visualization of circle theorems (angle at center vs circumference)' },
                { id: 'herons-formula', name: 'Heron\'s Formula', duration: '45 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Area derivation using triangulation and Heron\'s variables' },
                { id: 'surface-areas-volumes', name: 'Surface Areas and Volumes', duration: '65 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'Exploding 3D views of cones, cylinders, and spheres showing net areas' },
                { id: 'probability', name: 'Probability', duration: '45 min', difficulty: 'beginner', visualType: 'interactive', visualPrompt: 'Dice throw and coin flip probability simulator' }
            ]
        },
        {
            id: 'g9-science',
            name: 'Science',
            icon: 'flask',
            topics: [
                { id: 'matter-surroundings', name: 'Matter in Our Surroundings', duration: '50 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Phase change animation at molecular level' },
                { id: 'is-matter-pure', name: 'Is Matter Around Us Pure?', duration: '55 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Virtual laboratory for filtration, distillation, and chromatography' },
                { id: 'atoms-molecules', name: 'Atoms and Molecules', duration: '60 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'Interactive 3D models of simple molecules (H2O, CO2)' },
                { id: 'structure-atom', name: 'Structure of the Atom', duration: '65 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Bohr\'s model animation showing electron transitions' },
                { id: 'cell-life', name: 'The Fundamental Unit of Life: Cell', duration: '55 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: 'Interactive 3D plant and animal cells with labeled organelles' },
                { id: 'tissues', name: 'Tissues', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Microscopic view diagrams of epithelial, connective, and muscle tissues' },
                { id: 'motion', name: 'Motion', duration: '60 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Distance-time and velocity-time graph synchronous movement animation' },
                { id: 'force-laws-motion', name: 'Force and Laws of Motion', duration: '65 min', difficulty: 'advanced', visualType: 'interactive', visualPrompt: 'Newton\'s Second Law simulator with varying mass and force' },
                { id: 'gravitation', name: 'Gravitation', duration: '60 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Free fall and satellite orbit animation' },
                { id: 'work-energy', name: 'Work and Energy', duration: '60 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Energy transformation animation (potential to kinetic)' },
                { id: 'sound', name: 'Sound', duration: '55 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Longitudinal wave propagation animation' }
            ]
        },
        {
            id: 'g9-social',
            name: 'Social Science',
            icon: 'globe',
            topics: [
                { id: 'french-revolution', name: 'The French Revolution', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Animated timeline of the French Revolution with key events' },
                { id: 'nazism', name: 'Nazism and the Rise of Hitler', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'World War II chronology and propaganda visual analysis' },
                { id: 'india-size-location', name: 'India: Size and Location', duration: '45 min', difficulty: 'beginner', visualType: '3d-model', visualPrompt: 'Interactive 3D map of India highlighting states, borders, and key features' },
                { id: 'drainage-9', name: 'Drainage Systems of India', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'River map of India showing Himalayan and Peninsular river systems' },
                { id: 'democracy-9', name: 'What is Democracy?', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Comparative chart of democratic vs non-democratic governments' },
                { id: 'poverty-challenge', name: 'Poverty as a Challenge', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Infographic showing poverty indicators and government schemes' }
            ]
        },
        {
            id: 'g9-english',
            name: 'English',
            icon: 'book-open',
            topics: [
                { id: 'prose-9', name: 'Prose: The Fun They Had', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Futuristic classroom visual contrasting past and future education' },
                { id: 'poetry-9', name: 'Poetry: The Road Not Taken', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Visual metaphor of diverging paths in a forest' },
                { id: 'grammar-modals', name: 'Modals and Determiners', duration: '45 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Usage chart for modal verbs with example sentences' },
                { id: 'writing-skills-9', name: 'Formal Letters and Notice Writing', duration: '60 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Template layouts for formal letters and official notices' }
            ]
        }
    ],
    'Grade 10': [
        {
            id: 'g10-math',
            name: 'Mathematics',
            icon: 'calculator',
            topics: [
                { id: 'real-numbers', name: 'Real Numbers', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Euclid\'s Division Lemma shown using grouping of objects' },
                { id: 'polynomials-10', name: 'Polynomials', duration: '55 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Visualizing zeroes of a polynomial through graph intersections' },
                { id: 'linear-eq-pair', name: 'Pair of Linear Equations in Two Variables', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Graphical conditions for intersecting, parallel, and coincident line pairs' },
                { id: 'quadratic-eq', name: 'Quadratic Equations', duration: '65 min', difficulty: 'advanced', visualType: 'interactive', visualPrompt: 'Parabola vertex and roots playground' },
                { id: 'arithmetic-prog', name: 'Arithmetic Progressions', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Staircase visualization of AP terms' },
                { id: 'triangles-sim', name: 'Similar Triangles', duration: '65 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Scaling animation demonstrating Thales Theorem (BPT)' },
                { id: 'coordinate-geo-circles', name: 'Circles and Coordinate Geometry', duration: '60 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Circle plotting on a grid with center (h,k) and radius r controls' },
                { id: 'trig-intro', name: 'Introduction to Trigonometry', duration: '65 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Unit circle animation showing sine and cosine projections' },
                { id: 'trig-apps', name: 'Applications of Trigonometry', duration: '60 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Angle of elevation/depression scenario diagrams' },
                { id: 'constructions', name: 'Constructions', duration: '50 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Step-by-step compass and ruler construction guide' },
                { id: 'areas-circles', name: 'Areas Related to Circles', duration: '55 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Sector and segment derivation animation' },
                { id: 'stat-prob', name: 'Statistics and Probability', duration: '60 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Real-time histogram and pie chart builder' }
            ]
        },
        {
            id: 'g10-science',
            name: 'Science',
            icon: 'flask',
            topics: [
                { id: 'chem-reactions-10', name: 'Chemical Reactions and Equations', duration: '55 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Molecular collision and bond breaking/forming animation' },
                { id: 'acids-bases-salts-10', name: 'Acids, Bases and Salts', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Laboratory setup for neutralization reaction and salt formation' },
                { id: 'metals-nonmetals-10', name: 'Metals and Non-Metals', duration: '60 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Electrolytic refining process animation' },
                { id: 'carbon-compounds', name: 'Carbon and its Compounds', duration: '70 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: '3D models of methane, ethane, and allotropes of carbon' },
                { id: 'periodic-classification', name: 'Periodic Classification of Elements', duration: '55 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Interactive periodic table with orbital visualizations' },
                { id: 'life-processes-10', name: 'Life Processes', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Detailed human circulatory system flowchart' },
                { id: 'control-coordination', name: 'Control and Coordination', duration: '60 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Synaptic transmission and reflex arc animation' },
                { id: 'reproduction', name: 'How do Organisms Reproduce?', duration: '65 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Life cycle diagrams and reproductive organ structures' },
                { id: 'heredity-evolution', name: 'Heredity and Evolution', duration: '60 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Punnett square and evolutionary tree diagrams' },
                { id: 'light-ref-ref', name: 'Light - Reflection and Refraction', duration: '65 min', difficulty: 'advanced', visualType: 'interactive', visualPrompt: 'Virtual ray optics bench with mirrors and lenses' },
                { id: 'human-eye-world', name: 'Human Eye and Colourful World', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Ray tracing through eye and prism diagrams' },
                { id: 'electricity-10', name: 'Electricity', duration: '65 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Drift velocity and Ohm\'s law visualization' },
                { id: 'magnetic-effects', name: 'Magnetic Effects of Electric Current', duration: '65 min', difficulty: 'advanced', visualType: '3d-model', visualPrompt: 'Interactive magnetic field lines around wire and solenoid' },
                { id: 'sources-energy', name: 'Sources of Energy', duration: '50 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Working models of solar, wind, and hydroelectric power generation' }
            ]
        },
        {
            id: 'g10-social',
            name: 'Social Science',
            icon: 'globe',
            topics: [
                { id: 'nationalism-india', name: 'Nationalism in India', duration: '65 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Animated timeline of Indian independence movement from 1857 to 1947' },
                { id: 'making-global-world', name: 'The Making of a Global World', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Trade routes and globalization timeline animation' },
                { id: 'resources-development-10', name: 'Resources and Development', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'India resources map showing minerals, soils, and land use patterns' },
                { id: 'agriculture-10', name: 'Agriculture', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Agricultural map of India with crop distribution zones' },
                { id: 'power-sharing', name: 'Power Sharing', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Flowchart showing horizontal and vertical power sharing in democracies' },
                { id: 'development-10', name: 'Development', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'HDI comparison chart across countries with development indicators' }
            ]
        },
        {
            id: 'g10-english',
            name: 'English',
            icon: 'book-open',
            topics: [
                { id: 'prose-10', name: 'Prose: A Letter to God', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Visual scene of a farmer writing a letter amidst a storm-damaged field' },
                { id: 'poetry-10', name: 'Poetry: Fire and Ice', duration: '55 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Visual contrast of fire (desire) and ice (hate) symbolism' },
                { id: 'grammar-advanced-10', name: 'Advanced Grammar: Clauses and Sentence Transformation', duration: '60 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Complex sentence structure tree with clause annotations' },
                { id: 'analytical-paragraph', name: 'Analytical Paragraph Writing', duration: '55 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Data interpretation visual with sample paragraph structure' }
            ]
        }
    ]
};
