const STORAGE_KEY = 'algo_progress';

const DEFAULT_PROGRESS = {
  completed: [],
  bookmarked: [],
  attempts: {},
  activityLog: {},
  streak: {
    current: 0,
    lastActiveDate: null,
  },
};

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const cloneDefaults = () => JSON.parse(JSON.stringify(DEFAULT_PROGRESS));

// Helper to namespace progress by user while keeping a safe fallback
const getStorageKeyForUser = (userId) => {
  if (!userId) return STORAGE_KEY;
  return `${STORAGE_KEY}::${userId}`;
};

export const getTodayDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeProgress = (data = {}) => ({
  completed: Array.isArray(data.completed) ? data.completed : [],
  bookmarked: Array.isArray(data.bookmarked) ? data.bookmarked : [],
  attempts: isPlainObject(data.attempts) ? data.attempts : {},
  activityLog: isPlainObject(data.activityLog) ? data.activityLog : {},
  streak: {
    current: Number.isFinite(data.streak?.current) ? data.streak.current : 0,
    lastActiveDate: data.streak?.lastActiveDate || null,
  },
});

export const loadProgress = (userId) => {
  if (typeof window === 'undefined') return cloneDefaults();

  try {
    const stored = window.localStorage.getItem(getStorageKeyForUser(userId));
    if (!stored) return cloneDefaults();
    return normalizeProgress(JSON.parse(stored));
  } catch (error) {
    console.error('Error loading progress data:', error);
    return cloneDefaults();
  }
};

// Default export keeps backward compatibility but is now user-aware when an id is provided
export const getProgress = (userId) => loadProgress(userId);

export const saveProgress = (progress, { dispatchEvent = true } = {}, userId) => {
  if (typeof window === 'undefined') return progress;

  try {
    window.localStorage.setItem(getStorageKeyForUser(userId), JSON.stringify(progress));
    if (dispatchEvent) {
      window.dispatchEvent(new Event('storage'));
    }
  } catch (error) {
    console.error('Error saving progress data:', error);
  }

  return progress;
};

const ensureAttemptEntry = (progress, questionUrl) => {
  if (!progress.attempts[questionUrl]) {
    progress.attempts[questionUrl] = {
      date: null,
      timeSpent: 0,
      success: null,
      lastOpened: null,
      totalAttempts: 0,
      successCount: 0,
      failureCount: 0,
    };
  }
  return progress.attempts[questionUrl];
};

export const updateActivity = (progress, date, metric, delta = 1) => {
  if (!date) return progress;
  if (!progress.activityLog[date]) {
    progress.activityLog[date] = { completed: 0, solved: 0, bookmarked: 0 };
  }
  progress.activityLog[date][metric] = Math.max(
    0,
    (progress.activityLog[date][metric] || 0) + delta
  );
  return progress;
};

const differenceInDays = (currentDate, previousDate) => {
  if (!currentDate || !previousDate) return Infinity;
  const current = new Date(`${currentDate}T00:00:00`);
  const previous = new Date(`${previousDate}T00:00:00`);
  const diff = Math.round((current - previous) / (1000 * 60 * 60 * 24));
  return diff;
};

export const updateStreak = (progress, activityDate) => {
  if (!activityDate) return progress;
  const lastActiveDate = progress.streak.lastActiveDate;

  if (!lastActiveDate) {
    progress.streak.current = 1;
  } else {
    const diff = differenceInDays(activityDate, lastActiveDate);
    if (diff === 0) {
      return progress;
    } else if (diff === 1) {
      progress.streak.current += 1;
    } else {
      progress.streak.current = 1;
    }
  }

  progress.streak.lastActiveDate = activityDate;
  return progress;
};

export const getDisplayStreak = (
  progress,
  referenceDate = getTodayDate()
) => {
  const lastActiveDate = progress?.streak?.lastActiveDate;
  if (!lastActiveDate) return 0;
  const diff = differenceInDays(referenceDate, lastActiveDate);
  return diff === 0 ? progress.streak.current : 0;
};

