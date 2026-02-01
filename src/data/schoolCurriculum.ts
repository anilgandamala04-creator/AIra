import type { SchoolGrade, SchoolSubject, Chapter, Topic } from '../types';

// ============================================
// SUBJECT TEMPLATES FOR EACH GRADE LEVEL
// ============================================

// Primary Level Subjects (Classes 1-5)
const createPrimarySubjects = (gradeNumber: number): SchoolSubject[] => [
    {
        id: 'english',
        name: 'English',
        icon: 'book-open',
        color: '#3b82f6',
        description: 'Language skills, reading, and writing',
        chapters: createEnglishChapters(gradeNumber)
    },
    {
        id: 'hindi',
        name: 'Hindi',
        icon: 'languages',
        color: '#f59e0b',
        description: 'Hindi language and literature',
        chapters: createHindiChapters(gradeNumber)
    },
    {
        id: 'mathematics',
        name: 'Mathematics',
        icon: 'calculator',
        color: '#10b981',
        description: 'Numbers, arithmetic, and basic geometry',
        chapters: createMathChapters(gradeNumber)
    },
    {
        id: 'evs',
        name: 'Environmental Studies',
        icon: 'leaf',
        color: '#22c55e',
        description: 'Nature, environment, and social awareness',
        chapters: createEVSChapters(gradeNumber)
    },
    {
        id: 'art',
        name: 'Art & Craft',
        icon: 'palette',
        color: '#ec4899',
        description: 'Creative arts and crafts',
        chapters: createArtChapters(gradeNumber)
    }
];

// Middle Level Subjects (Classes 6-8)
const createMiddleSubjects = (gradeNumber: number): SchoolSubject[] => [
    {
        id: 'english',
        name: 'English',
        icon: 'book-open',
        color: '#3b82f6',
        description: 'Language, literature, and grammar',
        chapters: createEnglishChapters(gradeNumber)
    },
    {
        id: 'hindi',
        name: 'Hindi',
        icon: 'languages',
        color: '#f59e0b',
        description: 'Hindi language and literature',
        chapters: createHindiChapters(gradeNumber)
    },
    {
        id: 'mathematics',
        name: 'Mathematics',
        icon: 'calculator',
        color: '#10b981',
        description: 'Algebra, geometry, and arithmetic',
        chapters: createMathChapters(gradeNumber)
    },
    {
        id: 'science',
        name: 'Science',
        icon: 'flask',
        color: '#8b5cf6',
        description: 'Physics, chemistry, and biology fundamentals',
        chapters: createScienceChapters(gradeNumber)
    },
    {
        id: 'social-science',
        name: 'Social Science',
        icon: 'globe',
        color: '#06b6d4',
        description: 'History, geography, and civics',
        chapters: createSocialScienceChapters(gradeNumber)
    },
    {
        id: 'computer',
        name: 'Computer Science',
        icon: 'monitor',
        color: '#6366f1',
        description: 'Basic computer skills and programming',
        chapters: createComputerChapters(gradeNumber)
    }
];

// Secondary Level Subjects (Classes 9-10)
const createSecondarySubjects = (gradeNumber: number): SchoolSubject[] => [
    {
        id: 'english',
        name: 'English',
        icon: 'book-open',
        color: '#3b82f6',
        description: 'Literature, writing, and communication',
        chapters: createEnglishChapters(gradeNumber)
    },
    {
        id: 'hindi',
        name: 'Hindi',
        icon: 'languages',
        color: '#f59e0b',
        description: 'Hindi literature and grammar',
        chapters: createHindiChapters(gradeNumber)
    },
    {
        id: 'mathematics',
        name: 'Mathematics',
        icon: 'calculator',
        color: '#10b981',
        description: 'Advanced algebra, geometry, and trigonometry',
        chapters: createMathChapters(gradeNumber)
    },
    {
        id: 'science',
        name: 'Science',
        icon: 'flask',
        color: '#8b5cf6',
        description: 'Physics, chemistry, and biology',
        chapters: createScienceChapters(gradeNumber)
    },
    {
        id: 'social-science',
        name: 'Social Science',
        icon: 'globe',
        color: '#06b6d4',
        description: 'History, geography, political science, economics',
        chapters: createSocialScienceChapters(gradeNumber)
    },
    {
        id: 'it',
        name: 'Information Technology',
        icon: 'code',
        color: '#6366f1',
        description: 'Programming and IT fundamentals',
        chapters: createITChapters(gradeNumber)
    }
];

// Senior Secondary Science Stream (Classes 11-12)
const createSeniorScienceSubjects = (gradeNumber: number): SchoolSubject[] => [
    {
        id: 'physics',
        name: 'Physics',
        icon: 'atom',
        color: '#3b82f6',
        description: 'Mechanics, thermodynamics, electromagnetism',
        chapters: createPhysicsChapters(gradeNumber)
    },
    {
        id: 'chemistry',
        name: 'Chemistry',
        icon: 'flask',
        color: '#8b5cf6',
        description: 'Organic, inorganic, and physical chemistry',
        chapters: createChemistryChapters(gradeNumber)
    },
    {
        id: 'mathematics',
        name: 'Mathematics',
        icon: 'calculator',
        color: '#10b981',
        description: 'Calculus, algebra, and coordinate geometry',
        chapters: createMathChapters(gradeNumber)
    },
    {
        id: 'biology',
        name: 'Biology',
        icon: 'dna',
        color: '#22c55e',
        description: 'Botany, zoology, and human physiology',
        chapters: createBiologyChapters(gradeNumber)
    },
    {
        id: 'english',
        name: 'English',
        icon: 'book-open',
        color: '#f59e0b',
        description: 'English literature and writing',
        chapters: createEnglishChapters(gradeNumber)
    },
    {
        id: 'computer-science',
        name: 'Computer Science',
        icon: 'code',
        color: '#6366f1',
        description: 'Programming, data structures, and algorithms',
        chapters: createCSChapters(gradeNumber)
    }
];

