import {
  useTaskStore,
  MatrixKey,
  MatrixQuadrantKeys,
} from '@/shared/stores/tasksStore';

export const useAnalytics = () => {
  const {
    localTasks,
    firebaseTasks,
    localCompletedTasks,
    firebaseCompletedTasks,
    activeState,
  } = useTaskStore();

  const activeTasks = activeState === 'local' ? localTasks : firebaseTasks;
  const completedTasks =
    activeState === 'local' ? localCompletedTasks : firebaseCompletedTasks;

  const allActiveTasksArray = Object.values(activeTasks).flat();
  const totalActive = allActiveTasksArray.length;
  const totalCompleted = completedTasks.length;
  const totalAll = totalActive + totalCompleted;

  const rawStats = MatrixQuadrantKeys.map((key) => {
    const activeInQuadrant = activeTasks[key as MatrixKey].length;
    const completedInQuadrant = completedTasks.filter(
      (t) => t.quadrantKey === key,
    ).length;
    const totalInQuadrant = activeInQuadrant + completedInQuadrant;
    const percentage = totalAll > 0 ? (totalInQuadrant / totalAll) * 100 : 0;

    return {
      key: key as MatrixKey,
      active: activeInQuadrant,
      completed: completedInQuadrant,
      total: totalInQuadrant,
      percentage,
      floor: Math.floor(percentage),
      remainder: percentage - Math.floor(percentage),
    };
  });

  // Largest Remainder Method to ensure sum is 100%
  const totalFloor = rawStats.reduce((sum, stat) => sum + stat.floor, 0);
  const diff = totalAll > 0 ? 100 - totalFloor : 0;

  // Sort by remainder descending and take 'diff' elements to increment
  const sortedByRemainder = [...rawStats].sort(
    (a, b) => b.remainder - a.remainder,
  );
  const keysToIncrement = sortedByRemainder
    .slice(0, diff)
    .map((stat) => stat.key);

  const quadrantStats = rawStats.reduce(
    (acc, stat) => {
      acc[stat.key] = {
        active: stat.active,
        completed: stat.completed,
        total: stat.total,
        percentage: stat.floor + (keysToIncrement.includes(stat.key) ? 1 : 0),
      };
      return acc;
    },
    {} as Record<
      MatrixKey,
      { active: number; completed: number; total: number; percentage: number }
    >,
  );

  const focusScore =
    quadrantStats['ImportantNotUrgent' as MatrixKey].percentage;
  const completionRate =
    totalAll > 0 ? Math.round((totalCompleted / totalAll) * 100) : 0;

  return {
    totalActive,
    totalCompleted,
    totalAll,
    quadrantStats,
    focusScore,
    completionRate,
    activeState,
  };
};
