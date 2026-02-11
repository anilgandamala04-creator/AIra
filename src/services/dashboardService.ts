/**
 * Dashboard aggregation for Admin and Teacher.
 * Uses Firestore when collections sections, roster, teacher_assignments exist;
 * otherwise returns mock data so the UI always has something to show.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { db, hasFirebase } from '../lib/firebase';
import type {
  SessionAnalytics,
  TeacherAnalyticsSummary,
  TeacherNudge,
  StudentAnalyticsDetail,
  AdminSubjectSummary,
  TeacherEffectiveness,
  AdminTeacherSubjectRow,
  AdminStudentTrendRow,
  AdminCrossClassRow,
  AdminSystemicTopicRow,
  TeacherTopicWeaknessRow,
  TeacherStudentRow,
  TeacherHeatmapRow,
  Section,
} from '../types';

const UNDERPERFORM_THRESHOLD = 75;

// ---------------------------------------------------------------------------
// Mock data (fallback when Firestore has no roster/sections/assignments)
// ---------------------------------------------------------------------------

const MOCK_TEACHER_SUBJECT: AdminTeacherSubjectRow[] = [
  { teacherId: 't1', teacherName: 'Teacher A', subject: 'Mathematics', section: 'Section 1', avgScore: 78 },
  { teacherId: 't2', teacherName: 'Teacher B', subject: 'Mathematics', section: 'Section 2', avgScore: 82 },
  { teacherId: 't3', teacherName: 'Teacher C', subject: 'Mathematics', section: 'Section 3', avgScore: 71 },
];

const MOCK_STUDENT_TRENDS: AdminStudentTrendRow[] = [
  { period: 'Week 1', avgScore: 72 },
  { period: 'Week 2', avgScore: 74 },
  { period: 'Week 3', avgScore: 76 },
  { period: 'Week 4', avgScore: 77 },
];

const MOCK_CROSS_CLASS: AdminCrossClassRow[] = [
  { section: 'Section 1', subject: 'Mathematics', avgScore: 78, trend: 'up' },
  { section: 'Section 2', subject: 'Mathematics', avgScore: 82, trend: 'stable' },
  { section: 'Section 3', subject: 'Mathematics', avgScore: 71, trend: 'down' },
];

const MOCK_SYSTEMIC: AdminSystemicTopicRow[] = [
  { topic: 'Magnetic Effects', sectionsWeak: 3, totalSections: 3, note: 'Systemic curriculum delivery issue' },
  { topic: 'Linear Equations', sectionsWeak: 1, totalSections: 3, note: 'Localized' },
];

const MOCK_TOPIC_WEAKNESS: TeacherTopicWeaknessRow[] = [
  { topicId: 'linear-equations', name: 'Linear Equations', weakCount: 12, total: 30, pctWeak: 40 },
  { topicId: 'quadratics', name: 'Quadratics', weakCount: 8, total: 30, pctWeak: 27 },
  { topicId: 'triangles', name: 'Triangles', weakCount: 18, total: 30, pctWeak: 60 },
  { topicId: 'circles', name: 'Circles', weakCount: 5, total: 30, pctWeak: 17 },
];

const MOCK_STUDENTS: TeacherStudentRow[] = [
  { id: 's1', name: 'Student A', weakSubjects: ['Geometry'], weakTopics: ['Triangles'], errorPattern: 'conceptual', level: 4, totalXp: 1250 },
  { id: 's2', name: 'Student B', weakSubjects: ['Algebra'], weakTopics: ['Linear Equations'], errorPattern: 'careless', level: 3, totalXp: 850 },
  { id: 's3', name: 'Student C', weakSubjects: ['Geometry'], weakTopics: ['Triangles', 'Circles'], errorPattern: 'conceptual', level: 5, totalXp: 2100 },
];

const MOCK_HEATMAP_TOPICS = MOCK_TOPIC_WEAKNESS.map((t) => t.name);
const MOCK_HEATMAP_ROWS: TeacherHeatmapRow[] = [
  { studentName: 'Student A', scores: [72, 88, 35, 90] },
  { studentName: 'Student B', scores: [42, 55, 78, 82] },
  { studentName: 'Student C', scores: [68, 75, 38, 45] },
  { studentName: 'Student D', scores: [90, 85, 88, 92] },
  { studentName: 'Student E', scores: [50, 62, 48, 70] },
];

const MOCK_TEACHER_SUMMARY: TeacherAnalyticsSummary = {
  avgScore: 78.4,
  engagementScore: 85,
  participationRate: 92,
  assignmentCompletion: 88,
  trend: 'improving',
};

const MOCK_NUDGES: TeacherNudge[] = [
  { id: 'n1', type: 'warning', message: '4 students scored below 40% in "Triangles"', priority: 'high', actionLabel: 'Assign Remedial' },
  { id: 'n2', type: 'suggestion', message: 'Class engagement peaks at 10 AM. Consider scheduling difficult topics then.', priority: 'medium' },
  { id: 'n3', type: 'celebration', message: 'Student B showed 20% improvement in Algebra this week!', priority: 'low' },
];

const MOCK_STUDENT_DETAIL: StudentAnalyticsDetail = {
  ...MOCK_STUDENTS[0],
  attendance: 95,
  lastActive: new Date().toISOString(),
  scoreTrend: [65, 68, 72, 70, 75, 72],
  topicMastery: [
    { topicId: 't1', name: 'Linear Equations', score: 85 },
    { topicId: 't2', name: 'Quadratics', score: 70 },
    { topicId: 't3', name: 'Triangles', score: 35 },
  ],
  engagementTrend: [70, 80, 85, 75, 90, 95],
  level: 4,
  totalXp: 1250,
};

const MOCK_ADMIN_SUBJECTS: AdminSubjectSummary[] = [
  {
    subject: 'Mathematics',
    avgScore: 76,
    studentsCount: 450,
    teachersCount: 12,
    completionPercent: 65,
    curriculumCoverage: 72,
    teacherEfficiency: 85,
    systemicConcerns: 2,
    avgLevel: 4.2,
    totalXp: 1250000
  },
  {
    subject: 'Science',
    avgScore: 82,
    studentsCount: 450,
    teachersCount: 10,
    completionPercent: 70,
    systemicIssue: 'Lab resource shortage',
    curriculumCoverage: 68,
    teacherEfficiency: 75,
    systemicConcerns: 4,
    avgLevel: 3.8,
    totalXp: 980000
  },
  {
    subject: 'English',
    avgScore: 88,
    studentsCount: 450,
    teachersCount: 8,
    completionPercent: 80,
    curriculumCoverage: 85,
    teacherEfficiency: 92,
    systemicConcerns: 0,
    avgLevel: 4.5,
    totalXp: 1560000
  },
];

const MOCK_TEACHER_EFFECTIVENESS: TeacherEffectiveness[] = [
  {
    teacherId: 't1',
    teacherName: 'Teacher A',
    avgScore: 78,
    improvementTrend: 5.2,
    classEngagement: 82,
    participationRate: 90,
    workloadIndex: 78
  },
  {
    teacherId: 't2',
    teacherName: 'Teacher B',
    avgScore: 82,
    improvementTrend: -2.1,
    classEngagement: 75,
    participationRate: 85,
    workloadIndex: 65
  },
  {
    teacherId: 't3',
    teacherName: 'Teacher C',
    avgScore: 71,
    improvementTrend: 8.4,
    classEngagement: 90,
    participationRate: 95,
    workloadIndex: 92
  },
];

// ---------------------------------------------------------------------------
// Firestore reads (when collections exist)
// ---------------------------------------------------------------------------

async function getSectionsFromFirestore(grade: string): Promise<Section[]> {
  if (!hasFirebase || !db) return [];
  try {
    const q = query(
      collection(db, 'sections'),
      where('grade', '==', grade),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const r = d.data();
      return {
        id: d.id,
        grade: r.grade ?? grade,
        sectionLabel: r.section_label ?? r.sectionLabel ?? d.id,
        name: r.name,
      };
    });
  } catch {
    return [];
  }
}

async function getRosterFromFirestore(sectionId: string): Promise<string[]> {
  if (!hasFirebase || !db) return [];
  try {
    const docSnap = await getDoc(doc(db, 'roster', sectionId));
    if (!docSnap.exists()) return [];
    const data = docSnap.data();
    const ids = data?.student_ids ?? data?.studentIds ?? [];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

async function getTeacherAssignmentsFromFirestore(
  grade: string,
  subject: string
): Promise<AdminTeacherSubjectRow[]> {
  if (!hasFirebase || !db) return [];
  try {
    const q = query(
      collection(db, 'teacher_assignments'),
      where('grade', '==', grade),
      where('subject', '==', subject),
      limit(50)
    );
    const snap = await getDocs(q);
    const rows: AdminTeacherSubjectRow[] = snap.docs.map((d) => {
      const r = d.data();
      return {
        teacherId: r.teacher_id ?? r.teacherId ?? '',
        teacherName: r.teacher_name ?? r.teacherName ?? 'Teacher',
        subject: r.subject ?? subject,
        section: r.section_label ?? r.sectionLabel ?? r.section_id ?? d.id,
        avgScore: typeof r.avg_score === 'number' ? r.avg_score : typeof r.avgScore === 'number' ? r.avgScore : 0,
      };
    });
    return rows;
  } catch {
    return [];
  }
}

/** Compute trend from previous avg (simplified: compare to 75). */
function trendFromScore(avg: number): 'up' | 'down' | 'stable' {
  if (avg >= 80) return 'up';
  if (avg < UNDERPERFORM_THRESHOLD) return 'down';
  return 'stable';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface AdminDashboardData {
  teacherSubjectMapping: AdminTeacherSubjectRow[];
  studentTrends: AdminStudentTrendRow[];
  crossClassComparison: AdminCrossClassRow[];
  systemicTopics: AdminSystemicTopicRow[];
  fromFirestore: boolean;
}

export async function getAdminDashboardData(
  grade: string,
  subject: string
): Promise<AdminDashboardData> {
  await getSectionsFromFirestore(grade);
  const teacherMapping = await getTeacherAssignmentsFromFirestore(grade, subject);

  if (teacherMapping.length > 0) {
    const crossClass: AdminCrossClassRow[] = teacherMapping.map((r) => ({
      section: r.section,
      subject: r.subject,
      avgScore: r.avgScore ?? 0,
      trend: trendFromScore(r.avgScore ?? 0),
    }));
    return {
      teacherSubjectMapping: teacherMapping,
      studentTrends: MOCK_STUDENT_TRENDS,
      crossClassComparison: crossClass,
      systemicTopics: MOCK_SYSTEMIC,
      fromFirestore: true,
    };
  }

  return {
    teacherSubjectMapping: MOCK_TEACHER_SUBJECT,
    studentTrends: MOCK_STUDENT_TRENDS,
    crossClassComparison: MOCK_CROSS_CLASS,
    systemicTopics: MOCK_SYSTEMIC,
    fromFirestore: false,
  };
}

export interface TeacherDashboardData {
  topicWeakness: TeacherTopicWeaknessRow[];
  students: TeacherStudentRow[];
  heatmapTopics: string[];
  heatmapRows: TeacherHeatmapRow[];
  fromFirestore: boolean;
}

export async function getTeacherDashboardData(
  grade: string
): Promise<TeacherDashboardData> {
  if (!hasFirebase || !db) {
    return {
      topicWeakness: MOCK_TOPIC_WEAKNESS,
      students: MOCK_STUDENTS,
      heatmapTopics: MOCK_HEATMAP_TOPICS,
      heatmapRows: MOCK_HEATMAP_ROWS,
      fromFirestore: false,
    };
  }

  try {
    const sections = await getSectionsFromFirestore(grade);
    const studentIds: string[] = [];
    for (const sec of sections.slice(0, 3)) {
      const ids = await getRosterFromFirestore(sec.id);
      studentIds.push(...ids);
    }

    if (studentIds.length === 0) {
      return {
        topicWeakness: MOCK_TOPIC_WEAKNESS,
        students: MOCK_STUDENTS,
        heatmapTopics: MOCK_HEATMAP_TOPICS,
        heatmapRows: MOCK_HEATMAP_ROWS,
        fromFirestore: false,
      };
    }

    // Fetch actual student profiles
    const profilesSnap = await getDocs(
      query(collection(db, 'profiles'), where('id', 'in', studentIds.slice(0, 10)))
    );

    const studentRows: TeacherStudentRow[] = [];
    const topicStats: Record<string, { name: string; weak: number; total: number }> = {};
    const heatmapRows: TeacherHeatmapRow[] = [];
    const uniqueTopics = new Set<string>();

    profilesSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const analytics = data.analytics || { sessions: [], metrics: {} };
      const sessions = (analytics.sessions || []) as SessionAnalytics[];

      const weakTopics: string[] = [];
      const scores: number[] = [];

      // Process last 5 sessions for heatmap and weakness
      sessions.slice(0, 5).forEach((s) => {
        if (s.quizScore !== undefined) {
          scores.push(s.quizScore);
          if (s.quizScore < UNDERPERFORM_THRESHOLD) {
            weakTopics.push(s.topicId);
            if (!topicStats[s.topicId]) {
              topicStats[s.topicId] = { name: s.topicId, weak: 0, total: 0 };
            }
            topicStats[s.topicId].weak++;
          }
          if (topicStats[s.topicId]) {
            topicStats[s.topicId].total++;
          }
          uniqueTopics.add(s.topicId);
        }
      });

      studentRows.push({
        id: docSnap.id,
        name: data.display_name || 'Student',
        weakSubjects: [], // Simplified for now
        weakTopics: Array.from(new Set(weakTopics)),
        errorPattern: 'conceptual',
        level: analytics.metrics?.level || 1,
        totalXp: analytics.metrics?.totalXp || 0,
      });

      heatmapRows.push({
        studentName: data.display_name || 'Student',
        scores: scores.length > 0 ? scores : [0, 0, 0, 0, 0],
      });
    });

    const topicWeakness: TeacherTopicWeaknessRow[] = Object.entries(topicStats).map(([id, stats]) => ({
      topicId: id,
      name: stats.name,
      weakCount: stats.weak,
      total: stats.total,
      pctWeak: Math.round((stats.weak / stats.total) * 100),
    }));

    return {
      topicWeakness: topicWeakness.length > 0 ? topicWeakness : MOCK_TOPIC_WEAKNESS,
      students: studentRows.length > 0 ? studentRows : MOCK_STUDENTS,
      heatmapTopics: Array.from(uniqueTopics).slice(0, 5),
      heatmapRows: heatmapRows.length > 0 ? heatmapRows : MOCK_HEATMAP_ROWS,
      fromFirestore: true,
    };
  } catch (error) {
    console.error('Error fetching teacher dashboard data:', error);
    return {
      topicWeakness: MOCK_TOPIC_WEAKNESS,
      students: MOCK_STUDENTS,
      heatmapTopics: MOCK_HEATMAP_TOPICS,
      heatmapRows: MOCK_HEATMAP_ROWS,
      fromFirestore: false,
    };
  }
}