// ============================================
// CHAPTER GENERATORS BY SUBJECT
// ============================================

function createEnglishChapters(gradeNumber: number): Chapter[] {
    const chapters: Record<number, Chapter[]> = {
        1: [
            { id: 'eng-1-1', name: 'A Happy Child', chapterNumber: 1, topics: createTopics(['Poem Reading', 'Vocabulary', 'Picture Description']) },
            { id: 'eng-1-2', name: 'Three Little Pigs', chapterNumber: 2, topics: createTopics(['Story Reading', 'Characters', 'Moral of Story']) },
            { id: 'eng-1-3', name: 'The Bubble', chapterNumber: 3, topics: createTopics(['Poem Recitation', 'Word Meanings', 'Rhyming Words']) },
        ],
        2: [
            { id: 'eng-2-1', name: 'First Day at School', chapterNumber: 1, topics: createTopics(['Reading Comprehension', 'New Words', 'Speaking Practice']) },
            { id: 'eng-2-2', name: 'Haldi\'s Adventure', chapterNumber: 2, topics: createTopics(['Story Elements', 'Vocabulary', 'Creative Writing']) },
            { id: 'eng-2-3', name: 'A Smile', chapterNumber: 3, topics: createTopics(['Poem Appreciation', 'Rhymes', 'Expression']) },
        ],
        3: [
            { id: 'eng-3-1', name: 'Good Morning', chapterNumber: 1, topics: createTopics(['Greetings', 'Poem', 'Daily Routines']) },
            { id: 'eng-3-2', name: 'The Magic Garden', chapterNumber: 2, topics: createTopics(['Fantasy Stories', 'Imagination', 'Description']) },
            { id: 'eng-3-3', name: 'Bird Talk', chapterNumber: 3, topics: createTopics(['Nature Poetry', 'Vocabulary', 'Listening']) },
        ],
        4: [
            { id: 'eng-4-1', name: 'Wake Up!', chapterNumber: 1, topics: createTopics(['Morning Routine', 'Poem Analysis', 'Grammar']) },
            { id: 'eng-4-2', name: 'Neha\'s Alarm Clock', chapterNumber: 2, topics: createTopics(['Story Comprehension', 'Time Management', 'Writing']) },
            { id: 'eng-4-3', name: 'Noses', chapterNumber: 3, topics: createTopics(['Humorous Poetry', 'Body Parts', 'Adjectives']) },
        ],
        5: [
            { id: 'eng-5-1', name: 'Ice Cream Man', chapterNumber: 1, topics: createTopics(['Descriptive Poetry', 'Seasons', 'Sensory Words']) },
            { id: 'eng-5-2', name: 'Wonderful Waste', chapterNumber: 2, topics: createTopics(['Environmental Awareness', 'Recycling', 'Essay Writing']) },
            { id: 'eng-5-3', name: 'Teamwork', chapterNumber: 3, topics: createTopics(['Poem', 'Collaboration', 'Values']) },
        ],
        6: [
            { id: 'eng-6-1', name: 'Who Did Patrick\'s Homework?', chapterNumber: 1, topics: createTopics(['Fantasy Fiction', 'Moral Lessons', 'Comprehension']) },
            { id: 'eng-6-2', name: 'How the Dog Found Himself a New Master', chapterNumber: 2, topics: createTopics(['Folk Tales', 'Character Analysis', 'Writing']) },
            { id: 'eng-6-3', name: 'Taro\'s Reward', chapterNumber: 3, topics: createTopics(['Japanese Tales', 'Gratitude', 'Summary Writing']) },
        ],
        7: [
            { id: 'eng-7-1', name: 'Three Questions', chapterNumber: 1, topics: createTopics(['Philosophy', 'Moral Stories', 'Critical Thinking']) },
            { id: 'eng-7-2', name: 'A Gift of Chappals', chapterNumber: 2, topics: createTopics(['Indian Culture', 'Kindness', 'Vocabulary']) },
            { id: 'eng-7-3', name: 'Gopal and the Hilsa Fish', chapterNumber: 3, topics: createTopics(['Wit and Humor', 'Problem Solving', 'Drama']) },
        ],
        8: [
            { id: 'eng-8-1', name: 'The Best Christmas Present', chapterNumber: 1, topics: createTopics(['Historical Fiction', 'Family Bonds', 'Analysis']) },
            { id: 'eng-8-2', name: 'The Tsunami', chapterNumber: 2, topics: createTopics(['Natural Disasters', 'Survival Stories', 'Report Writing']) },
            { id: 'eng-8-3', name: 'Glimpses of the Past', chapterNumber: 3, topics: createTopics(['Indian History', 'Comics', 'Timeline']) },
        ],
        9: [
            { id: 'eng-9-1', name: 'The Fun They Had', chapterNumber: 1, topics: createTopics(['Science Fiction', 'Future of Education', 'Analysis']) },
            { id: 'eng-9-2', name: 'The Sound of Music', chapterNumber: 2, topics: createTopics(['Biography', 'Music', 'Inspiration']) },
            { id: 'eng-9-3', name: 'The Little Girl', chapterNumber: 3, topics: createTopics(['Relationships', 'Character Study', 'Writing']) },
        ],
        10: [
            { id: 'eng-10-1', name: 'A Letter to God', chapterNumber: 1, topics: createTopics(['Faith', 'Irony', 'Literary Devices']) },
            { id: 'eng-10-2', name: 'Nelson Mandela', chapterNumber: 2, topics: createTopics(['Autobiography', 'Freedom', 'Leadership']) },
            { id: 'eng-10-3', name: 'Two Stories About Flying', chapterNumber: 3, topics: createTopics(['Adventure', 'Courage', 'Narrative']) },
        ],
        11: [
            { id: 'eng-11-1', name: 'The Portrait of a Lady', chapterNumber: 1, topics: createTopics(['Prose', 'Character Sketch', 'Relationships']) },
            { id: 'eng-11-2', name: 'We\'re Not Afraid to Die', chapterNumber: 2, topics: createTopics(['Adventure', 'Survival', 'Determination']) },
            { id: 'eng-11-3', name: 'Discovering Tut', chapterNumber: 3, topics: createTopics(['History', 'Archaeology', 'Scientific Writing']) },
        ],
        12: [
            { id: 'eng-12-1', name: 'The Last Lesson', chapterNumber: 1, topics: createTopics(['War Literature', 'Patriotism', 'Analysis']) },
            { id: 'eng-12-2', name: 'Lost Spring', chapterNumber: 2, topics: createTopics(['Social Issues', 'Child Labor', 'Critical Analysis']) },
            { id: 'eng-12-3', name: 'Deep Water', chapterNumber: 3, topics: createTopics(['Autobiography', 'Fear', 'Overcoming']) },
        ],
    };
    return chapters[gradeNumber] || [];
}

