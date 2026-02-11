/**
 * Teacher Dashboard — Diagnostic, not teaching.
 *
 * Teacher Login Flow (Diagnostic, Not Teaching):
 *   Teacher Login → Select Grade → Select Subject → Analytics Dashboard → Student-Level Drilldown
 *
 * What Teacher Sees:
 *   - Class-wide performance heatmap
 *   - Topic-wise weakness indicators
 *   - Individual student gaps
 *
 * What Teacher Can Do:
 *   - Pick a student → See: Weak subject, Exact weak topics, Error patterns (conceptual vs careless)
 *
 * No content browsing; role separation is strict.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  ChevronRight,
  User,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Grid3X3,
  ArrowLeft,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import { GRADES, SUBJECTS_BY_GRADE } from '../data/curriculumData';
import {
  getTeacherDashboardData,
  getTeacherAnalyticsSummary,
  getTeacherNudges,
  getStudentDetail
} from '../services/dashboardService';
import type {
  TeacherAnalyticsSummary,
  TeacherHeatmapRow,
  TeacherTopicWeaknessRow,
  TeacherStudentRow,
  TeacherNudge,
  StudentAnalyticsDetail as StudentDetail,
} from '../types';
import { AnalyticsCard } from '../components/common/analytics/AnalyticsCard';
import { AIInsights } from '../components/common/analytics/AIInsights';
import { StudentDetailModal } from '../components/common/analytics/StudentDetailModal';

// Redefining HeatmapCell as it was lost in transcription
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

export default function TeacherDashboardPage() {
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [summary, setSummary] = useState<TeacherAnalyticsSummary | null>(null);
  const [heatmapTopics, setHeatmapTopics] = useState<string[]>([]);
  const [heatmapRows, setHeatmapRows] = useState<TeacherHeatmapRow[]>([]);
  const [topicWeakness, setTopicWeakness] = useState<TeacherTopicWeaknessRow[]>([]);
  const [students, setStudents] = useState<TeacherStudentRow[]>([]);
  const [drilldownStudent, setDrilldownStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [nudges, setNudges] = useState<TeacherNudge[]>([]);

  useEffect(() => {
    if (!selectedGrade || !selectedSubject) return;
    setLoading(true);

    getTeacherAnalyticsSummary().then(setSummary);
    getTeacherNudges().then(setNudges);

    getTeacherDashboardData(selectedGrade).then((data) => {
      setHeatmapTopics(data.heatmapTopics);
      setHeatmapRows(data.heatmapRows);
      setTopicWeakness(data.topicWeakness);
      setStudents(data.students);
    }).finally(() => setLoading(false));
  }, [selectedGrade, selectedSubject]);

  const handleStudentDrilldown = async (id: string) => {
    const detail = await getStudentDetail(id);
    setDrilldownStudent(detail);
  };

  const handleGradeSelect = (grade: string) => {
    setSelectedGrade(grade);
    setSelectedSubject(null);
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
  };

  const handleBack = () => {
    if (selectedSubject) setSelectedSubject(null);
    else if (selectedGrade) setSelectedGrade(null);
  };

  const StudentRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const student = students[index];
    if (!student) return null;

    return (
      <div style={{ ...style, paddingBottom: '12px' }}>
        <motion.button
          onClick={() => handleStudentDrilldown(student.id)}
          className="w-full p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all text-left group h-full flex items-center justify-between"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-purple-500 transition-colors">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{student.name}</p>
                {student.level && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-[8px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-tighter border border-purple-200 dark:border-purple-800/50">
                    LVL {student.level}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                {student.errorPattern} • {student.weakTopics?.[0]}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-all" />
        </motion.button>
      </div>
    );
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm safe-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-4">
          {(selectedGrade || selectedSubject) && (
            <button
              type="button"
              onClick={handleBack}
              className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 touch-manipulation"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 min-w-0">
            <GraduationCap className="w-6 h-6 text-purple-600 shrink-0" />
            <span className="font-bold truncate">Teacher Dashboard</span>
          </div>
          {selectedGrade && (
            <div className="ml-auto flex items-center gap-2 text-xs sm:text-sm text-slate-500 shrink-0">
              <span>{selectedGrade}</span>
              {selectedSubject && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span>{selectedSubject}</span>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {!selectedGrade ? (
            <motion.div
              key="grade-select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Select Grade</h1>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => handleGradeSelect(grade)}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 transition-all text-left font-bold text-slate-800 dark:text-slate-200 shadow-sm"
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : !selectedSubject ? (
            <motion.div
              key="subject-select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Select Subject ({selectedGrade})</h1>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(SUBJECTS_BY_GRADE[selectedGrade] ?? []).map((subject) => (
                  <button
                    key={subject}
                    onClick={() => handleSubjectSelect(subject)}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 transition-all text-left font-bold text-slate-800 dark:text-slate-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-purple-500 shrink-0" />
                      {subject}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white">Class Diagnostics</h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Real-time performance overview for {selectedGrade} • {selectedSubject}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors">
                    Export Analysis
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20">
                    Refresh Data
                  </button>
                </div>
              </div>

              {loading && (
                <div className="flex items-center gap-2 text-sm text-purple-600 font-medium animate-pulse">
                  <ActivityIcon className="w-4 h-4" />
                  Updating class insights...
                </div>
              )}

              {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <AnalyticsCard
                    title="Average Mastery"
                    value={`${summary.avgScore}%`}
                    subtitle="Last 7 days"
                    icon={BarChart3}
                    trend={{ value: 12, isPositive: true }}
                    color="purple"
                    delay={0.1}
                  />
                  <AnalyticsCard
                    title="Engagement"
                    value={`${summary.engagementScore}%`}
                    subtitle="Active study time"
                    icon={TrendingUp}
                    trend={{ value: 5, isPositive: true }}
                    color="blue"
                    delay={0.2}
                  />
                  <AnalyticsCard
                    title="Assignment Rate"
                    value={`${summary.assignmentCompletion}%`}
                    subtitle="Homework/Tasks"
                    icon={CheckCircle2}
                    trend={{ value: 8, isPositive: true }}
                    color="green"
                    delay={0.3}
                  />
                  <AnalyticsCard
                    title="Participation"
                    value={`${summary.participationRate}%`}
                    subtitle="Session attendance"
                    icon={Users}
                    trend={{ value: 2, isPositive: false }}
                    color="amber"
                    delay={0.4}
                  />
                </div>
              )}

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Heatmap */}
                  <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Grid3X3 className="w-5 h-5 text-purple-500" />
                        Performance Heatmap
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                            <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest">Student</th>
                            {heatmapTopics.map((name) => (
                              <th key={name} className="px-3 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest whitespace-nowrap text-center">
                                {name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {heatmapRows.map((row) => (
                            <tr key={row.studentName} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4">
                                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                                  {row.studentName}
                                </span>
                              </td>
                              {row.scores.map((score, i) => (
                                <HeatmapCell key={i} value={score} />
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Topic Weakness Table */}
                  <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Topic Weakness Map
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                            <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest">Topic</th>
                            <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest">Mastery</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {topicWeakness.map((row) => (
                            <tr key={row.topicId}>
                              <td className="px-6 py-4">
                                <div className="text-sm font-bold text-slate-900 dark:text-white">{row.name}</div>
                                <div className="text-[10px] text-slate-400 font-medium">{row.weakCount} / {row.total} students weak</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${row.pctWeak > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                      style={{ width: `${100 - row.pctWeak}%` }}
                                    />
                                  </div>
                                  <span className={`text-xs font-black ${row.pctWeak > 50 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {100 - row.pctWeak}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  {/* AI Insights Card */}
                  <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <AIInsights nudges={nudges} />
                  </section>

                  {/* Student Gaps / Drilldown List */}
                  <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Student Drilldown
                    </h2>
                    <div className="h-[500px]">
                      <List
                        height={500}
                        itemCount={students.length}
                        itemSize={84}
                        width="100%"
                      >
                        {StudentRow}
                      </List>
                    </div>
                  </section>
                </div>
              </div>

              {/* Student Detail Modal */}
              <StudentDetailModal
                student={drilldownStudent}
                onClose={() => setDrilldownStudent(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
);