export async function getTeacherAnalyticsSummary(): Promise<TeacherAnalyticsSummary> {
  return MOCK_TEACHER_SUMMARY;
}

export async function getTeacherNudges(): Promise<TeacherNudge[]> {
  return MOCK_NUDGES;
}

export async function getStudentDetail(studentId: string): Promise<StudentAnalyticsDetail> {
  if (!hasFirebase || !db) return MOCK_STUDENT_DETAIL;

  try {
    const snap = await getDoc(doc(db, 'profiles', studentId));
    if (!snap.exists()) return MOCK_STUDENT_DETAIL;
    const data = snap.data();
    const analytics = data.analytics || { sessions: [], metrics: {} };
    const sessions = (analytics.sessions || []) as SessionAnalytics[];

    return {
      id: studentId,
      name: data.display_name || 'Student',
      weakSubjects: [],
      weakTopics: Array.from(new Set(sessions.filter(s => (s.quizScore ?? 100) < 70).map(s => s.topicId))),
      errorPattern: 'conceptual',
      level: analytics.metrics?.level || 1,
      totalXp: analytics.metrics?.totalXp || 0,
      attendance: 100, // Placeholder
      lastActive: data.updated_at || new Date().toISOString(),
      scoreTrend: sessions.slice(0, 10).map(s => s.quizScore ?? 75).reverse(),
      topicMastery: sessions.slice(0, 5).map(s => ({ topicId: s.topicId, name: s.topicId, score: s.quizScore ?? 0 })),
      engagementTrend: [70, 80, 85, 75, 90, 95], // Placeholder
    };
  } catch {
    return MOCK_STUDENT_DETAIL;
  }
}

export async function getAdminSubjectSummary(): Promise<AdminSubjectSummary> {
  return MOCK_ADMIN_SUBJECTS[0];
}

export async function getAdminSubjectSummaries(): Promise<AdminSubjectSummary[]> {
  return MOCK_ADMIN_SUBJECTS;
}

export async function getTeacherEffectiveness(): Promise<TeacherEffectiveness[]> {
  return MOCK_TEACHER_EFFECTIVENESS;
}