function createHindiChapters(gradeNumber: number): Chapter[] {
    const chapters: Record<number, Chapter[]> = {
        1: [
            { id: 'hin-1-1', name: 'झूला', chapterNumber: 1, topics: createTopics(['कविता पाठ', 'शब्द अर्थ', 'चित्र वर्णन']) },
            { id: 'hin-1-2', name: 'आम की कहानी', chapterNumber: 2, topics: createTopics(['कहानी', 'पात्र परिचय', 'मौखिक']) },
        ],
        2: [
            { id: 'hin-2-1', name: 'ऊँट चला', chapterNumber: 1, topics: createTopics(['कविता', 'तुकबंदी', 'अभ्यास']) },
            { id: 'hin-2-2', name: 'भालू ने खेली फुटबॉल', chapterNumber: 2, topics: createTopics(['कहानी', 'खेल', 'व्याकरण']) },
        ],
        // Add more grades...
    };
    return chapters[gradeNumber] || [
        { id: `hin-${gradeNumber}-1`, name: 'पाठ 1', chapterNumber: 1, topics: createTopics(['पठन', 'व्याकरण', 'लेखन']) },
        { id: `hin-${gradeNumber}-2`, name: 'पाठ 2', chapterNumber: 2, topics: createTopics(['कविता', 'शब्द भंडार', 'अभ्यास']) },
    ];
}

