import { TeachingStep } from '../types';
import { ecgBasicsSteps } from './courses/ecgBasics';
import { heartStructureSteps } from './courses/heartStructure';
import { valvesSteps } from './courses/valves';
import { bloodFlowSteps } from './courses/bloodFlow';
import { brainStructureSteps } from './courses/brainStructure';
import { neuronsSteps } from './courses/neurons';
import { reactBasicsSteps } from './courses/reactBasics';
import { stateManagementSteps } from './courses/stateManagement';
import { sortingSteps } from './courses/sorting';
import { newtonsLawsSteps } from './courses/newtonsLaws';
import { dnaStructureSteps } from './courses/dnaStructure';
import { seoSteps } from './courses/seo';
import { stocksSteps } from './courses/stocks';
import { supervisedSteps } from './courses/supervised';
import { encryptionSteps } from './courses/encryption';
import { kinematicsSteps } from './courses/kinematics';
import { hereditySteps } from './courses/heredity';
import { contractFormationSteps } from './courses/contractFormation';
import { activeLearningSteps } from './courses/activeLearning';
import { anxietySteps } from './courses/anxiety';
import { coronaryArteriesSteps } from './courses/coronaryArteries';
import { spinalCordSteps } from './courses/spinalCord';
import { graphsSteps } from './courses/graphs';
import { apiDesignSteps } from './courses/apiDesign';
import { sqlBasicsSteps } from './courses/sqlBasics';
import { defaultSteps } from './courses/defaultCourse';
import { generateComprehensiveCourse } from '../services/contentGenerator';

type CourseData = {
    [key: string]: TeachingStep[];
};

const courses: CourseData = {
    // Medicine - Cardiology
    'ecg-basics': ecgBasicsSteps,
    'heart-structure': heartStructureSteps,
    'valves': valvesSteps,
    'blood-flow': bloodFlowSteps,
    'coronary-arteries': coronaryArteriesSteps,
    
    // Medicine - Neurology
    'brain-structure': brainStructureSteps,
    'neurons': neuronsSteps,
    'spinal-cord': spinalCordSteps,
    
    // Engineering - Software
    'react-basics': reactBasicsSteps,
    'state-management': stateManagementSteps,
    'sorting': sortingSteps,
    'graphs': graphsSteps,
    'api-design': apiDesignSteps,
    'sql-basics': sqlBasicsSteps,
    
    // Science - Physics
    'newtons-laws': newtonsLawsSteps,
    'kinematics': kinematicsSteps,
    
    // Science - Biology
    'dna-structure': dnaStructureSteps,
    'heredity': hereditySteps,
    
    // Business - Marketing
    'seo': seoSteps,
    
    // Business - Finance
    'stocks': stocksSteps,
    
    // Technology - AI
    'supervised': supervisedSteps,
    
    // Technology - Cybersecurity
    'encryption': encryptionSteps,
    
    // Law - Corporate
    'contract-formation': contractFormationSteps,
    
    // Education - Pedagogy
    'active-learning': activeLearningSteps,
    
    // Psychology - Clinical
    'anxiety': anxietySteps,
};

/**
 * Gets course content for a topic.
 * If pre-defined content exists, returns it.
 * Otherwise, generates comprehensive content using AI analysis.
 */
export const getCourseContent = (topicId: string, topicName?: string, description?: string, subjectArea?: string): TeachingStep[] => {
    // First, check if we have pre-defined content
    if (courses[topicId]) {
        return courses[topicId];
    }
    
    // If no pre-defined content, generate comprehensive course using AI analysis
    if (topicName) {
        try {
            const generatedSteps = generateComprehensiveCourse(
                topicId,
                topicName,
                description,
                subjectArea
            );
            
            // Cache the generated content in memory (Firestore handles persistence)
            if (generatedSteps && generatedSteps.length > 0) {
                return generatedSteps;
            }
        } catch (error) {
            console.error(`Error generating content for topic ${topicId}:`, error);
        }
    }
    
    // Fallback to default steps
    return defaultSteps;
};
