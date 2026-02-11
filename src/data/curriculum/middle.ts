import { Subject } from '../../types';

export const MIDDLE_GRADES = [
    'Grade 6',
    'Grade 7',
    'Grade 8'
];

export const MIDDLE_CURRICULUM: Record<string, Subject[]> = {
    'Grade 6': [
        {
            id: 'g6-math',
            name: 'Mathematics',
            icon: 'calculator',
            topics: [
                { id: 'knowing-numbers', name: 'Knowing Our Numbers', duration: '45 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Place value chart and number commas visualization' },
                { id: 'whole-numbers', name: 'Whole Numbers', duration: '40 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Number line visualization for whole numbers' },
                { id: 'integers-intro', name: 'Introduction to Integers', duration: '50 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Negative and positive number movement on a vertical number line' },
                { id: 'fractions-decimals', name: 'Fractions and Decimals', duration: '55 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Fraction to decimal converter with visual blocks' },
                { id: 'algebra-intro', name: 'Introduction to Algebra', duration: '60 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Visual representation of variables using balance scales' }
            ]
        },
        {
            id: 'g6-science',
            name: 'Science',
            icon: 'flask',
            topics: [
                { id: 'food-sources', name: 'Food: Where does it come from?', duration: '40 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Map of plant parts (root, stem, leaf) as food sources' },
                { id: 'components-food', name: 'Components of Food', duration: '45 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Food pyramid showing nutritional components' },
                { id: 'fibre-to-fabric', name: 'Fibre to Fabric', duration: '45 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Step-by-step process from raw fibre to woven fabric' },
                { id: 'sorting-materials', name: 'Sorting Materials into Groups', duration: '40 min', difficulty: 'beginner', visualType: 'interactive', visualPrompt: 'Virtual sorting tray based on hardness and solubility' },
                { id: 'electricity-circuits', name: 'Electricity and Circuits', duration: '55 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Virtual circuit builder with battery, bulb, and switch' }
            ]
        },
        {
            id: 'g6-social',
            name: 'Social Science',
            icon: 'globe',
            topics: [
                { id: 'what-where-how-when', name: 'What, Where, How and When?', duration: '40 min', difficulty: 'beginner', visualType: 'animation', visualPrompt: 'Historical timeline animation of ancient civilizations' },
                { id: 'solar-system', name: 'The Earth in the Solar System', duration: '45 min', difficulty: 'beginner', visualType: 'animation', visualPrompt: 'Animated model of the solar system with orbital data' },
                { id: 'globe-lat-long', name: 'Globe: Latitudes and Longitudes', duration: '50 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: 'Interactive 3D globe with toggleable latitude and longitude lines' },
                { id: 'earliest-societies', name: 'The Earliest Societies', duration: '45 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Visual map of early human settlements and migration patterns' },
                { id: 'diversity-livelihood', name: 'Diversity and Livelihoods', duration: '40 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Infographic showing different occupations in rural and urban areas' },
                { id: 'local-government', name: 'Understanding Our Local Government', duration: '45 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Organizational flowchart of local government bodies and their functions' }
            ]
        },
        {
            id: 'g6-english',
            name: 'English',
            icon: 'book-open',
            topics: [
                { id: 'prose-poetry-intro', name: 'Introduction to Prose and Poetry', duration: '45 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Visual comparison chart of prose vs poetry structures' },
                { id: 'basic-grammar', name: 'Parts of Speech', duration: '50 min', difficulty: 'beginner', visualType: 'interactive', visualPrompt: 'Interactive sentence parser highlighting nouns, verbs, adjectives' },
                { id: 'tenses-intro', name: 'Introduction to Tenses', duration: '55 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Timeline animation showing past, present, and future actions' },
                { id: 'comprehension-skills', name: 'Reading Comprehension', duration: '40 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Illustrated story with highlighted key sentences for analysis' },
                { id: 'creative-writing-intro', name: 'Introduction to Creative Writing', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Visual story structure map with beginning, middle, end segments' }
            ]
        }
    ],
    'Grade 7': [
        {
            id: 'g7-math',
            name: 'Mathematics',
            icon: 'calculator',
            topics: [
                { id: 'integers-props', name: 'Properties of Integers', duration: '50 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Commutative and associative properties shown on a number line' },
                { id: 'rational-numbers', name: 'Rational Numbers', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Venn diagram showing relationship between integers and rational numbers' },
                { id: 'simple-equations', name: 'Simple Equations', duration: '60 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Balance scale visualization for algebraic weight balancing' },
                { id: 'lines-angles', name: 'Lines and Angles', duration: '50 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Dynamic angle creator for complementary and supplementary angles' },
                { id: 'triangles-props', name: 'The Triangle and its Properties', duration: '55 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Visual proofs for Angle Sum Property and Exterior Angle Theorem' }
            ]
        },
        {
            id: 'g7-science',
            name: 'Science',
            icon: 'flask',
            topics: [
                { id: 'nutrition-plants', name: 'Nutrition in Plants', duration: '45 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Photosynthesis process animation showing sunlight and CO2 absorption' },
                { id: 'nutrition-animals', name: 'Nutrition in Animals', duration: '50 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: 'Interactive 3D model of the human digestive system' },
                { id: 'heat-transfer', name: 'Heat and its Transfer', duration: '55 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Conduction, convection, and radiation molecular animation' },
                { id: 'acids-bases-salts', name: 'Acids, Bases and Salts', duration: '60 min', difficulty: 'advanced', visualType: 'interactive', visualPrompt: 'Virtual pH indicator test strip' },
                { id: 'respiration-organisms', name: 'Respiration in Organisms', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Human respiratory system diagram with air flow indicators' }
            ]
        },
        {
            id: 'g7-social',
            name: 'Social Science',
            icon: 'globe',
            topics: [
                { id: 'medieval-world', name: 'The Medieval World', duration: '50 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Animated timeline showcasing medieval kingdoms and empires' },
                { id: 'our-environment-7', name: 'Our Environment', duration: '45 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'World climate zones map with environmental features' },
                { id: 'democracy-equality', name: 'Democracy and Equality', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Flowchart showing democratic processes and citizen rights' },
                { id: 'markets-around-us', name: 'Markets Around Us', duration: '40 min', difficulty: 'beginner', visualType: 'diagram', visualPrompt: 'Infographic of market chains from producer to consumer' }
            ]
        },
        {
            id: 'g7-english',
            name: 'English',
            icon: 'book-open',
            topics: [
                { id: 'advanced-grammar', name: 'Advanced Grammar: Clauses and Phrases', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Sentence tree diagram showing clause and phrase relationships' },
                { id: 'story-elements', name: 'Elements of a Story', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Visual map of plot, character, setting, conflict, and resolution' },
                { id: 'poetry-analysis', name: 'Poetry Analysis', duration: '60 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Annotated poem showing rhyme scheme, meter, and literary devices' },
                { id: 'letter-writing', name: 'Formal and Informal Letter Writing', duration: '45 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Side-by-side comparison of formal vs informal letter formats' }
            ]
        }
    ],
    'Grade 8': [
        {
            id: 'g8-math',
            name: 'Mathematics',
            icon: 'calculator',
            topics: [
                { id: 'rational-ops', name: 'Rational Numbers Operations', duration: '50 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Step-by-step addition of fractions with unlike denominators using area models' },
                { id: 'linear-equations', name: 'Linear Equations in One Variable', duration: '60 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Balancing equation visual (adding/subtracting from both sides)' },
                { id: 'quadrilaterals', name: 'Understanding Quadrilaterals', duration: '55 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Morphable quadrilateral tool to explore properties' },
                { id: 'squares-roots', name: 'Squares and Square Roots', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Geometric representation of square roots using grid areas' },
                { id: 'cubes-roots', name: 'Cubes and Cube Roots', duration: '50 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: '3D unit cubes assembling into larger cubic structures' },
                { id: 'exponents-powers', name: 'Exponents and Powers', duration: '60 min', difficulty: 'advanced', visualType: 'animation', visualPrompt: 'Visualization of rapid growth using power of exponents' }
            ]
        },
        {
            id: 'g8-science',
            name: 'Science',
            icon: 'flask',
            topics: [
                { id: 'crop-production', name: 'Crop Production and Management', duration: '45 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Stages of agriculture: sowing, irrigation, and harvesting flow' },
                { id: 'microorganisms', name: 'Microorganisms: Friend and Foe', duration: '55 min', difficulty: 'intermediate', visualType: '3d-model', visualPrompt: '3D models of bacteria, fungi, and viruses' },
                { id: 'synthetic-fibres', name: 'Synthetic Fibres and Plastics', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Microscopic comparison of natural vs synthetic polymer structures' },
                { id: 'metals-nonmetals', name: 'Metals and Non-Metals', duration: '60 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Comparative table of physical and chemical properties' },
                { id: 'force-pressure', name: 'Force and Pressure', duration: '55 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Pressure visualization using area and force vectors' },
                { id: 'friction', name: 'Friction', duration: '50 min', difficulty: 'intermediate', visualType: 'interactive', visualPrompt: 'Friction simulator with different surface types' }
            ]
        },
        {
            id: 'g8-social',
            name: 'Social Science',
            icon: 'globe',
            topics: [
                { id: 'modern-period', name: 'How, When and Where: The Modern Period', duration: '50 min', difficulty: 'intermediate', visualType: 'animation', visualPrompt: 'Animated timeline of modern Indian history from 1700s onwards' },
                { id: 'resources-types', name: 'Resources and Development', duration: '45 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Classification map of natural, human, and man-made resources' },
                { id: 'constitution-8', name: 'The Indian Constitution', duration: '55 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Structural flowchart of the Indian Constitution and its key features' },
                { id: 'understanding-laws', name: 'Understanding Laws', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Visual representation of laws, rules, and citizen rights' }
            ]
        },
        {
            id: 'g8-english',
            name: 'English',
            icon: 'book-open',
            topics: [
                { id: 'active-passive', name: 'Active and Passive Voice', duration: '50 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Sentence transformation diagram showing subject-verb-object shifts' },
                { id: 'reported-speech', name: 'Direct and Indirect Speech', duration: '55 min', difficulty: 'intermediate', visualType: 'diagram', visualPrompt: 'Visual chart showing dialogue conversion rules' },
                { id: 'essay-writing', name: 'Essay Writing', duration: '60 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Essay structure visual: Introduction, Body paragraphs, Conclusion' },
                { id: 'lit-analysis-8', name: 'Literary Analysis', duration: '55 min', difficulty: 'advanced', visualType: 'diagram', visualPrompt: 'Annotated text showing theme, tone, and narrative technique' }
            ]
        }
    ]
};