function createMathChapters(gradeNumber: number): Chapter[] {
    const chapters: Record<number, Chapter[]> = {
        1: [
            { id: 'math-1-1', name: 'Shapes and Space', chapterNumber: 1, topics: createTopics(['Basic Shapes', 'Spatial Understanding', 'Pattern Recognition']) },
            { id: 'math-1-2', name: 'Numbers from 1 to 9', chapterNumber: 2, topics: createTopics(['Counting', 'Number Names', 'Comparison']) },
            { id: 'math-1-3', name: 'Addition', chapterNumber: 3, topics: createTopics(['Adding Objects', 'Number Line', 'Word Problems']) },
        ],
        2: [
            { id: 'math-2-1', name: 'What is Long, What is Round?', chapterNumber: 1, topics: createTopics(['Measurement', 'Comparison', 'Length']) },
            { id: 'math-2-2', name: 'Counting in Groups', chapterNumber: 2, topics: createTopics(['Skip Counting', 'Tens and Ones', 'Place Value']) },
            { id: 'math-2-3', name: 'How Much Can You Carry?', chapterNumber: 3, topics: createTopics(['Weight', 'Heavy and Light', 'Estimation']) },
        ],
        3: [
            { id: 'math-3-1', name: 'Where to Look From', chapterNumber: 1, topics: createTopics(['Perspective', 'Observation', 'Spatial Sense']) },
            { id: 'math-3-2', name: 'Fun with Numbers', chapterNumber: 2, topics: createTopics(['Place Value', 'Number Patterns', 'Operations']) },
            { id: 'math-3-3', name: 'Give and Take', chapterNumber: 3, topics: createTopics(['Addition', 'Subtraction', 'Word Problems']) },
        ],
        4: [
            { id: 'math-4-1', name: 'Building with Bricks', chapterNumber: 1, topics: createTopics(['Patterns', 'Shapes', 'Arrangements']) },
            { id: 'math-4-2', name: 'Long and Short', chapterNumber: 2, topics: createTopics(['Measurement', 'Conversion', 'Estimation']) },
            { id: 'math-4-3', name: 'A Trip to Bhopal', chapterNumber: 3, topics: createTopics(['Distance', 'Time', 'Money']) },
        ],
        5: [
            { id: 'math-5-1', name: 'The Fish Tale', chapterNumber: 1, topics: createTopics(['Large Numbers', 'Place Value', 'Comparison']) },
            { id: 'math-5-2', name: 'Shapes and Angles', chapterNumber: 2, topics: createTopics(['Geometry', 'Angles', 'Properties']) },
            { id: 'math-5-3', name: 'How Many Squares?', chapterNumber: 3, topics: createTopics(['Area', 'Perimeter', 'Patterns']) },
        ],
        6: [
            { id: 'math-6-1', name: 'Knowing Our Numbers', chapterNumber: 1, topics: createTopics(['Large Numbers', 'Indian System', 'International System']) },
            { id: 'math-6-2', name: 'Whole Numbers', chapterNumber: 2, topics: createTopics(['Properties', 'Operations', 'Number Line']) },
            { id: 'math-6-3', name: 'Playing with Numbers', chapterNumber: 3, topics: createTopics(['Factors', 'Multiples', 'Divisibility']) },
            { id: 'math-6-4', name: 'Basic Geometrical Ideas', chapterNumber: 4, topics: createTopics(['Points', 'Lines', 'Curves', 'Polygons']) },
        ],
        7: [
            { id: 'math-7-1', name: 'Integers', chapterNumber: 1, topics: createTopics(['Negative Numbers', 'Operations', 'Properties']) },
            { id: 'math-7-2', name: 'Fractions and Decimals', chapterNumber: 2, topics: createTopics(['Operations', 'Conversion', 'Word Problems']) },
            { id: 'math-7-3', name: 'Data Handling', chapterNumber: 3, topics: createTopics(['Mean', 'Median', 'Mode', 'Graphs']) },
            { id: 'math-7-4', name: 'Simple Equations', chapterNumber: 4, topics: createTopics(['Variables', 'Solving Equations', 'Applications']) },
        ],
        8: [
            { id: 'math-8-1', name: 'Rational Numbers', chapterNumber: 1, topics: createTopics(['Properties', 'Operations', 'Number Line']) },
            { id: 'math-8-2', name: 'Linear Equations in One Variable', chapterNumber: 2, topics: createTopics(['Solving Equations', 'Word Problems', 'Applications']) },
            { id: 'math-8-3', name: 'Understanding Quadrilaterals', chapterNumber: 3, topics: createTopics(['Types', 'Properties', 'Angle Sum']) },
            { id: 'math-8-4', name: 'Squares and Square Roots', chapterNumber: 4, topics: createTopics(['Perfect Squares', 'Finding Roots', 'Patterns']) },
        ],
        9: [
            { id: 'math-9-1', name: 'Number Systems', chapterNumber: 1, topics: createTopics(['Real Numbers', 'Irrational Numbers', 'Rationalization']) },
            { id: 'math-9-2', name: 'Polynomials', chapterNumber: 2, topics: createTopics(['Types', 'Zeroes', 'Factorization']) },
            { id: 'math-9-3', name: 'Coordinate Geometry', chapterNumber: 3, topics: createTopics(['Cartesian System', 'Plotting Points', 'Quadrants']) },
            { id: 'math-9-4', name: 'Linear Equations in Two Variables', chapterNumber: 4, topics: createTopics(['Graphical Method', 'Solutions', 'Applications']) },
            { id: 'math-9-5', name: 'Triangles', chapterNumber: 5, topics: createTopics(['Congruence', 'Criteria', 'Properties']) },
        ],
        10: [
            { id: 'math-10-1', name: 'Real Numbers', chapterNumber: 1, topics: createTopics(['Euclid\'s Division', 'Fundamental Theorem', 'Irrational Proofs']) },
            { id: 'math-10-2', name: 'Polynomials', chapterNumber: 2, topics: createTopics(['Division Algorithm', 'Zeroes Relationship', 'Factorization']) },
            { id: 'math-10-3', name: 'Pair of Linear Equations', chapterNumber: 3, topics: createTopics(['Graphical Method', 'Algebraic Methods', 'Cross Multiplication']) },
            { id: 'math-10-4', name: 'Quadratic Equations', chapterNumber: 4, topics: createTopics(['Factorization', 'Quadratic Formula', 'Nature of Roots']) },
            { id: 'math-10-5', name: 'Arithmetic Progressions', chapterNumber: 5, topics: createTopics(['nth Term', 'Sum of Terms', 'Applications']) },
        ],
        11: [
            { id: 'math-11-1', name: 'Sets', chapterNumber: 1, topics: createTopics(['Types of Sets', 'Operations', 'Venn Diagrams']) },
            { id: 'math-11-2', name: 'Relations and Functions', chapterNumber: 2, topics: createTopics(['Cartesian Product', 'Domain and Range', 'Types of Functions']) },
            { id: 'math-11-3', name: 'Trigonometric Functions', chapterNumber: 3, topics: createTopics(['Ratios', 'Identities', 'Graphs']) },
            { id: 'math-11-4', name: 'Complex Numbers', chapterNumber: 4, topics: createTopics(['Imaginary Unit', 'Operations', 'Argand Plane']) },
            { id: 'math-11-5', name: 'Linear Inequalities', chapterNumber: 5, topics: createTopics(['Solving', 'Graphing', 'Systems']) },
        ],
        12: [
            { id: 'math-12-1', name: 'Relations and Functions', chapterNumber: 1, topics: createTopics(['Types', 'Composition', 'Inverse']) },
            { id: 'math-12-2', name: 'Inverse Trigonometric Functions', chapterNumber: 2, topics: createTopics(['Principal Values', 'Properties', 'Graphs']) },
            { id: 'math-12-3', name: 'Matrices', chapterNumber: 3, topics: createTopics(['Types', 'Operations', 'Transpose']) },
            { id: 'math-12-4', name: 'Determinants', chapterNumber: 4, topics: createTopics(['Properties', 'Minors', 'Cofactors', 'Applications']) },
            { id: 'math-12-5', name: 'Continuity and Differentiability', chapterNumber: 5, topics: createTopics(['Limits', 'Derivatives', 'Chain Rule']) },
        ],
    };
    return chapters[gradeNumber] || [];
}

