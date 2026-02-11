import { TeachingStep } from '../../types';

export const brainStructureSteps: TeachingStep[] = [
    {
        id: 'brain-1',
        stepNumber: 1,
        title: 'Major Brain Regions',
        content: 'The brain is divided into three main parts: the cerebrum (largest part, responsible for higher functions), cerebellum (coordination and balance), and brainstem (vital functions like breathing and heart rate).',
        spokenContent: 'The human brain consists of three major regions, each with a specialized role. The cerebrum is the largest part, handling your thoughts, memories, and voluntary actions. Tucked underneath is the cerebellum, the master of coordination and balance. Finally, the brainstem acts as your body’s autopilot, controlling essential life functions like your heartbeat and breathing.',
        visualType: '3d-model',
        visualPrompt: 'Detailed 3D model of the human brain highlighting the cerebrum, cerebellum, and brainstem in distinct clinical colors',
        durationSeconds: 160,
        completed: false,
        complexity: 'basic',
        estimatedMinutes: 3,
        keyConcepts: ['Cerebrum', 'Cerebellum', 'Brainstem', 'Vital Functions'],
        realWorldExamples: [
            'Cerebrum: Deciding which movie to watch',
            'Cerebellum: Riding a bicycle without falling',
            'Brainstem: Breathing while you sleep'
        ],
    },
    {
        id: 'brain-2',
        stepNumber: 2,
        title: 'Cerebral Hemispheres',
        content: 'The cerebrum is divided into left and right hemispheres, connected by the corpus callosum. Each hemisphere has four lobes: frontal, parietal, temporal, and occipital, each with specialized functions.',
        spokenContent: 'The cerebrum is split into two hemispheres, linked by a massive bridge of nerves called the corpus callosum. Each hemisphere is further divided into four specialized lobes: the frontal lobe for complex reasoning, the parietal lobe for processing sensations, the temporal lobe for hearing and language, and the occipital lobe at the very back, which handles your vision.',
        visualType: '3d-model',
        visualPrompt: 'Lateral view of the cerebral hemisphere highlighting the frontal, parietal, temporal, and occipital lobes with clear anatomical labels',
        durationSeconds: 180,
        completed: false,
        complexity: 'intermediate',
        estimatedMinutes: 3,
        keyConcepts: ['Lobe specialization', 'Hemispheres', 'Corpus Callosum', 'Cortical Mapping'],
    },
];