export const toggleQuestionBookmarked = (questionUrl, userId) => {
  const progress = loadProgress(userId);
  const wasBookmarked = progress.bookmarked.includes(questionUrl);
  const today = getTodayDate();

  if (wasBookmarked) {
    progress.bookmarked = progress.bookmarked.filter((url) => url !== questionUrl);
  } else {
    progress.bookmarked.push(questionUrl);
    updateActivity(progress, today, 'bookmarked');
  }

  saveProgress(progress, undefined, userId);
  return { progress, isBookmarked: !wasBookmarked };
};

export const toggleQuestionCompleted = (
  questionUrl,
  { success = true, timeSpent = 0, date = getTodayDate() } = {},
  userId
) => {
  const progress = loadProgress(userId);
  const wasCompleted = progress.completed.includes(questionUrl);

  if (wasCompleted) {
    progress.completed = progress.completed.filter((url) => url !== questionUrl);
    const attempt = progress.attempts[questionUrl];
    const activityDate = attempt?.date;
    if (activityDate) {
      updateActivity(progress, activityDate, 'completed', -1);
      updateActivity(progress, activityDate, 'solved', -1);
    }
  } else {
    progress.completed.push(questionUrl);

    const attempt = ensureAttemptEntry(progress, questionUrl);
    attempt.date = date;
    attempt.timeSpent = timeSpent;
    attempt.success = success;
    attempt.totalAttempts = (attempt.totalAttempts || 0) + 1;
    if (success) {
      attempt.successCount = (attempt.successCount || 0) + 1;
    } else {
      attempt.failureCount = (attempt.failureCount || 0) + 1;
    }
    progress.attempts[questionUrl] = attempt;

    updateActivity(progress, date, 'completed');
    updateActivity(progress, date, 'solved');
    updateStreak(progress, date);
  }

  saveProgress(progress, undefined, userId);
  return { progress, isCompleted: !wasCompleted };
};

export const recordQuestionOpened = (questionUrl, userId) => {
  const progress = loadProgress(userId);
  const attempt = ensureAttemptEntry(progress, questionUrl);
  attempt.lastOpened = new Date().toISOString();
  progress.attempts[questionUrl] = attempt;
  saveProgress(progress, { dispatchEvent: false }, userId);
  return attempt;
};

export const getQuestionMeta = (questionUrl, userId) => {
  const progress = loadProgress(userId);
  const attempt = progress.attempts[questionUrl];
  return {
    lastOpened: attempt?.lastOpened || null,
    lastAttemptDate: attempt?.date || null,
    lastResult: attempt?.success ?? null,
  };
};

export const getQuestionAttemptSummary = (questionUrl, userId) => {
  const progress = loadProgress(userId);
  const attempt = progress.attempts[questionUrl];
  return {
    totalAttempts: attempt?.totalAttempts || 0,
    successCount: attempt?.successCount || 0,
    failureCount: attempt?.failureCount || 0,
  };
};

export const calculateProgressStats = (
  allQuestions = [],
  progress = loadProgress()
) => {
  const completedSet = new Set(progress.completed);
  const bookmarkedSet = new Set(progress.bookmarked);

  const totalQuestions = allQuestions.reduce(
    (acc, topic) => acc + (topic.questions?.length || 0),
    0
  );

  const completedCount = progress.completed.length;
  const bookmarkedCount = progress.bookmarked.length;
  const overallProgress =
    totalQuestions > 0 ? (completedCount / totalQuestions) * 100 : 0;

  const topicProgress = allQuestions
    .map((topic) => {
      const totalTopicQuestions = topic.questions?.length || 0;
      const completedTopicQuestions = (topic.questions || []).filter((q) =>
        completedSet.has(q.url)
      ).length;
      const progressPercent =
        totalTopicQuestions > 0
          ? (completedTopicQuestions / totalTopicQuestions) * 100
          : 0;

      return {
        topic: topic.topic,
        completed: completedTopicQuestions,
        total: totalTopicQuestions,
        progress: Number(progressPercent.toFixed(2)),
      };
    })
    .filter((entry) => entry.total > 0);

  return {
    totalQuestions,
    completedCount,
    bookmarkedCount,
    overallProgress,
    topicProgress,
    completedSet,
    bookmarkedSet,
  };
};

export const getActivitySeries = (
  progress = loadProgress(),
  totalDays = 60
) => {
  const today = new Date();
  const series = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    series.push({
      date: key,
      count: progress.activityLog[key]?.completed || 0,
    });
  }
  return series;
};