function createScienceChapters(gradeNumber: number): Chapter[] {
    const chapters: Record<number, Chapter[]> = {
        6: [
            { id: 'sci-6-1', name: 'Food: Where Does It Come From?', chapterNumber: 1, topics: createTopics(['Food Sources', 'Food Habits', 'Ingredients']) },
            { id: 'sci-6-2', name: 'Components of Food', chapterNumber: 2, topics: createTopics(['Nutrients', 'Balanced Diet', 'Deficiency Diseases']) },
            { id: 'sci-6-3', name: 'Fibre to Fabric', chapterNumber: 3, topics: createTopics(['Natural Fibres', 'Spinning', 'Weaving']) },
            { id: 'sci-6-4', name: 'Sorting Materials into Groups', chapterNumber: 4, topics: createTopics(['Properties', 'Classification', 'Uses']) },
        ],
        7: [
            { id: 'sci-7-1', name: 'Nutrition in Plants', chapterNumber: 1, topics: createTopics(['Photosynthesis', 'Modes of Nutrition', 'Parasites']) },
            { id: 'sci-7-2', name: 'Nutrition in Animals', chapterNumber: 2, topics: createTopics(['Digestion', 'Digestive System', 'Ruminants']) },
            { id: 'sci-7-3', name: 'Heat', chapterNumber: 3, topics: createTopics(['Temperature', 'Conduction', 'Convection', 'Radiation']) },
            { id: 'sci-7-4', name: 'Acids, Bases and Salts', chapterNumber: 4, topics: createTopics(['Indicators', 'Neutralization', 'Applications']) },
        ],
        8: [
            { id: 'sci-8-1', name: 'Crop Production and Management', chapterNumber: 1, topics: createTopics(['Agricultural Practices', 'Irrigation', 'Harvesting']) },
            { id: 'sci-8-2', name: 'Microorganisms', chapterNumber: 2, topics: createTopics(['Types', 'Useful Microbes', 'Diseases']) },
            { id: 'sci-8-3', name: 'Synthetic Fibres and Plastics', chapterNumber: 3, topics: createTopics(['Types of Plastics', '4R Principle', 'Environmental Impact']) },
            { id: 'sci-8-4', name: 'Metals and Non-metals', chapterNumber: 4, topics: createTopics(['Properties', 'Reactivity', 'Uses']) },
        ],
        9: [
            { id: 'sci-9-1', name: 'Matter in Our Surroundings', chapterNumber: 1, topics: createTopics(['States of Matter', 'Changes of State', 'Evaporation']) },
            { id: 'sci-9-2', name: 'Is Matter Around Us Pure?', chapterNumber: 2, topics: createTopics(['Mixtures', 'Solutions', 'Separation Techniques']) },
            { id: 'sci-9-3', name: 'Atoms and Molecules', chapterNumber: 3, topics: createTopics(['Atomic Theory', 'Molecules', 'Mole Concept']) },
            { id: 'sci-9-4', name: 'Structure of the Atom', chapterNumber: 4, topics: createTopics(['Subatomic Particles', 'Atomic Models', 'Electronic Configuration']) },
            { id: 'sci-9-5', name: 'The Fundamental Unit of Life', chapterNumber: 5, topics: createTopics(['Cell Structure', 'Organelles', 'Cell Division']) },
        ],
        10: [
            { id: 'sci-10-1', name: 'Chemical Reactions and Equations', chapterNumber: 1, topics: createTopics(['Types of Reactions', 'Balancing', 'Effects']) },
            { id: 'sci-10-2', name: 'Acids, Bases and Salts', chapterNumber: 2, topics: createTopics(['pH Scale', 'Reactions', 'Salts Formation']) },
            { id: 'sci-10-3', name: 'Metals and Non-metals', chapterNumber: 3, topics: createTopics(['Occurrence', 'Extraction', 'Corrosion']) },
            { id: 'sci-10-4', name: 'Carbon and Its Compounds', chapterNumber: 4, topics: createTopics(['Covalent Bonding', 'Hydrocarbons', 'Functional Groups']) },
            { id: 'sci-10-5', name: 'Life Processes', chapterNumber: 5, topics: createTopics(['Nutrition', 'Respiration', 'Transportation', 'Excretion']) },
        ],
    };
    return chapters[gradeNumber] || [];
}

function createEVSChapters(gradeNumber: number): Chapter[] {
    const chapters: Record<number, Chapter[]> = {
        1: [
            { id: 'evs-1-1', name: 'My Family', chapterNumber: 1, topics: createTopics(['Family Members', 'Relationships', 'My Home']) },
            { id: 'evs-1-2', name: 'My School', chapterNumber: 2, topics: createTopics(['Classroom', 'Teachers', 'Friends']) },
        ],
        2: [
            { id: 'evs-2-1', name: 'My Body', chapterNumber: 1, topics: createTopics(['Body Parts', 'Senses', 'Health']) },
            { id: 'evs-2-2', name: 'Plants Around Us', chapterNumber: 2, topics: createTopics(['Types of Plants', 'Parts', 'Uses']) },
        ],
        3: [
            { id: 'evs-3-1', name: 'Poonam\'s Day Out', chapterNumber: 1, topics: createTopics(['Animals', 'Environment', 'Observation']) },
            { id: 'evs-3-2', name: 'The Plant Fairy', chapterNumber: 2, topics: createTopics(['Plant Life', 'Growth', 'Care']) },
        ],
        4: [
            { id: 'evs-4-1', name: 'Going to School', chapterNumber: 1, topics: createTopics(['Transport', 'Routes', 'Maps']) },
            { id: 'evs-4-2', name: 'Ear to Ear', chapterNumber: 2, topics: createTopics(['Hearing', 'Sound', 'Animals']) },
        ],
        5: [
            { id: 'evs-5-1', name: 'Super Senses', chapterNumber: 1, topics: createTopics(['Animal Senses', 'Communication', 'Adaptation']) },
            { id: 'evs-5-2', name: 'A Snake Charmer\'s Story', chapterNumber: 2, topics: createTopics(['Reptiles', 'Conservation', 'Occupations']) },
        ],
    };
    return chapters[gradeNumber] || [];
}

