import { TeachingStep } from '../../types';

export const valvesSteps: TeachingStep[] = [
    {
        id: 'valves-1',
        stepNumber: 1,
        title: 'Heart Valves Overview',
        content: 'The heart has four valves that ensure one-way blood flow: the Tricuspid, Mitral, Pulmonary, and Aortic valves. Each valve opens and closes at specific times during the cardiac cycle to prevent backflow.',
        spokenContent: 'The heart contains four crucial valves that act as one-way doors. The Tricuspid and Mitral valves, known as atrioventricular valves, separate the atria from the ventricles. The Pulmonary and Aortic valves, our semilunar valves, guard the exits to the lungs and body. They work in perfect harmony to ensure that every drop of blood follows its intended path without leaking backward.',
        visualType: '3d-model',
        visualPrompt: 'Superior view of the heart with all four valves visible, showing the distinct tricuspid, mitral, pulmonary, and aortic structures',
        durationSeconds: 160,
        completed: false,
        complexity: 'basic',
        estimatedMinutes: 3,
        keyConcepts: ['One-way valves', 'Atrioventricular valves', 'Semilunar valves', 'Valve leaflets'],
        realWorldExamples: [
            'Thinking of valves like check-valves in plumbing',
            'The "Lub-Dub" sound of the heart is actually valves closing'
        ],
    },
    {
        id: 'valves-2',
        stepNumber: 2,
        title: 'Valve Function and Structure',
        content: 'Valves consist of flaps (leaflets or cusps) that open when pressure is higher on one side and close to prevent backflow. The AV valves have chordae tendineae and papillary muscles to prevent prolapse.',
        spokenContent: 'Each valve has a specialized design. The atrioventricular valves have delicate leaflets attached to strong cables called chordae tendineae. These "heart strings" are anchored to papillary muscles in the ventricular wall, which pull tight during contraction to prevent the valve from blowing backward under pressure — a mechanical marvel of biological engineering.',
        visualType: '3d-model',
        visualPrompt: 'Detailed close-up of a mitral valve showing the delicate chordae tendineae anchored to robust papillary muscles in the ventricular wall',
        durationSeconds: 180,
        completed: false,
        complexity: 'intermediate',
        estimatedMinutes: 3,
        keyConcepts: ['Chordae Tendineae', 'Papillary Muscles', 'Prolapse prevention', 'Pressure-driven opening'],
    },
];
