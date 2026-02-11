import type { VisualProps } from './topicVisuals';
import {
    ACCircuitVisual,
    APIDesignVisual,
    AnxietyVisual,
    ArcheologyVisual,
    AtomicStructureVisual,
    BloodFlowVisual,
    BrainStructureVisual,
    BusinessHierarchyVisual,
    BusinessManagementVisual,
    CBTVisual,
    CellStructureVisual,
    ChemicalReactionVisual,
    CircuitAdvancedVisual,
    ContractFormationVisual,
    CoronaryArteriesVisual,
    DCCircuitVisual,
    DefaultTopicVisual,
    DemocracyFlowVisual,
    DigestiveSystemVisual,
    DNAReplicationVisual,
    DNAStructureVisual,
    DNATranscriptionVisual,
    DNATranslationVisual,
    ECGBasicsVisual,
    EconomicFlowVisual,
    EncryptionVisual,
    EquationVisual,
    EssayStructureVisual,
    GeometryConicsVisual,
    GeometryShapesVisual,
    GlobeVisual,
    GraphVisualizationVisual,
    HeartValvesVisual,
    HeritageVisual,
    HeredityVisual,
    IndiaMapVisual,
    KinematicsVisual,
    LiteratureVisual,
    MagneticFieldVisual,
    NeuralNetworkVisual,
    NeuronVisual,
    NewtonsLawsVisual,
    NumberLineVisual,
    OpticsVisual,
    OrganicMolecularVisual,
    PeriodicTableVisual,
    PhotosynthesisVisual,
    PoetryAnalysisVisual,
    ReactComponentVisual,
    RespiratorySystemVisual,
    SentenceStructureVisual,
    SEOVisual,
    SolarSystemVisual,
    SortingAlgorithmVisual,
    SpinalCordVisual,
    SQLBasicsVisual,
    StockMarketVisual,
    StoryMapVisual,
    StrokeVisual,
    SupervisedLearningVisual,
    TenseTimelineVisual,
    ThermodynamicsVisual,
    TimelineVisual,
    WaterCycleVisual,
} from './topicVisuals';

type VisualComponent = (props: VisualProps) => JSX.Element;