function createSocialScienceChapters(gradeNumber: number): Chapter[] {
    const chapters: Record<number, Chapter[]> = {
        6: [
            { id: 'sst-6-1', name: 'What, Where, How and When?', chapterNumber: 1, topics: createTopics(['History Introduction', 'Sources', 'Timeline']) },
            { id: 'sst-6-2', name: 'The Earth in the Solar System', chapterNumber: 2, topics: createTopics(['Planets', 'Earth', 'Moon']) },
            { id: 'sst-6-3', name: 'Understanding Diversity', chapterNumber: 3, topics: createTopics(['Indian Diversity', 'Culture', 'Unity']) },
        ],
        7: [
            { id: 'sst-7-1', name: 'Tracing Changes Through a Thousand Years', chapterNumber: 1, topics: createTopics(['Medieval India', 'Sources', 'Changes']) },
            { id: 'sst-7-2', name: 'Environment', chapterNumber: 2, topics: createTopics(['Ecosystem', 'Natural Environment', 'Human Impact']) },
            { id: 'sst-7-3', name: 'Equality in Indian Democracy', chapterNumber: 3, topics: createTopics(['Constitution', 'Rights', 'Equality']) },
        ],
        8: [
            { id: 'sst-8-1', name: 'How, When and Where', chapterNumber: 1, topics: createTopics(['Modern History', 'British Rule', 'Sources']) },
            { id: 'sst-8-2', name: 'Resources', chapterNumber: 2, topics: createTopics(['Types', 'Conservation', 'Sustainable Development']) },
            { id: 'sst-8-3', name: 'The Indian Constitution', chapterNumber: 3, topics: createTopics(['Preamble', 'Features', 'Fundamental Rights']) },
        ],
        9: [
            { id: 'sst-9-1', name: 'The French Revolution', chapterNumber: 1, topics: createTopics(['Causes', 'Events', 'Impact']) },
            { id: 'sst-9-2', name: 'India - Size and Location', chapterNumber: 2, topics: createTopics(['Location', 'Neighbours', 'Extent']) },
            { id: 'sst-9-3', name: 'What is Democracy?', chapterNumber: 3, topics: createTopics(['Definition', 'Features', 'Types']) },
            { id: 'sst-9-4', name: 'The Story of Village Palampur', chapterNumber: 4, topics: createTopics(['Farming', 'Economy', 'Resources']) },
        ],
        10: [
            { id: 'sst-10-1', name: 'The Rise of Nationalism in Europe', chapterNumber: 1, topics: createTopics(['Nation States', 'Unification', 'Nationalism']) },
            { id: 'sst-10-2', name: 'Resources and Development', chapterNumber: 2, topics: createTopics(['Types of Resources', 'Planning', 'Conservation']) },
            { id: 'sst-10-3', name: 'Power Sharing', chapterNumber: 3, topics: createTopics(['Forms', 'Belgium Model', 'India']) },
            { id: 'sst-10-4', name: 'Development', chapterNumber: 4, topics: createTopics(['Income', 'HDI', 'Sustainability']) },
        ],
    };
    return chapters[gradeNumber] || [];
}

function createArtChapters(gradeNumber: number): Chapter[] {
    return [
        { id: `art-${gradeNumber}-1`, name: 'Drawing and Sketching', chapterNumber: 1, topics: createTopics(['Basic Shapes', 'Shading', 'Observation']) },
        { id: `art-${gradeNumber}-2`, name: 'Colors and Painting', chapterNumber: 2, topics: createTopics(['Color Mixing', 'Techniques', 'Expression']) },
        { id: `art-${gradeNumber}-3`, name: 'Craft Work', chapterNumber: 3, topics: createTopics(['Paper Craft', 'Clay Modeling', 'Recycled Art']) },
    ];
}

function createComputerChapters(gradeNumber: number): Chapter[] {
    const chapters: Record<number, Chapter[]> = {
        6: [
            { id: 'comp-6-1', name: 'Introduction to Computers', chapterNumber: 1, topics: createTopics(['History', 'Components', 'Types']) },
            { id: 'comp-6-2', name: 'Operating System', chapterNumber: 2, topics: createTopics(['Windows', 'Desktop', 'File Management']) },
        ],
        7: [
            { id: 'comp-7-1', name: 'Word Processing', chapterNumber: 1, topics: createTopics(['MS Word', 'Formatting', 'Documents']) },
            { id: 'comp-7-2', name: 'Spreadsheets', chapterNumber: 2, topics: createTopics(['MS Excel', 'Formulas', 'Charts']) },
        ],
        8: [
            { id: 'comp-8-1', name: 'Internet Basics', chapterNumber: 1, topics: createTopics(['Browsing', 'Email', 'Safety']) },
            { id: 'comp-8-2', name: 'Introduction to HTML', chapterNumber: 2, topics: createTopics(['Tags', 'Structure', 'Web Pages']) },
        ],
    };
    return chapters[gradeNumber] || [];
}

function createITChapters(gradeNumber: number): Chapter[] {
    const chapters: Record<number, Chapter[]> = {
        9: [
            { id: 'it-9-1', name: 'Communication Skills', chapterNumber: 1, topics: createTopics(['Verbal', 'Written', 'Body Language']) },
            { id: 'it-9-2', name: 'Self-Management Skills', chapterNumber: 2, topics: createTopics(['Time Management', 'Stress', 'Goals']) },
            { id: 'it-9-3', name: 'ICT Skills', chapterNumber: 3, topics: createTopics(['Computer Basics', 'Internet', 'Digital Literacy']) },
        ],
        10: [
            { id: 'it-10-1', name: 'Digital Documentation', chapterNumber: 1, topics: createTopics(['Word Processing', 'Formatting', 'Templates']) },
            { id: 'it-10-2', name: 'Electronic Spreadsheet', chapterNumber: 2, topics: createTopics(['Formulas', 'Functions', 'Analysis']) },
            { id: 'it-10-3', name: 'Database Management', chapterNumber: 3, topics: createTopics(['DBMS Concepts', 'Tables', 'Queries']) },
        ],
    };
    return chapters[gradeNumber] || [];
}

