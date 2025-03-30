import React, { useEffect, useState } from 'react';
import { TAB_CLOUD_TEXT, TAB_LOCAL_TEXT } from '../consts';
import { TaskSourceTabsProps } from '../types';

export const TaskSourceTabs: React.FC<TaskSourceTabsProps> = ({
  switchToFirebaseTasks,
  switchToLocalTasks,
  currentSource,
}) => {
  const [isCloud, setIsCloud] = useState(currentSource === 'firebase');

  useEffect(() => {
    setIsCloud(currentSource === 'firebase');
  }, [currentSource]);

  const handleChange = () => {
    if (isCloud) {
      switchToLocalTasks();
    } else {
      switchToFirebaseTasks();
    }
  };

  return (
    <div
      role="button"
      className="fixed top-0 left-1/2 z-[2] flex h-6 w-32 -translate-x-1/2 cursor-pointer rounded-b-md bg-gray-300/50 font-medium select-none dark:bg-gray-300/20"
      onClick={handleChange}
    >
      <div className="flex w-full items-center justify-between text-center text-sm">
        <span className="z-2 w-1/2 text-gray-800 dark:text-gray-200">
          {TAB_CLOUD_TEXT}
        </span>
        <span className="z-2 w-1/2 text-gray-800 dark:text-gray-200">
          {TAB_LOCAL_TEXT}
        </span>
        <div
          className={`shadow- absolute top-0 left-0 h-full w-1/2 rounded-b-md bg-indigo-200/95 transition-transform duration-250 ease-[cubic-bezier(0.93,0.26,0.07,0.69)] dark:bg-indigo-950/95 ${!isCloud ? 'translate-x-full' : ''}`}
        ></div>
      </div>
    </div>
  );
};
