import React from 'react';
import { MatrixQuadrants, MatrixKey } from '@/shared/stores/tasksStore';
import { Modal } from '@/shared/ui/modal';
import { useAnalytics } from '../lib/useAnalytics';

interface AnalyticsModalProps {
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ onClose }) => {
  const {
    totalCompleted,
    totalAll,
    quadrantStats,
    focusScore,
    completionRate,
  } = useAnalytics();

  const getTip = () => {
    if (totalAll === 0) return 'Add some tasks to see your productivity tips!';

    const q1 = quadrantStats['ImportantUrgent' as MatrixKey].percentage;
    const q2 = quadrantStats['ImportantNotUrgent' as MatrixKey].percentage;
    const q3 = quadrantStats['NotImportantUrgent' as MatrixKey].percentage;
    const q4 = quadrantStats['NotImportantNotUrgent' as MatrixKey].percentage;

    if (q1 > 40)
      return "You're in crisis mode! Try to handle tasks before they become urgent.";
    if (q2 < 20)
      return "Try to focus more on 'Important & Not Urgent' tasks for long-term growth.";
    if (q3 > 30)
      return "Many tasks seem urgent but aren't important. Can you delegate them?";
    if (q4 > 20)
      return "You've got a lot of distractions. Try to eliminate non-essential tasks.";

    return 'Great balance! Keep focusing on what truly matters.';
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex h-full w-full flex-col p-6 text-gray-800 dark:text-gray-100">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="scrollbar-hidden flex-1 overflow-y-auto">
          {/* Summary Cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatsCard label="Total Tasks" value={totalAll} />
            <StatsCard
              label="Completed"
              value={totalCompleted}
              color="text-green-500"
            />
            <StatsCard label="Focus Score" value={`${focusScore}%`} />
            <StatsCard label="Completion" value={`${completionRate}%`} />
          </div>

          {/* Matrix Visualization */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold">
              Quadrant Distribution
            </h3>
            <div className="mx-auto grid aspect-square w-full max-w-md grid-cols-2 gap-2 sm:aspect-video sm:max-w-none">
              <QuadrantMini
                label={MatrixQuadrants.ImportantUrgent}
                stats={quadrantStats['ImportantUrgent' as MatrixKey]}
                color="bg-red-400/20 border-red-400"
              />
              <QuadrantMini
                label={MatrixQuadrants.ImportantNotUrgent}
                stats={quadrantStats['ImportantNotUrgent' as MatrixKey]}
                color="bg-orange-400/20 border-orange-400"
              />
              <QuadrantMini
                label={MatrixQuadrants.NotImportantUrgent}
                stats={quadrantStats['NotImportantUrgent' as MatrixKey]}
                color="bg-blue-400/20 border-blue-400"
              />
              <QuadrantMini
                label={MatrixQuadrants.NotImportantNotUrgent}
                stats={quadrantStats['NotImportantNotUrgent' as MatrixKey]}
                color="bg-green-400/20 border-green-400"
              />
            </div>
          </div>

          {/* Tip Section */}
          <div className="rounded-xl bg-indigo-100 p-4 dark:bg-indigo-900/30">
            <h4 className="mb-1 flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Smart Tip
            </h4>
            <p className="text-sm italic">{getTip()}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const StatsCard = ({
  label,
  value,
  color = 'text-indigo-500',
}: {
  label: string;
  value: string | number;
  color?: string;
}) => (
  <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4 shadow-sm dark:bg-gray-700/50">
    <span className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
      {label}
    </span>
    <span className={`text-2xl font-bold ${color}`}>{value}</span>
  </div>
);

interface QuadrantStatsData {
  active: number;
  completed: number;
  total: number;
  percentage: number;
}

const QuadrantMini = ({
  label,
  stats,
  color,
}: {
  label: string;
  stats: QuadrantStatsData;
  color: string;
}) => (
  <div
    className={`flex flex-col justify-between rounded-lg border-2 p-3 ${color}`}
  >
    <div className="text-[10px] leading-tight font-bold uppercase opacity-70 sm:text-xs">
      {label}
    </div>
    <div className="mt-2 flex items-baseline justify-between">
      <span className="text-xl font-black sm:text-3xl">
        {stats.percentage}%
      </span>
      <span className="text-[10px] opacity-60 sm:text-xs">
        {stats.total} tasks
      </span>
    </div>
    <div className="mt-1 h-1 w-full rounded-full bg-black/10 dark:bg-white/10">
      <div
        className="h-full rounded-full bg-current opacity-60 transition-all duration-500"
        style={{ width: `${stats.percentage}%` }}
      ></div>
    </div>
  </div>
);