function createPhysicsChapters(gradeNumber: number): Chapter[] {
    const chapters: Record<number, Chapter[]> = {
        11: [
            { id: 'phy-11-1', name: 'Physical World', chapterNumber: 1, topics: createTopics(['Nature of Physics', 'Scope', 'Scientific Method']) },
            { id: 'phy-11-2', name: 'Units and Measurements', chapterNumber: 2, topics: createTopics(['SI Units', 'Errors', 'Significant Figures']) },
            { id: 'phy-11-3', name: 'Motion in a Straight Line', chapterNumber: 3, topics: createTopics(['Kinematics', 'Equations', 'Graphs']) },
            { id: 'phy-11-4', name: 'Motion in a Plane', chapterNumber: 4, topics: createTopics(['Vectors', 'Projectile', 'Circular Motion']) },
            { id: 'phy-11-5', name: 'Laws of Motion', chapterNumber: 5, topics: createTopics(['Newton\'s Laws', 'Friction', 'Circular Motion']) },
        ],
        12: [
            { id: 'phy-12-1', name: 'Electric Charges and Fields', chapterNumber: 1, topics: createTopics(['Coulomb\'s Law', 'Electric Field', 'Gauss Law']) },
            { id: 'phy-12-2', name: 'Electrostatic Potential', chapterNumber: 2, topics: createTopics(['Potential', 'Capacitance', 'Dielectrics']) },
            { id: 'phy-12-3', name: 'Current Electricity', chapterNumber: 3, topics: createTopics(['Ohm\'s Law', 'Kirchhoff\'s Laws', 'Circuits']) },
            { id: 'phy-12-4', name: 'Moving Charges and Magnetism', chapterNumber: 4, topics: createTopics(['Biot-Savart', 'Ampere\'s Law', 'Force']) },
            { id: 'phy-12-5', name: 'Electromagnetic Induction', chapterNumber: 5, topics: createTopics(['Faraday\'s Law', 'Lenz\'s Law', 'AC Generator']) },
        ],
    };
    return chapters[gradeNumber] || [];
}

function createChemistryChapters(gradeNumber: number): Chapter[] {
    const chapters: Record<number, Chapter[]> = {
        11: [
            { id: 'chem-11-1', name: 'Some Basic Concepts', chapterNumber: 1, topics: createTopics(['Atomic Theory', 'Mole Concept', 'Stoichiometry']) },
            { id: 'chem-11-2', name: 'Structure of Atom', chapterNumber: 2, topics: createTopics(['Atomic Models', 'Quantum Numbers', 'Orbitals']) },
            { id: 'chem-11-3', name: 'Classification of Elements', chapterNumber: 3, topics: createTopics(['Periodic Table', 'Trends', 'Properties']) },
            { id: 'chem-11-4', name: 'Chemical Bonding', chapterNumber: 4, topics: createTopics(['Ionic Bond', 'Covalent Bond', 'VSEPR']) },
        ],
        12: [
            { id: 'chem-12-1', name: 'Solid State', chapterNumber: 1, topics: createTopics(['Crystal Lattice', 'Defects', 'Properties']) },
            { id: 'chem-12-2', name: 'Solutions', chapterNumber: 2, topics: createTopics(['Concentration', 'Colligative Properties', 'Osmosis']) },
            { id: 'chem-12-3', name: 'Electrochemistry', chapterNumber: 3, topics: createTopics(['Cells', 'Nernst Equation', 'Batteries']) },
            { id: 'chem-12-4', name: 'Chemical Kinetics', chapterNumber: 4, topics: createTopics(['Rate Laws', 'Order', 'Mechanism']) },
        ],
    };
    return chapters[gradeNumber] || [];
}

function createBiologyChapters(gradeNumber: number): Chapter[] {
    const chapters: Record<number, Chapter[]> = {
        11: [
            { id: 'bio-11-1', name: 'The Living World', chapterNumber: 1, topics: createTopics(['Characteristics', 'Taxonomy', 'Classification']) },
            { id: 'bio-11-2', name: 'Biological Classification', chapterNumber: 2, topics: createTopics(['Five Kingdoms', 'Monera', 'Protista']) },
            { id: 'bio-11-3', name: 'Plant Kingdom', chapterNumber: 3, topics: createTopics(['Algae', 'Bryophytes', 'Angiosperms']) },
            { id: 'bio-11-4', name: 'Animal Kingdom', chapterNumber: 4, topics: createTopics(['Invertebrates', 'Vertebrates', 'Classification']) },
        ],
        12: [
            { id: 'bio-12-1', name: 'Reproduction in Organisms', chapterNumber: 1, topics: createTopics(['Asexual', 'Sexual', 'Life Cycles']) },
            { id: 'bio-12-2', name: 'Sexual Reproduction in Flowering Plants', chapterNumber: 2, topics: createTopics(['Flower Structure', 'Pollination', 'Fertilization']) },
            { id: 'bio-12-3', name: 'Human Reproduction', chapterNumber: 3, topics: createTopics(['Reproductive System', 'Gametogenesis', 'Pregnancy']) },
            { id: 'bio-12-4', name: 'Principles of Inheritance', chapterNumber: 4, topics: createTopics(['Mendel\'s Laws', 'Chromosomes', 'Genetic Disorders']) },
        ],
    };
    return chapters[gradeNumber] || [];
}

function createCSChapters(gradeNumber: number): Chapter[] {
    const chapters: Record<number, Chapter[]> = {
        11: [
            { id: 'cs-11-1', name: 'Computer Systems', chapterNumber: 1, topics: createTopics(['Hardware', 'Software', 'Memory']) },
            { id: 'cs-11-2', name: 'Number Systems', chapterNumber: 2, topics: createTopics(['Binary', 'Octal', 'Hexadecimal', 'Conversion']) },
            { id: 'cs-11-3', name: 'Python Basics', chapterNumber: 3, topics: createTopics(['Syntax', 'Variables', 'Data Types', 'Operators']) },
            { id: 'cs-11-4', name: 'Control Structures', chapterNumber: 4, topics: createTopics(['Conditionals', 'Loops', 'Jump Statements']) },
        ],
        12: [
            { id: 'cs-12-1', name: 'Functions', chapterNumber: 1, topics: createTopics(['Definition', 'Arguments', 'Recursion']) },
            { id: 'cs-12-2', name: 'Data Structures', chapterNumber: 2, topics: createTopics(['Lists', 'Tuples', 'Dictionaries', 'Stacks']) },
            { id: 'cs-12-3', name: 'File Handling', chapterNumber: 3, topics: createTopics(['Text Files', 'Binary Files', 'CSV']) },
            { id: 'cs-12-4', name: 'SQL', chapterNumber: 4, topics: createTopics(['DDL', 'DML', 'Queries', 'Joins']) },
        ],
    };
    return chapters[gradeNumber] || [];
}