const TopicVisualRegistry: Record<string, VisualComponent> = {
    // ============================================
    // GRADE 6 TOPICS
    // ============================================
    'knowing-numbers': GraphVisualizationVisual,
    'whole-numbers': NumberLineVisual,
    'integers-intro': NumberLineVisual,
    'fractions-decimals': GraphVisualizationVisual,
    'algebra-intro': GraphVisualizationVisual,
    'food-sources': CellStructureVisual,
    'components-food': CellStructureVisual,
    'fibre-to-fabric': DNAStructureVisual,
    'sorting-materials': DefaultTopicVisual,
    'electricity-circuits': DCCircuitVisual,
    'what-where-how-when': TimelineVisual,
    'solar-system': SolarSystemVisual,
    'globe-lat-long': GlobeVisual,
    'earliest-societies': TimelineVisual,
    'diversity-livelihood': DefaultTopicVisual,
    'local-government': ContractFormationVisual,
    'prose-poetry-intro': StoryMapVisual,
    'basic-grammar': SentenceStructureVisual,
    'tenses-intro': TenseTimelineVisual,
    'comprehension-skills': DefaultTopicVisual,
    'creative-writing-intro': StoryMapVisual,

    // ============================================
    // GRADE 7 TOPICS
    // ============================================
    'integers-props': NumberLineVisual,
    'rational-numbers': NumberLineVisual,
    'simple-equations': GraphVisualizationVisual,
    'lines-angles': GeometryShapesVisual,
    'triangles-props': GeometryShapesVisual,
    'nutrition-plants': PhotosynthesisVisual,
    'nutrition-animals': DigestiveSystemVisual,
    'heat-transfer': ThermodynamicsVisual,
    'acids-bases-salts': ChemicalReactionVisual,
    'respiration-organisms': RespiratorySystemVisual,
    'medieval-world': TimelineVisual,
    'our-environment-7': WaterCycleVisual,
    'democracy-equality': DemocracyFlowVisual,
    'markets-around-us': StockMarketVisual,
    'advanced-grammar': SentenceStructureVisual,
    'story-elements': StoryMapVisual,
    'poetry-analysis': PoetryAnalysisVisual,
    'letter-writing': EssayStructureVisual,

    // ============================================
    // GRADE 8 TOPICS
    // ============================================
    'rational-ops': GraphVisualizationVisual,
    'linear-equations': GraphVisualizationVisual,
    'quadrilaterals': GeometryShapesVisual,
    'squares-roots': NumberLineVisual,
    'cubes-roots': GraphVisualizationVisual,
    'exponents-powers': GraphVisualizationVisual,
    'crop-production': CellStructureVisual,
    'microorganisms': CellStructureVisual,
    'synthetic-fibres': DNAStructureVisual,
    'metals-nonmetals': AtomicStructureVisual,
    'force-pressure': NewtonsLawsVisual,
    'friction': NewtonsLawsVisual,
    'modern-period': TimelineVisual,
    'resources-types': WaterCycleVisual,
    'constitution-8': DemocracyFlowVisual,
    'understanding-laws': ContractFormationVisual,
    'active-passive': SentenceStructureVisual,
    'reported-speech': SentenceStructureVisual,
    'essay-writing': EssayStructureVisual,
    'lit-analysis-8': PoetryAnalysisVisual,

    // ============================================
    // GRADE 9 TOPICS
    // ============================================
    'number-systems': GraphVisualizationVisual,
    'polynomials': GraphVisualizationVisual,
    'coord-geometry': GraphVisualizationVisual,
    'linear-eq-2-vars': GraphVisualizationVisual,
    'euclids-geometry': GraphVisualizationVisual,
    'triangles': GraphVisualizationVisual,
    'circles': GraphVisualizationVisual,
    'herons-formula': GraphVisualizationVisual,
    'surface-areas-volumes': GraphVisualizationVisual,
    'probability': GraphVisualizationVisual,
    'matter-surroundings': ThermodynamicsVisual,
    'is-matter-pure': ChemicalReactionVisual,
    'atoms-molecules': AtomicStructureVisual,
    'structure-atom': AtomicStructureVisual,
    'cell-life': CellStructureVisual,
    'tissues': CellStructureVisual,
    'motion': KinematicsVisual,
    'force-laws-motion': NewtonsLawsVisual,
    'gravitation': NewtonsLawsVisual,
    'work-energy': ThermodynamicsVisual,
    'sound': ACCircuitVisual,
    'french-revolution': TimelineVisual,
    'nazism': TimelineVisual,
    'india-size-location': GlobeVisual,
    'drainage-9': GlobeVisual,
    'democracy-9': DemocracyFlowVisual,
    'poverty-challenge': EconomicFlowVisual,
    'prose-9': StoryMapVisual,
    'poetry-9': PoetryAnalysisVisual,
    'grammar-modals': TenseTimelineVisual,
    'writing-skills-9': EssayStructureVisual,

    // ============================================
    // GRADE 10 TOPICS
    // ============================================
    'real-numbers': NumberLineVisual,
    'polynomials-10': EquationVisual,
    'linear-eq-pair': EquationVisual,
    'quadratic-eq': EquationVisual,
    'arithmetic-prog': GraphVisualizationVisual,
    'triangles-sim': GeometryShapesVisual,
    'coordinate-geo-circles': GeometryShapesVisual,
    'trig-intro': GeometryShapesVisual,
    'trig-apps': GeometryShapesVisual,
    'constructions': GeometryShapesVisual,
    'areas-circles': GeometryShapesVisual,
    'stat-prob': GraphVisualizationVisual,
    'chem-reactions-10': ChemicalReactionVisual,
    'acids-bases-salts-10': ChemicalReactionVisual,
    'metals-nonmetals-10': ChemicalReactionVisual,
    'carbon-compounds': AtomicStructureVisual,

    // Grade 10 Science - Physics, Biology, and remaining topics
    'periodic-classification': AtomicStructureVisual,
    'life-processes-10': CellStructureVisual,
    'control-coordination': NeuronVisual,
    'reproduction': CellStructureVisual,
    'heredity-evolution': HeredityVisual,
    'light-ref-ref': OpticsVisual,
    'human-eye-world': OpticsVisual,
    'electricity-10': CircuitAdvancedVisual,
    'magnetic-effects': MagneticFieldVisual,
    'sources-energy': ThermodynamicsVisual,

    // Grade 10 Social Science
    'nationalism-india': HeritageVisual,
    'making-global-world': StockMarketVisual,
    'resources-development-10': WaterCycleVisual,
    'agriculture-10': CellStructureVisual,
    'power-sharing': DemocracyFlowVisual,
    'development-10': EconomicFlowVisual,

    // Grade 10 English
    'prose-10': LiteratureVisual,
    'poetry-10': LiteratureVisual,
    'grammar-advanced-10': SentenceStructureVisual,
    'analytical-paragraph': EssayStructureVisual,

    // ============================================
    // COMPETITIVE EXAMS - NEET
    // ============================================
    'neet-mechanics': NewtonsLawsVisual,
    'neet-optics': OpticsVisual,
    'neet-modern-physics': AtomicStructureVisual,
    'neet-physical-chem': ChemicalReactionVisual,
    'neet-organic-chem': AtomicStructureVisual,
    'neet-botany': CellStructureVisual,
    'neet-zoology': DigestiveSystemVisual,

    // ============================================
    // COMPETITIVE EXAMS - JEE
    // ============================================
    'jee-calculus': EquationVisual,
    'jee-algebra': EquationVisual,
    'jee-coord-geo': GeometryShapesVisual,
    'jee-electrodynamics': CircuitAdvancedVisual,
    'jee-thermal-physics': ThermodynamicsVisual,
    'jee-adv-calculus': EquationVisual,
    'jee-adv-algebra': EquationVisual,
    'jee-adv-vectors': GeometryShapesVisual,
    'jee-adv-prob': GraphVisualizationVisual,
    'jee-adv-mechanics': NewtonsLawsVisual,
    'jee-adv-em': MagneticFieldVisual,
    'jee-adv-thermo': ThermodynamicsVisual,
    'jee-adv-optics': OpticsVisual,
    'jee-adv-inorganic': ChemicalReactionVisual,
    'jee-adv-organic-mech': ChemicalReactionVisual,

    // ============================================
    // COMPETITIVE EXAMS - EAMCET
    // ============================================
    'eamcet-algebra': GraphVisualizationVisual,
    'eamcet-trigonometry': GraphVisualizationVisual,
    'eamcet-calculus': GraphVisualizationVisual,
    'eamcet-mechanics': NewtonsLawsVisual,
    'eamcet-heat': ThermodynamicsVisual,

    // ============================================
    // COMPETITIVE EXAMS - GATE
    // ============================================
    'gate-algorithms': SortingAlgorithmVisual,
    'gate-data-structures': GraphVisualizationVisual,
    'gate-os': DefaultTopicVisual,
    'gate-dbms': SQLBasicsVisual,
    'gate-cn': APIDesignVisual,
    'gate-system-design': APIDesignVisual,
    'gate-quant': GraphVisualizationVisual,
    'gate-verbal': DefaultTopicVisual,

    // ============================================
    // COMPETITIVE EXAMS - CAT
    // ============================================
    'cat-arithmetic': GraphVisualizationVisual,
    'cat-algebra': GraphVisualizationVisual,
    'cat-geometry': GraphVisualizationVisual,
    'cat-number-sys': GraphVisualizationVisual,
    'cat-rc': DefaultTopicVisual,
    'cat-vocab': DefaultTopicVisual,
    'cat-para-summary': DefaultTopicVisual,
    'cat-di': GraphVisualizationVisual,
    'cat-lr': BrainStructureVisual,
    'cat-data-suff': GraphVisualizationVisual,

    // ============================================
    // COMPETITIVE EXAMS - UPSC
    // ============================================
    'upsc-history': HeritageVisual,
    'upsc-geography': IndiaMapVisual,
    'upsc-polity': DemocracyFlowVisual,
    'upsc-eco': EconomicFlowVisual,
    'upsc-ethics': DefaultTopicVisual,
    'upsc-reasoning': BrainStructureVisual,
    'upsc-comprehension': DefaultTopicVisual,

    // ============================================
    // COMPETITIVE EXAMS - CLAT
    // ============================================
    'clat-legal-apt': ContractFormationVisual,
    'clat-constitution': DemocracyFlowVisual,
    'clat-torts': ContractFormationVisual,
    'clat-rc': DefaultTopicVisual,
    'clat-current': IndiaMapVisual,
    'clat-awards': SEOVisual,

    // ============================================
    // COMPETITIVE EXAMS - NIFT
    // ============================================
    'nift-design': DefaultTopicVisual,
    'nift-sketching': DefaultTopicVisual,
    'nift-color': DefaultTopicVisual,
    'nift-quant': GraphVisualizationVisual,
    'nift-verbal': DefaultTopicVisual,

    // ============================================
    // COMPETITIVE EXAMS - NDA
    // ============================================
    'nda-algebra': GraphVisualizationVisual,
    'nda-calculus': GraphVisualizationVisual,
    'nda-trigonometry': GraphVisualizationVisual,
    'nda-english': DefaultTopicVisual,
    'nda-gk': DefaultTopicVisual,
    'nda-defense': DefaultTopicVisual,

    // ============================================
    // SUBJECT-LEVEL IDs - INTERMEDIATE GROUPS
    // ============================================
    // MPC Subject IDs
    'mpc-i1-math': GraphVisualizationVisual,
    'mpc-i1-physics': NewtonsLawsVisual,
    'mpc-i1-chemistry': DNAStructureVisual,
    'mpc-i2-math': GraphVisualizationVisual,
    'mpc-i2-physics': ACCircuitVisual,
    'mpc-i2-chemistry': DNAStructureVisual,
    // BiPC Subject IDs
    'bipc-i1-biology': CellStructureVisual,
    'bipc-i1-physics': NewtonsLawsVisual,
    'bipc-i1-chemistry': DNAStructureVisual,
    'bipc-i2-biology': CellStructureVisual,
    'bipc-i2-physics': ACCircuitVisual,
    'bipc-i2-chemistry': DNAStructureVisual,
    // CEC Subject IDs
    'cec-i1-commerce': StockMarketVisual,
    'cec-i1-economics': GraphVisualizationVisual,
    'cec-i1-civics': ContractFormationVisual,
    'cec-i2-commerce': StockMarketVisual,
    'cec-i2-economics': GraphVisualizationVisual,
    'cec-i2-civics': ContractFormationVisual,
    // MEC Subject IDs
    'mec-i1-math': GraphVisualizationVisual,
    'mec-i1-economics': StockMarketVisual,
    'mec-i1-commerce': StockMarketVisual,
    'mec-i2-math': GraphVisualizationVisual,
    'mec-i2-economics': StockMarketVisual,
    'mec-i2-commerce': StockMarketVisual,
    // HEC Subject IDs
    'hec-i1-history': HeritageVisual,
    'hec-i1-economics': EconomicFlowVisual,
    'hec-i1-civics': DemocracyFlowVisual,
    'hec-i2-history': HeritageVisual,
    'hec-i2-economics': EconomicFlowVisual,
    'hec-i2-civics': DemocracyFlowVisual,

    // ============================================
    // SUBJECT-LEVEL IDs - COMPETITIVE EXAMS
    // ============================================
    'neet-physics': NewtonsLawsVisual,
    'neet-chemistry': ChemicalReactionVisual,
    'neet-biology': CellStructureVisual,
    'jee-math': EquationVisual,
    'jee-physics': NewtonsLawsVisual,
    'jee-adv-math': EquationVisual,
    'jee-adv-physics': OpticsVisual,
    'jee-adv-chemistry': AtomicStructureVisual,
    'eamcet-math': EquationVisual,
    'eamcet-physics': NewtonsLawsVisual,
    'gate-cs': NeuralNetworkVisual,
    'gate-aptitude': GraphVisualizationVisual,

    // ============================================
    // INTERMEDIATE - MPC (Mathematics, Physics, Chemistry)
    // ============================================
    // MPC Inter 1st Year - Math
    'functions': GraphVisualizationVisual,
    'mathematical-induction': GraphVisualizationVisual,
    'matrices-i1': GraphVisualizationVisual,
    'addition-vectors': KinematicsVisual,
    'product-vectors': KinematicsVisual,
    'trigonometric-ratios': GraphVisualizationVisual,
    'trigonometric-equations': GraphVisualizationVisual,
    'hyperbolic-functions': GraphVisualizationVisual,
    // MPC Inter 1st Year - Physics
    'physical-world': NewtonsLawsVisual,
    'units-dimensions': NewtonsLawsVisual,
    'motion-straight-line': KinematicsVisual,
    'motion-plane-i1': KinematicsVisual,
    'laws-motion-i1': NewtonsLawsVisual,
    'work-energy-i1': ThermodynamicsVisual,
    'oscillations': ACCircuitVisual,
    'waves-i1': ACCircuitVisual,
    // MPC Inter 1st Year - Chemistry
    'atomic-structure-i1': AtomicStructureVisual,
    'classification-elements': PeriodicTableVisual,
    'chemical-bonding-i1': OrganicMolecularVisual,
    'states-matter': ThermodynamicsVisual,
    'thermodynamics-i1': ThermodynamicsVisual,
    'equilibrium-i1': ChemicalReactionVisual,
    'stoichiometry': ChemicalReactionVisual,
    // MPC Inter 2nd Year - Math
    'system-circles': GeometryShapesVisual,
    'parabola': GeometryConicsVisual,
    'ellipse': GeometryConicsVisual,
    'hyperbola': GeometryConicsVisual,
    'integration-i2': GraphVisualizationVisual,
    'differential-equations-i2': EquationVisual,
    'probability-i2': GraphVisualizationVisual,
    // MPC Inter 2nd Year - Physics
    'waves-optics': ACCircuitVisual,
    'ray-optics-i2': ACCircuitVisual,
    'electrostatics-i2': ACCircuitVisual,
    'current-electricity-i2': DCCircuitVisual,
    'magnetism-i2': ACCircuitVisual,
    'electromagnetic-induction': ACCircuitVisual,
    'atoms-nuclei-i2': DNAStructureVisual,
    'semiconductors': DCCircuitVisual,
    // MPC Inter 2nd Year - Chemistry
    'solid-state-i2': AtomicStructureVisual,
    'solutions-i2': ChemicalReactionVisual,
    'electrochemistry-i2': DCCircuitVisual,
    'chemical-kinetics-i2': AtomicStructureVisual,
    'organic-chemistry-i2': OrganicMolecularVisual,
    'haloalkanes': OrganicMolecularVisual,
    'alcohols-phenols': OrganicMolecularVisual,
    'polymers': OrganicMolecularVisual,

    // ============================================
    // INTERMEDIATE - BiPC (Biology, Physics, Chemistry)
    // ============================================
    // BiPC Inter 1st Year - Biology
    'diversity-living': CellStructureVisual,
    'structural-org-plants': CellStructureVisual,
    'structural-org-animals': CellStructureVisual,
    'cell-structure-bio': CellStructureVisual,
    'plant-physiology': CellStructureVisual,
    'human-physiology-i1': HeartValvesVisual,
    // BiPC Inter 1st Year - Physics
    'physical-world-bi': NewtonsLawsVisual,
    'units-dimensions-bi': NewtonsLawsVisual,
    'motion-bi': KinematicsVisual,
    'laws-motion-bi': NewtonsLawsVisual,
    'work-energy-bi': ThermodynamicsVisual,
    'thermal-properties': ThermodynamicsVisual,
    // BiPC Inter 1st Year - Chemistry
    'atomic-structure-bi': AtomicStructureVisual,
    'periodic-table-bi': PeriodicTableVisual,
    'chemical-bonding-bi': OrganicMolecularVisual,
    'states-matter-bi': ThermodynamicsVisual,
    'thermodynamics-bi': ThermodynamicsVisual,
    'equilibrium-bi': ChemicalReactionVisual,
    // BiPC Inter 2nd Year - Biology
    'reproduction-organisms': CellStructureVisual,
    'human-reproduction-i2': CellStructureVisual,
    'genetics-inheritance': HeredityVisual,
    'molecular-genetics': DNAReplicationVisual,
    'evolution-bio': DefaultTopicVisual,
    'biotechnology': DNAReplicationVisual,
    'ecology-environment': DefaultTopicVisual,
    // BiPC Inter 2nd Year - Physics
    'ray-optics-bi': ACCircuitVisual,
    'wave-optics-bi': ACCircuitVisual,
    'electrostatics-bi': ACCircuitVisual,
    'current-electricity-bi': DCCircuitVisual,
    'magnetism-bi': ACCircuitVisual,
    'modern-physics-bi': DNAStructureVisual,
    // BiPC Inter 2nd Year - Chemistry
    'solid-state-bi': AtomicStructureVisual,
    'solutions-bi': ChemicalReactionVisual,
    'electrochemistry-bi': DCCircuitVisual,
    'organic-chem-bi': OrganicMolecularVisual,
    'biomolecules-bi': OrganicMolecularVisual,
    'chemistry-everyday': OrganicMolecularVisual,

    // ============================================
    // INTERMEDIATE - CEC (Commerce, Economics, Civics)
    // ============================================
    // CEC Inter 1st Year - Commerce
    'nature-business': BusinessManagementVisual,
    'forms-business-org': StockMarketVisual,
    'business-services': StockMarketVisual,
    'emerging-business': StockMarketVisual,
    'social-responsibility': BusinessHierarchyVisual,
    'internal-trade': StockMarketVisual,
    // CEC Inter 1st Year - Economics
    'intro-economics': EconomicFlowVisual,
    'consumer-equilibrium': GraphVisualizationVisual,
    'demand-supply': GraphVisualizationVisual,
    'elasticity': GraphVisualizationVisual,
    'production-cost': GraphVisualizationVisual,
    'market-forms': StockMarketVisual,
    // CEC Inter 1st Year - Civics
    'indian-constitution': DemocracyFlowVisual,
    'fundamental-rights': ContractFormationVisual,
    'directive-principles': DemocracyFlowVisual,
    'union-executive': ContractFormationVisual,
    'parliament': ContractFormationVisual,
    'judiciary': ContractFormationVisual,
    // CEC Inter 2nd Year - Commerce
    'principles-management': BusinessManagementVisual,
    'business-environment': BusinessManagementVisual,
    'planning': BusinessManagementVisual,
    'organising': BusinessHierarchyVisual,
    'directing': BusinessManagementVisual,
    'controlling': BusinessManagementVisual,
    'financial-management': StockMarketVisual,
    // CEC Inter 2nd Year - Economics
    'national-income': StockMarketVisual,
    'money-banking': StockMarketVisual,
    'aggregate-demand-supply': GraphVisualizationVisual,
    'government-budget': StockMarketVisual,
    'balance-payments': StockMarketVisual,
    'indian-economy': StockMarketVisual,
    // CEC Inter 2nd Year - Civics
    'state-executive': ContractFormationVisual,
    'state-legislature': ContractFormationVisual,
    // 'local-government' already defined in Grade 6 topics (line 59)
    'election-commission': ContractFormationVisual,
    'political-parties': ContractFormationVisual,
    'contemporary-issues': DefaultTopicVisual,

    // ============================================
    // INTERMEDIATE - MEC (Mathematics, Economics, Commerce)
    // ============================================
    'functions-mec': GraphVisualizationVisual,
    'matrices-mec': GraphVisualizationVisual,
    'trigonometry-mec': GraphVisualizationVisual,
    'sequences-series': GraphVisualizationVisual,
    'permutations-mec': GraphVisualizationVisual,
    'probability-mec': GraphVisualizationVisual,
    'intro-economics-mec': StockMarketVisual,
    'consumer-theory-mec': GraphVisualizationVisual,
    'demand-supply-mec': GraphVisualizationVisual,
    'elasticity-mec': GraphVisualizationVisual,
    'production-mec': GraphVisualizationVisual,
    'cost-theory-mec': GraphVisualizationVisual,
    'business-nature-mec': StockMarketVisual,
    'business-org-mec': StockMarketVisual,
    'business-services-mec': StockMarketVisual,
    'trade-mec': StockMarketVisual,
    'business-ethics-mec': DefaultTopicVisual,
    'calculus-mec': GraphVisualizationVisual,
    'integration-mec': GraphVisualizationVisual,
    'linear-programming': GraphVisualizationVisual,
    'statistics-mec': GraphVisualizationVisual,
    'diff-equations-mec': GraphVisualizationVisual,
    'national-income-mec': StockMarketVisual,
    'money-banking-mec': StockMarketVisual,
    'macro-equilibrium': GraphVisualizationVisual,
    'fiscal-policy-mec': StockMarketVisual,
    'international-trade-mec': StockMarketVisual,
    'management-mec': BusinessManagementVisual,
    'marketing-mec': BusinessManagementVisual,
    'finance-mec': StockMarketVisual,
    'stock-market': StockMarketVisual,
    'entrepreneurship': BusinessManagementVisual,

    // ============================================
    // INTERMEDIATE - HEC (History, Economics, Civics)
    // ============================================
    'ancient-india-intro': ArcheologyVisual,
    'indus-valley': ArcheologyVisual,
    'vedic-culture': ArcheologyVisual,
    'mauryan-empire': HeritageVisual,
    'gupta-age': HeritageVisual,
    'medieval-india-intro': HeritageVisual,
    'mughal-administration': HeritageVisual,
    'colonial-rule-india': HeritageVisual,
    'indian-independence-movement': HeritageVisual,
    'post-independence-india': HeritageVisual,

    // ============================================
    // SENIOR SECONDARY - GRADE 11
    // ============================================
    // Grade 11 Physics
    'units-measurements': DefaultTopicVisual,
    'motion-plane': KinematicsVisual,
    'laws-of-motion': NewtonsLawsVisual,
    'work-energy-power': ThermodynamicsVisual,
    'rotational-motion': NewtonsLawsVisual,
    'gravitation-11': NewtonsLawsVisual,
    'thermodynamics-11': ThermodynamicsVisual,
    'kinetic-theory': ThermodynamicsVisual,
    'waves': ACCircuitVisual,
    'system-particles': NewtonsLawsVisual,
    'physics-geography': IndiaMapVisual,
    // Grade 11 Chemistry
    'basic-chem-concepts': AtomicStructureVisual,
    'structure-atom-11': AtomicStructureVisual,
    'chemical-bonding': OrganicMolecularVisual,
    'states-of-matter': ThermodynamicsVisual,
    'thermodynamics-chem': ThermodynamicsVisual,
    'equilibrium': ChemicalReactionVisual,
    'redox-reactions': DCCircuitVisual,
    'organic-chem-basics': OrganicMolecularVisual,
    // Grade 11 Biology
    'living-world': CellStructureVisual,
    'biological-classification': CellStructureVisual,
    'plant-kingdom': CellStructureVisual,
    'animal-kingdom': CellStructureVisual,
    'cell-cycle': CellStructureVisual,
    // Grade 11 Math
    'sets': GraphVisualizationVisual,
    'relations-functions': GraphVisualizationVisual,
    'trigonometric-functions': GraphVisualizationVisual,
    'complex-numbers': GraphVisualizationVisual,
    'permutations-combinations': GraphVisualizationVisual,
    'binomial-theorem': GraphVisualizationVisual,
    'limits-derivatives': GraphVisualizationVisual,
    // Grade 11 English
    'hornbill-prose': LiteratureVisual,
    'hornbill-poetry': LiteratureVisual,
    'snapshots': LiteratureVisual,
    'advanced-writing-11': EssayStructureVisual,

    // ============================================
    // SENIOR SECONDARY - GRADE 12
    // ============================================
    // Grade 12 Physics
    'electrostatics': ACCircuitVisual,
    'current-electricity': DCCircuitVisual,
    'moving-charges-mag': ACCircuitVisual,
    'mag-matter': ACCircuitVisual,
    'emi': ACCircuitVisual,
    'alternating-current': ACCircuitVisual,
    'em-waves': ACCircuitVisual,
    'ray-optics': ACCircuitVisual,
    'wave-optics': ACCircuitVisual,
    'dual-nature': DNAStructureVisual,
    'atoms-nuclei': DNAStructureVisual,
    'semiconductor-electronics': DCCircuitVisual,
    // Grade 12 Chemistry
    'the-solid-state': AtomicStructureVisual,
    'solutions': ChemicalReactionVisual,
    'electrochemistry': DCCircuitVisual,
    'chemical-kinetics': ChemicalReactionVisual,
    'surface-chemistry': ChemicalReactionVisual,
    'p-block-elements': DNAStructureVisual,
    'df-block-elements': DNAStructureVisual,
    'coordination-compounds': DNAStructureVisual,
    'haloalkanes-haloarenes': OrganicMolecularVisual,
    'alcohols-phenols-ethers': OrganicMolecularVisual,
    'aldehydes-ketones-acids': OrganicMolecularVisual,
    'amines': OrganicMolecularVisual,
    'biomolecules': CellStructureVisual,
    // Grade 12 Biology
    'human-reproduction': CellStructureVisual,
    'inheritance-variation': HeredityVisual,
    'evolution': DefaultTopicVisual,
    'ecology': DefaultTopicVisual,
    // Grade 12 Math
    'relations-functions-12': GraphVisualizationVisual,
    'inverse-trig': GraphVisualizationVisual,
    'matrices-determinants': GraphVisualizationVisual,
    'continuity-differentiability': GraphVisualizationVisual,
    'integrals': GraphVisualizationVisual,
    'differential-equations': GraphVisualizationVisual,
    'probability-12': GraphVisualizationVisual,
    // Grade 12 English
    'flamingo-prose': LiteratureVisual,
    'flamingo-poetry': LiteratureVisual,
    'vistas': LiteratureVisual,
    'advanced-writing-12': EssayStructureVisual,

    // ============================================
    // GENERAL AWARENESS
    // ============================================
    'psych-mental-health': AnxietyVisual,
    'pedagogy-basics': DefaultTopicVisual,

    // ============================================
    // LEGACY/MEDICAL VISUALS (from original)
    // ============================================
    'heart-structure': HeartValvesVisual,
    'valves': HeartValvesVisual,
    'blood-flow': BloodFlowVisual,
    'coronary-arteries': CoronaryArteriesVisual,
    'ecg-basics': ECGBasicsVisual,
    'echo': ECGBasicsVisual,
    'stress-test': ECGBasicsVisual,
    'arrhythmias': ECGBasicsVisual,
    'heart-failure': BloodFlowVisual,
    'brain-structure': BrainStructureVisual,
    'neurons': NeuronVisual,
    'spinal-cord': SpinalCordVisual,
    'stroke': StrokeVisual,
    'epilepsy': BrainStructureVisual,
    'cancer-biology': CellStructureVisual,
    'staging': CellStructureVisual,
    'milestones': DefaultTopicVisual,
    'vaccines': DefaultTopicVisual,
    'react-basics': ReactComponentVisual,
    'state-management': ReactComponentVisual,
    'api-design': APIDesignVisual,
    'sorting': SortingAlgorithmVisual,
    'graphs': GraphVisualizationVisual,
    'dynamic-programming': GraphVisualizationVisual,
    'sql-basics': SQLBasicsVisual,
    'nosql': GraphVisualizationVisual,
    'laws-thermo': ThermodynamicsVisual,
    'entropy': ThermodynamicsVisual,
    'statics': NewtonsLawsVisual,
    'dynamics': KinematicsVisual,
    'dc-circuits': DCCircuitVisual,
    'ac-circuits': ACCircuitVisual,
    'beams': NewtonsLawsVisual,
    'foundations': NewtonsLawsVisual,
    'contract-formation': ContractFormationVisual,
    'breach': ContractFormationVisual,
    'remedies': ContractFormationVisual,
    'directors': ContractFormationVisual,
    'shareholders': ContractFormationVisual,
    'investigation': ContractFormationVisual,
    'trial': ContractFormationVisual,
    'sentencing': ContractFormationVisual,
    'mens-rea': ContractFormationVisual,
    'defenses': ContractFormationVisual,
    'first-amendment': ContractFormationVisual,
    'due-process': ContractFormationVisual,
    'seo': SEOVisual,
    'social-media': SEOVisual,
    'content-marketing': SEOVisual,
    'brand-identity': SEOVisual,
    'positioning': SEOVisual,
    'stocks': StockMarketVisual,
    'bonds': StockMarketVisual,
    'portfolio': StockMarketVisual,
    'financial-statements': StockMarketVisual,
    'ratio-analysis': StockMarketVisual,
    'leadership-styles': BusinessManagementVisual,
    'team-building': BusinessHierarchyVisual,
    'newtons-laws': NewtonsLawsVisual,
    'kinematics': KinematicsVisual,
    'energy': ThermodynamicsVisual,
    'electric-fields': ACCircuitVisual,
    'magnetic-fields': ACCircuitVisual,
    'dna-structure': DNAStructureVisual,
    'dna-replication': DNAReplicationVisual,
    'replication': DNAReplicationVisual,
    'transcription': DNATranscriptionVisual,
    'translation': DNATranslationVisual,
    'heredity': HeredityVisual,
    'gene-expression': DNATranscriptionVisual,
    'cell-structure': CellStructureVisual,
    'cell-division': CellStructureVisual,
    'hydrocarbons': DNAStructureVisual,
    'functional-groups': DNAStructureVisual,
    'renaissance': DefaultTopicVisual,
    'modernism': DefaultTopicVisual,
    'contemporary': DefaultTopicVisual,
    'color-theory': DefaultTopicVisual,
    'composition': DefaultTopicVisual,
    'narrative': DefaultTopicVisual,
    'themes': DefaultTopicVisual,
    'supervised': SupervisedLearningVisual,
    'neural-networks': NeuralNetworkVisual,
    'unsupervised': SupervisedLearningVisual,
    'text-processing': SupervisedLearningVisual,
    'transformers': NeuralNetworkVisual,
    'firewalls': EncryptionVisual,
    'encryption': EncryptionVisual,
    'penetration': EncryptionVisual,
    'symmetric': EncryptionVisual,
    'asymmetric': EncryptionVisual,
    'ec2': SupervisedLearningVisual,
    's3': SupervisedLearningVisual,
    'active-learning': DefaultTopicVisual,
    'assessment': DefaultTopicVisual,
    'differentiation': DefaultTopicVisual,
    'learning-objectives': DefaultTopicVisual,
    'backward-design': DefaultTopicVisual,
    'iep': DefaultTopicVisual,
    'accommodations': DefaultTopicVisual,
    'anxiety': AnxietyVisual,
    'depression': AnxietyVisual,
    'ptsd': AnxietyVisual,
    'cbt': CBTVisual,
    'psychodynamic': CBTVisual,
    'memory-types': BrainStructureVisual,
    'forgetting': BrainStructureVisual,
};

