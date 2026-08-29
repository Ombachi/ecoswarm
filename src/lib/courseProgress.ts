/**
 * Lightweight client-side course progress tracking.
 * Used by the Home screen's "Continue learning" card so learners can resume
 * exactly where they stopped without an extra backend table.
 */
const KEY = "ecoswarm_course_progress";

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  section: number; // zero-based index of the section being read
  total: number; // total sections in the course
  updatedAt: number;
}

type ProgressMap = Record<string, CourseProgress>;

function readAll(): ProgressMap {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as ProgressMap;
  } catch {
    return {};
  }
}

export function saveCourseProgress(entry: Omit<CourseProgress, "updatedAt">) {
  if (!entry.courseId || !entry.total) return;
  try {
    const all = readAll();
    all[entry.courseId] = { ...entry, updatedAt: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
}

export function clearCourseProgress(courseId: string) {
  try {
    const all = readAll();
    delete all[courseId];
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
}

/** Most recently touched, still-unfinished course. */
export function getLatestCourseProgress(): CourseProgress | null {
  const list = Object.values(readAll()).sort((a, b) => b.updatedAt - a.updatedAt);
  return list[0] || null;
}