// Helper function to create topics from names
function createTopics(topicNames: string[]): Topic[] {
    return topicNames.map((name, index) => ({
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name,
        difficulty: index === 0 ? 'beginner' : index === topicNames.length - 1 ? 'advanced' : 'intermediate',
        duration: `${20 + index * 5} min`,
        progress: 0
    }));
}

// ============================================
// SCHOOL GRADES (CLASSES 1-12)
// ============================================

export const schoolGrades: SchoolGrade[] = [
    // PRIMARY LEVEL (Classes 1-5)
    {
        id: 'class-1',
        name: 'Class 1',
        gradeNumber: 1,
        level: 'primary',
        ageGroup: '6-7 years',
        description: 'Foundation learning with fun activities',
        color: '#22c55e',
        subjects: createPrimarySubjects(1)
    },
    {
        id: 'class-2',
        name: 'Class 2',
        gradeNumber: 2,
        level: 'primary',
        ageGroup: '7-8 years',
        description: 'Building basic literacy and numeracy',
        color: '#22c55e',
        subjects: createPrimarySubjects(2)
    },
    {
        id: 'class-3',
        name: 'Class 3',
        gradeNumber: 3,
        level: 'primary',
        ageGroup: '8-9 years',
        description: 'Exploring the world around us',
        color: '#22c55e',
        subjects: createPrimarySubjects(3)
    },
    {
        id: 'class-4',
        name: 'Class 4',
        gradeNumber: 4,
        level: 'primary',
        ageGroup: '9-10 years',
        description: 'Developing critical thinking skills',
        color: '#22c55e',
        subjects: createPrimarySubjects(4)
    },
    {
        id: 'class-5',
        name: 'Class 5',
        gradeNumber: 5,
        level: 'primary',
        ageGroup: '10-11 years',
        description: 'Preparing for middle school transition',
        color: '#22c55e',
        subjects: createPrimarySubjects(5)
    },

    // MIDDLE LEVEL (Classes 6-8)
    {
        id: 'class-6',
        name: 'Class 6',
        gradeNumber: 6,
        level: 'middle',
        ageGroup: '11-12 years',
        description: 'Introduction to specialized subjects',
        color: '#3b82f6',
        subjects: createMiddleSubjects(6)
    },
    {
        id: 'class-7',
        name: 'Class 7',
        gradeNumber: 7,
        level: 'middle',
        ageGroup: '12-13 years',
        description: 'Deepening subject knowledge',
        color: '#3b82f6',
        subjects: createMiddleSubjects(7)
    },
    {
        id: 'class-8',
        name: 'Class 8',
        gradeNumber: 8,
        level: 'middle',
        ageGroup: '13-14 years',
        description: 'Advanced middle school concepts',
        color: '#3b82f6',
        subjects: createMiddleSubjects(8)
    },

    // SECONDARY LEVEL (Classes 9-10)
    {
        id: 'class-9',
        name: 'Class 9',
        gradeNumber: 9,
        level: 'secondary',
        ageGroup: '14-15 years',
        description: 'Board exam preparation begins',
        color: '#8b5cf6',
        subjects: createSecondarySubjects(9)
    },
    {
        id: 'class-10',
        name: 'Class 10',
        gradeNumber: 10,
        level: 'secondary',
        ageGroup: '15-16 years',
        description: 'Board examination year',
        color: '#8b5cf6',
        subjects: createSecondarySubjects(10)
    },

    // SENIOR SECONDARY LEVEL (Classes 11-12)
    {
        id: 'class-11',
        name: 'Class 11 (Science)',
        gradeNumber: 11,
        level: 'senior-secondary',
        ageGroup: '16-17 years',
        description: 'Science stream with PCM/PCB',
        color: '#f59e0b',
        subjects: createSeniorScienceSubjects(11)
    },
    {
        id: 'class-12',
        name: 'Class 12 (Science)',
        gradeNumber: 12,
        level: 'senior-secondary',
        ageGroup: '17-18 years',
        description: 'Board exam and competitive prep',
        color: '#f59e0b',
        subjects: createSeniorScienceSubjects(12)
    },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getGradeById = (gradeId: string): SchoolGrade | undefined => {
    return schoolGrades.find(g => g.id === gradeId);
};

export const getSubjectById = (gradeId: string, subjectId: string): SchoolSubject | undefined => {
    const grade = getGradeById(gradeId);
    return grade?.subjects.find(s => s.id === subjectId);
};

export const getChapterById = (gradeId: string, subjectId: string, chapterId: string): Chapter | undefined => {
    const subject = getSubjectById(gradeId, subjectId);
    return subject?.chapters.find(c => c.id === chapterId);
};

export const getGradesByLevel = (level: SchoolGrade['level']): SchoolGrade[] => {
    return schoolGrades.filter(g => g.level === level);
};

export const getTotalTopicsInGrade = (gradeId: string): number => {
    const grade = getGradeById(gradeId);
    if (!grade) return 0;
    return grade.subjects.reduce((total, subject) =>
        total + subject.chapters.reduce((chTotal, chapter) =>
            chTotal + chapter.topics.length, 0
        ), 0
    );
};

export const getTotalTopicsInSubject = (gradeId: string, subjectId: string): number => {
    const subject = getSubjectById(gradeId, subjectId);
    if (!subject) return 0;
    return subject.chapters.reduce((total, chapter) => total + chapter.topics.length, 0);
};
