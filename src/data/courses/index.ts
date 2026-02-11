import { TeachingStep } from '../../types';
import { bloodFlowSteps } from './bloodFlow';
import { brainStructureSteps } from './brainStructure';
import { contractFormationSteps } from './contractFormation';
import { coronaryArteriesSteps } from './coronaryArteries';
import { dnaStructureSteps } from './dnaStructure';
import { ecgBasicsSteps } from './ecgBasics';
import { encryptionSteps } from './encryption';
import { graphsSteps } from './graphs';
import { heartStructureSteps } from './heartStructure';
import { hereditySteps } from './heredity';
import { kinematicsSteps } from './kinematics';
import { neuronsSteps } from './neurons';
import { newtonsLawsSteps } from './newtonsLaws';
import { reactBasicsSteps } from './reactBasics';
import { sortingSteps } from './sorting';
import { sqlBasicsSteps } from './sqlBasics';
import { supervisedSteps } from './supervised';
import { valvesSteps } from './valves';
import { seoSteps } from './seo';
import { stateManagementSteps } from './stateManagement';
import { stocksSteps } from './stocks';
import { spinalCordSteps } from './spinalCord';
import { activeLearningSteps } from './activeLearning';
import { anxietySteps } from './anxiety';
import { apiDesignSteps } from './apiDesign';

/**
 * Mapping of curriculum topic IDs to static, high-quality course steps.
 * This allows the platform to prioritize expert-curated content over AI generation for core topics.
 */
export const STATIC_COURSES_REGISTRY: Record<string, TeachingStep[]> = {
    // School - Grade 10 Science
    'life-processes-10': heartStructureSteps,
    'heredity-evolution': hereditySteps,
    'control-coordination': brainStructureSteps,

    // School - Grade 9 Science
    'motion': kinematicsSteps,
    'force-laws-motion': newtonsLawsSteps,

    // School - Grade 11 Physics
    'laws-of-motion': newtonsLawsSteps,
    'motion-plane': kinematicsSteps,

    // School - Grade 11 Biology
    'cell-structure': neuronsSteps,
    'neural-control': spinalCordSteps,

    // School - Grade 12 Biology
    'molecular-genetics': dnaStructureSteps,
    'human-reproduction': bloodFlowSteps,

    // School - Grade 12 Chemistry
    'biomolecules': dnaStructureSteps,

    // Competitive - GATE
    'gate-algorithms': sortingSteps,
    'gate-data-structures': graphsSteps,
    'gate-dbms': sqlBasicsSteps,

    // Competitive - CLAT
    'clat-legal-apt': contractFormationSteps,

    // Competitive - NEET
    'neet-cardiology': ecgBasicsSteps,
    'neet-zoology': valvesSteps,
    'human-physiology-i1': coronaryArteriesSteps,
    'cell-structure-bio': neuronsSteps,
    'motion-bi': kinematicsSteps,
    'laws-motion-bi': newtonsLawsSteps,

    // Specialized mappings
    'ai-ml-basics': supervisedSteps,
    'computer-science-web': reactBasicsSteps,
    'cyber-security': encryptionSteps,
    'seo-marketing': seoSteps,
    'financial-markets': stocksSteps,
    'stock-market': stocksSteps,
    'react-advanced': stateManagementSteps,
    'gate-cn': encryptionSteps,
    'gate-system-design': apiDesignSteps,
    'psych-mental-health': anxietySteps,
    'pedagogy-basics': activeLearningSteps,
};

/**
 * Helper to get static course content if available for a given topic ID.
 */
export function getStaticCourse(topicId: string): TeachingStep[] | null {
    return STATIC_COURSES_REGISTRY[topicId] || null;
}