// Map specific visuals to broader subject categories for fallback
const SubjectFallbackRegistry: Record<string, VisualComponent> = {
    'mathematics': GraphVisualizationVisual,
    'quantitative-aptitude': GraphVisualizationVisual,
    'data-interpretation': GraphVisualizationVisual,
    'mental-ability': GraphVisualizationVisual,
    'physics': NewtonsLawsVisual,
    'chemistry': AtomicStructureVisual,
    'science': AtomicStructureVisual,
    'biology': CellStructureVisual,
    'evs': GlobeVisual,
    'computer-science': NeuralNetworkVisual,
    'cs-&-it': NeuralNetworkVisual,
    'history': TimelineVisual,
    'geography': GlobeVisual,
    'social-science': DemocracyFlowVisual,
    'general-studies': DefaultTopicVisual,
    'general-awareness': DefaultTopicVisual,
    'literature': LiteratureVisual,
    'english': LiteratureVisual,
    'hindi': LiteratureVisual,
    'verbal-ability': LiteratureVisual,
    'economics': EconomicFlowVisual,
    'commerce': StockMarketVisual,
    'business-studies': BusinessManagementVisual,
    'law': ContractFormationVisual,
    'polity': DemocracyFlowVisual,
    'civics': DemocracyFlowVisual,
    'legal-aptitude': ContractFormationVisual,
    'legal-reasoning': ContractFormationVisual,
    'psychology': BrainStructureVisual,
    'medical': HeartValvesVisual,
    'design-aptitude': DefaultTopicVisual,
};

