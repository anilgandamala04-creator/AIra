/**
 * Admin / Principal Dashboard — Comprehensive Institutional Command Center.
 *
 * Admin Login → Select Grade → Select Subject → Tabbed Analytics Dashboard
 *
 * Three tabs:
 *   1. Overview — Executive KPIs, teacher effectiveness, cross-class comparison, systemic alerts
 *   2. Teacher Analytics — Teacher performance monitoring, AI nudges, detailed metrics
 *   3. Student Analytics — Student heatmap, weakness analysis, virtualized list, drilldown modal
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ChevronRight,
  ArrowLeft,
  UserCog,
  Layers,
  Building2,
  AlertCircle,
  GraduationCap,
  Target,
  Activity,
  Zap,
  Trophy,
  Users,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  User,
  AlertTriangle,
  Grid3X3,
} from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import { GRADES, SUBJECTS_BY_GRADE } from '../data/curriculumData';
import {
  getAdminDashboardData,
  getAdminSubjectSummaries,
  getTeacherEffectiveness,
  getTeacherAnalyticsSummary,
  getTeacherNudges,
  getTeacherDashboardData,
  getStudentDetail,
} from '../services/dashboardService';
import type {
  AdminStudentTrendRow,
  AdminCrossClassRow,
  AdminSystemicTopicRow,
  AdminSubjectSummary,
  TeacherEffectiveness as TeacherEffectivenessType,
  TeacherAnalyticsSummary,
  TeacherNudge,
  TeacherTopicWeaknessRow,
  TeacherStudentRow,
  TeacherHeatmapRow,
  StudentAnalyticsDetail,
} from '../types';
import { AnalyticsCard } from '../components/common/analytics/AnalyticsCard';
import { DataChart } from '../components/common/analytics/DataChart';
import { AIInsights } from '../components/common/analytics/AIInsights';
import { StudentDetailModal } from '../components/common/analytics/StudentDetailModal';

type Step = 'grade' | 'subject' | 'dashboard';
type DashboardTab = 'overview' | 'teachers' | 'students';

/* ---------- Heatmap Cell (reused from TeacherDashboard pattern) ---------- */
const HeatmapCell = ({ value }: { value: number }) => (
  <td className="px-3 py-4 text-center">
    <div
      className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-[10px] font-bold ${value < 50
        ? 'bg-rose-100 text-rose-600'
        : value < 75
          ? 'bg-amber-100 text-amber-600'
          : 'bg-emerald-100 text-emerald-600'
        }`}
    >
      {value}%
    </div>
  </td>
);

/* ======================== MAIN COMPONENT ======================== */
export default function AdminDashboardPage() {
  /* ---------- Navigation state ---------- */
  const [step, setStep] = useState<Step>('grade');
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  /* ---------- Overview data ---------- */
  const [studentTrends, setStudentTrends] = useState<AdminStudentTrendRow[]>([]);
  const [crossClass, setCrossClass] = useState<AdminCrossClassRow[]>([]);
  const [systemicTopics, setSystemicTopics] = useState<AdminSystemicTopicRow[]>([]);
  const [subjectSummaries, setSubjectSummaries] = useState<AdminSubjectSummary[]>([]);
  const [teacherEffectiveness, setTeacherEffectiveness] = useState<TeacherEffectivenessType[]>([]);
  const [fromFirestore, setFromFirestore] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  /* ---------- Teacher analytics data ---------- */
  const [teacherSummary, setTeacherSummary] = useState<TeacherAnalyticsSummary | null>(null);
  const [nudges, setNudges] = useState<TeacherNudge[]>([]);

  /* ---------- Student analytics data ---------- */
  const [students, setStudents] = useState<TeacherStudentRow[]>([]);
  const [heatmapTopics, setHeatmapTopics] = useState<string[]>([]);
  const [heatmapRows, setHeatmapRows] = useState<TeacherHeatmapRow[]>([]);
  const [topicWeakness, setTopicWeakness] = useState<TeacherTopicWeaknessRow[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentAnalyticsDetail | null>(null);

  const subjects = useMemo(() => {
    if (!selectedGrade) return [];
    return SUBJECTS_BY_GRADE[selectedGrade] ?? [];
  }, [selectedGrade]);

  const activeSubjectSummary = useMemo(
    () => subjectSummaries.find((s) => s.subject === selectedSubject) ?? subjectSummaries[0] ?? null,
    [subjectSummaries, selectedSubject],
  );

  /* ---------- Data fetching ---------- */
  useEffect(() => {
    getAdminSubjectSummaries().then(setSubjectSummaries);
    getTeacherEffectiveness().then(setTeacherEffectiveness);
    getTeacherAnalyticsSummary().then(setTeacherSummary);
    getTeacherNudges().then(setNudges);
  }, []);

  useEffect(() => {
    if (!selectedGrade || !selectedSubject) return;
    setDashboardLoading(true);
    Promise.all([
      getAdminDashboardData(selectedGrade, selectedSubject),
      getTeacherDashboardData(selectedGrade),
    ])
      .then(([adminData, teacherData]) => {
        setStudentTrends(adminData.studentTrends);
        setCrossClass(adminData.crossClassComparison);
        setSystemicTopics(adminData.systemicTopics);
        setFromFirestore(adminData.fromFirestore ?? false);
        setStudents(teacherData.students);
        setHeatmapTopics(teacherData.heatmapTopics);
        setHeatmapRows(teacherData.heatmapRows);
        setTopicWeakness(teacherData.topicWeakness);
      })
      .finally(() => setDashboardLoading(false));
  }, [selectedGrade, selectedSubject]);

  /* ---------- Handlers ---------- */
  const handleGradeSelect = (grade: string) => {
    setSelectedGrade(grade);
    setSelectedSubject(null);
    setStep('subject');
  };
  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setActiveTab('overview');
    setStep('dashboard');
  };
  const handleBack = () => {
    if (step === 'subject') { setStep('grade'); setSelectedGrade(null); }
    else if (step === 'dashboard') { setStep('subject'); setSelectedSubject(null); }
  };
  const handleStudentDrilldown = useCallback((id: string) => {
    getStudentDetail(id).then(setSelectedStudent);
  }, []);

  /* ---------- Virtualized student row ---------- */
  const VirtualList = List as React.ComponentType<React.ComponentProps<typeof List>>;
  const StudentRow = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const s = students[index];
      if (!s) return null;
      return (
        <div style={style} className="px-2">
          <motion.button
            type="button"
            onClick={() => handleStudentDrilldown(s.id)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all text-left"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {s.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.name}</div>
              <div className="text-[10px] text-slate-400 font-medium">
                {s.errorPattern === 'conceptual' ? '⚠ Conceptual gaps' : '✎ Careless errors'} • {s.weakTopics.length} weak topic{s.weakTopics.length !== 1 ? 's' : ''}
              </div>
            </div>
            {s.level != null && (
              <div className="text-right shrink-0">
                <div className="text-xs font-black text-emerald-500">Lvl {s.level}</div>
                <div className="text-[10px] text-slate-400">{s.totalXp?.toLocaleString()} XP</div>
              </div>
            )}
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </motion.button>
        </div>
      );
    },
    [students, handleStudentDrilldown],
  );

  /* ---------- Tab config ---------- */
  const tabs: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'teachers', label: 'Teacher Analytics', icon: <UserCog className="w-4 h-4" /> },
    { id: 'students', label: 'Student Analytics', icon: <Users className="w-4 h-4" /> },
  ];

  /* ======================== RENDER ======================== */
  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm safe-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-4">
          <button type="button" onClick={handleBack} className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 touch-manipulation" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 min-w-0">
            <Building2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <span className="font-bold truncate">Admin — Institutional Analytics</span>
            {!fromFirestore && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest border border-amber-200 dark:border-amber-800/50">
                Demo
              </span>
            )}
          </div>
          {(selectedGrade || selectedSubject) && (
            <div className="ml-auto flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 shrink-0">
              {selectedGrade && <span>{selectedGrade}</span>}
              {selectedSubject && (<><ChevronRight className="w-4 h-4" /><span>{selectedSubject}</span></>)}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {/* ============ STEP: GRADE SELECTION ============ */}
          {step === 'grade' && (
            <motion.div key="grade" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Select Grade</h1>
              <p className="text-slate-600 dark:text-slate-400">Monitor institution-wide teacher and student analytics at grade level.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {GRADES.map((grade) => (
                  <motion.button key={grade} type="button" onClick={() => handleGradeSelect(grade)} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all text-left" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <span className="font-semibold text-slate-900 dark:text-white">{grade}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ============ STEP: SUBJECT SELECTION ============ */}
          {step === 'subject' && selectedGrade && (
            <motion.div key="subject" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Select Subject</h1>
              <p className="text-slate-600 dark:text-slate-400">View comprehensive analytics for teachers and students in this subject.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <motion.button key={subject} type="button" onClick={() => handleSubjectSelect(subject)} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all text-left flex items-center gap-3" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <BookOpen className="w-6 h-6 text-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-white">{subject}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ============ STEP: DASHBOARD WITH TABS ============ */}
          {step === 'dashboard' && selectedGrade && selectedSubject && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
              {dashboardLoading && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium animate-pulse">
                  <Activity className="w-4 h-4" /> Loading analytics...
                </div>
              )}

              {/* Dashboard Title */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white">Institutional Analytics</h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Comprehensive oversight for {selectedGrade} • {selectedSubject}
                  </p>
                </div>
              </div>

              {/* Institutional KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-200/50 dark:border-emerald-800/50">
                  <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Total Students</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{activeSubjectSummary?.studentsCount ?? '—'}</div>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-200/50 dark:border-blue-800/50">
                  <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Total Teachers</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{activeSubjectSummary?.teachersCount ?? '—'}</div>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-200/50 dark:border-purple-800/50">
                  <div className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-1">Avg Score</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{activeSubjectSummary?.avgScore ?? '—'}%</div>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-200/50 dark:border-amber-800/50">
                  <div className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">Completion</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{activeSubjectSummary?.completionPercent ?? '—'}%</div>
                </div>
              </div>

              {/* Tab Bar */}
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-1.5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {/* ======== OVERVIEW TAB ======== */}
                {activeTab === 'overview' && (
                  <motion.div key="tab-overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                    {/* Executive Summary Cards */}
                    {activeSubjectSummary && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <AnalyticsCard title="Avg Grade Score" value={`${activeSubjectSummary.avgScore}%`} subtitle="Target: 80%" icon={GraduationCap} trend={{ value: 4, isPositive: true }} color="green" delay={0.1} />
                        <AnalyticsCard title="Engagement" value={activeSubjectSummary.avgLevel ? `Lvl ${activeSubjectSummary.avgLevel}` : 'Lvl 1'} subtitle="Avg Progress" icon={Trophy} color="purple" delay={0.2} />
                        <AnalyticsCard title="Curriculum Coverage" value={`${activeSubjectSummary.curriculumCoverage}%`} subtitle="Ahead of schedule" icon={Target} trend={{ value: 15, isPositive: true }} color="blue" delay={0.3} />
                        <AnalyticsCard title="Total Engagement" value={activeSubjectSummary.totalXp ? `${(activeSubjectSummary.totalXp / 1000000).toFixed(1)}M` : '0'} subtitle="Total XP" icon={Zap} color="amber" delay={0.4} />
                        <AnalyticsCard title="Systemic Issues" value={activeSubjectSummary.systemicConcerns} subtitle="Requires attention" icon={AlertCircle} color="rose" delay={0.5} />
                      </div>
                    )}

                    <div className="grid lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-8">
                        {/* Teacher Effectiveness Table */}
                        <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
                          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <UserCog className="w-5 h-5 text-emerald-500" /> Teacher Efficiency
                            </h2>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest text-center w-16">Rank</th>
                                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest">Educator</th>
                                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest">Improvement</th>
                                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest">Workload</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {teacherEffectiveness.map((row, i) => (
                                  <tr key={row.teacherId} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4"><div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500">{i + 1}</div></td>
                                    <td className="px-6 py-4">
                                      <div className="text-sm font-bold text-slate-900 dark:text-white">{row.teacherName}</div>
                                      <div className="text-[10px] text-slate-400 font-medium">Class Avg: {row.avgScore}%</div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="flex-1 h-1.5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${row.improvementTrend}%` }} />
                                        </div>
                                        <span className="text-xs font-black text-emerald-500">+{row.improvementTrend}%</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <DataChart type="bar" data={[20, 45, 30, 60]} height={20} width={40} color="#10b981" />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{row.workloadIndex}%</span>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </section>

                        {/* Cross-Section Comparison */}
                        <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
                          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Layers className="w-5 h-5 text-emerald-500" /> Class Comparison
                            </h2>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest">Section</th>
                                  {studentTrends.map((t) => (
                                    <th key={t.period} className="px-3 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest text-center">{t.period}</th>
                                  ))}
                                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest text-right">Final</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {crossClass.map((row) => (
                                  <tr key={row.section} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                      <div className="text-sm font-bold text-slate-900 dark:text-white">{row.section}</div>
                                      <div className="text-[10px] text-slate-400 font-medium lowercase">trend {row.trend}</div>
                                    </td>
                                    {[70, 75, 78, 80].map((score, idx) => (
                                      <td key={idx} className="px-3 py-4 text-center">
                                        <div className={`inline-block px-2 py-1 rounded text-[10px] font-bold ${score < 75 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>{score}%</div>
                                      </td>
                                    ))}
                                    <td className="px-6 py-4 text-right">
                                      <span className={`text-sm font-black ${row.avgScore < 75 ? 'text-rose-500' : 'text-emerald-500'}`}>{row.avgScore}%</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </section>
                      </div>

                      {/* Sidebar */}
                      <div className="space-y-8">
                        {/* Systemic Risk Topics */}
                        <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                          <div className="flex items-center gap-2 mb-6">
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Systemic Risks</h2>
                          </div>
                          <div className="space-y-4">
                            {systemicTopics.map((topic, i) => (
                              <div key={i} className="p-4 rounded-3xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">{topic.topic}</h3>
                                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold">{topic.sectionsWeak}/{topic.totalSections}</span>
                                </div>
                                <p className="text-xs text-rose-700/70 dark:text-rose-300/60 font-medium">{topic.note}</p>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Activity Sparklines */}
                        <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Activity Levels</h2>
                          <div className="space-y-6">
                            <div>
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                <span>Teacher Interaction</span><span className="text-emerald-500">+12%</span>
                              </div>
                              <DataChart type="line" data={[30, 45, 55, 48, 62, 70, 68]} color="#10b981" height={40} />
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                <span>Student Engagement</span><span className="text-purple-500">Peak</span>
                              </div>
                              <DataChart type="line" data={[20, 30, 60, 85, 90, 82, 95]} color="#8b5cf6" height={40} />
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ======== TEACHER ANALYTICS TAB ======== */}
                {activeTab === 'teachers' && (
                  <motion.div key="tab-teachers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                    {/* Teacher Summary Cards */}
                    {teacherSummary && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <AnalyticsCard title="Avg Class Score" value={`${teacherSummary.avgScore}%`} subtitle="Across all sections" icon={GraduationCap} trend={{ value: 3, isPositive: teacherSummary.trend === 'improving' }} color="green" delay={0.1} />
                        <AnalyticsCard title="Engagement" value={`${teacherSummary.engagementScore}%`} subtitle="Student engagement" icon={Activity} color="purple" delay={0.2} />
                        <AnalyticsCard title="Participation" value={`${teacherSummary.participationRate}%`} subtitle="Active learners" icon={Users} color="blue" delay={0.3} />
                        <AnalyticsCard title="Completion" value={`${teacherSummary.assignmentCompletion}%`} subtitle="Tasks finished" icon={CheckCircle2} trend={{ value: 5, isPositive: true }} color="amber" delay={0.4} />
                      </div>
                    )}

                    <div className="grid lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2">
                        {/* Detailed Teacher Performance */}
                        <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
                          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <UserCog className="w-5 h-5 text-emerald-500" /> Teacher Performance Overview
                            </h2>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest">Teacher</th>
                                  <th className="px-4 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest text-center">Avg Score</th>
                                  <th className="px-4 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest text-center">Engagement</th>
                                  <th className="px-4 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest text-center">Participation</th>
                                  <th className="px-4 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest">Trend</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {teacherEffectiveness.map((t) => (
                                  <tr key={t.teacherId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">{t.teacherName.charAt(0)}</div>
                                        <div>
                                          <div className="text-sm font-bold text-slate-900 dark:text-white">{t.teacherName}</div>
                                          <div className="text-[10px] text-slate-400">Workload: {t.workloadIndex}%</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                      <span className={`text-sm font-black ${t.avgScore >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>{t.avgScore}%</span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${t.classEngagement}%` }} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t.classEngagement}%</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.participationRate}%</span>
                                    </td>
                                    <td className="px-4 py-4">
                                      <DataChart type="line" data={[t.avgScore - 10, t.avgScore - 5, t.avgScore - 2, t.avgScore]} color="#10b981" height={24} width={60} />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </section>
                      </div>

                      {/* AI Insights Sidebar */}
                      <div>
                        <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                          <AIInsights nudges={nudges} />
                        </section>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ======== STUDENT ANALYTICS TAB ======== */}
                {activeTab === 'students' && (
                  <motion.div key="tab-students" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                    {/* Student Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <AnalyticsCard title="Total Students" value={students.length} subtitle="In selected grade" icon={Users} color="green" delay={0.1} />
                      <AnalyticsCard title="Weak Topics" value={topicWeakness.length} subtitle="Needing attention" icon={AlertTriangle} color="rose" delay={0.2} />
                      <AnalyticsCard title="Conceptual Gaps" value={students.filter((s) => s.errorPattern === 'conceptual').length} subtitle="Students" icon={Target} color="amber" delay={0.3} />
                      <AnalyticsCard title="Active Levels" value={Math.max(...students.map((s) => s.level ?? 0), 0)} subtitle="Highest level" icon={TrendingUp} color="blue" delay={0.4} />
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-8">
                        {/* Topic Weakness Analysis */}
                        <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6">
                          <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="w-5 h-5 text-rose-500" />
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Topic Weakness Analysis</h2>
                          </div>
                          <div className="space-y-4">
                            {topicWeakness.map((tw) => (
                              <div key={tw.topicId} className="flex items-center gap-4">
                                <div className="w-32 text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{tw.name}</div>
                                <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${tw.pctWeak > 50 ? 'bg-rose-500' : tw.pctWeak > 25 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${tw.pctWeak}%` }} />
                                </div>
                                <div className="text-xs font-black text-slate-500 w-20 text-right">{tw.weakCount}/{tw.total} weak</div>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Performance Heatmap */}
                        {heatmapRows.length > 0 && (
                          <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Grid3X3 className="w-5 h-5 text-purple-500" /> Performance Heatmap
                              </h2>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                <thead>
                                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                                    <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest">Student</th>
                                    {heatmapTopics.map((t) => (
                                      <th key={t} className="px-3 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest text-center">{t}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {heatmapRows.map((row) => (
                                    <tr key={row.studentName} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                      <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                          <User className="w-4 h-4 text-slate-400" />
                                          <span className="text-sm font-medium text-slate-900 dark:text-white">{row.studentName}</span>
                                        </div>
                                      </td>
                                      {row.scores.map((score, idx) => (
                                        <HeatmapCell key={idx} value={score} />
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </section>
                        )}
                      </div>

                      {/* Student List Sidebar (Virtualized) */}
                      <div>
                        <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Users className="w-5 h-5 text-emerald-500" />
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Student Roster</h2>
                          </div>
                          <p className="text-xs text-slate-400 mb-4">Click a student for detailed analytics</p>
                          {students.length > 0 ? (
                            <VirtualList height={400} itemCount={students.length} itemSize={80} width="100%">
                              {StudentRow}
                            </VirtualList>
                          ) : (
                            <p className="text-sm text-slate-400 italic py-8 text-center">No student data available</p>
                          )}
                        </section>
                      </div>
                    </div>

                    {/* Student Detail Modal */}
                    <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
