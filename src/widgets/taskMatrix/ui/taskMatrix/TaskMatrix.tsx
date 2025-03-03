'use client';

import { useState } from 'react';
import { InteractWithMatrix } from '@/features/interactWithMatrix';
import { MatrixKey } from '@/entities/taskMatrix';
import {
  getIsLoading,
  getTaskInputText,
} from '@/entities/taskMatrix/model/selectors/uiSelectors';
import { useUIStore } from '@/entities/taskMatrix/model/store/uiStore';

import { TaskMatrixHeader } from './TaskMatrixHeader';

export const TaskMatrix: React.FC = () => {
  const isLoading = useUIStore(getIsLoading);

  const taskInputText = useUIStore(getTaskInputText);

  const [expandedQuadrant, setExpandedQuadrant] = useState<MatrixKey | null>(
    null,
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative flex w-full flex-wrap justify-center pt-6">
      <TaskMatrixHeader
        expandedQuadrant={expandedQuadrant}
        taskInputText={taskInputText}
      />

      <InteractWithMatrix
        expandedQuadrant={expandedQuadrant}
        setExpandedQuadrant={setExpandedQuadrant}
        taskInputText={taskInputText}
      />
    </div>
  );
};