export type GetTopicVisualOptions = {
    visualType?: string;
    visualPrompt?: string;
    subjectName?: string;
    /**
     * When true (e.g. Teaching panel): only return a visual for a direct topic match.
     * No subject fallback and no DefaultTopicVisual — avoids any unrelated or generic visuals.
     */
    strictTopicOnly?: boolean;
};

export function getTopicVisual(topicId: string, visualData?: GetTopicVisualOptions): VisualComponent | null {
    // 1. Strict Topic Match — only this is allowed when strictTopicOnly is true
    if (TopicVisualRegistry[topicId]) {
        return TopicVisualRegistry[topicId];
    }

    // Teaching panel rule: display only visuals directly relevant to the current topic; no generic/off-topic visuals
    if (visualData?.strictTopicOnly) {
        return null;
    }

    // 2. Subject-Based Fallback (Preloaded Constraint) — not used in Teaching panel
    const subjectKey = visualData?.subjectName?.toLowerCase().replace(/\s+/g, '-');
    if (subjectKey) {
        if (SubjectFallbackRegistry[subjectKey]) {
            return SubjectFallbackRegistry[subjectKey];
        }
        const fallbackKey = Object.keys(SubjectFallbackRegistry).find(key => subjectKey.includes(key));
        if (fallbackKey && SubjectFallbackRegistry[fallbackKey]) {
            return SubjectFallbackRegistry[fallbackKey];
        }
    }

    // 3. Absolute Default — not used in Teaching panel
    return DefaultTopicVisual;
}
