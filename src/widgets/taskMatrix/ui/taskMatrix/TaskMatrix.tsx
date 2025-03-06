'use client';

import { useState } from 'react';
import { InteractWithMatrix } from '@/features/interactWithMatrix';
import { MatrixKey } from '@/entities/Matrix';
import { getIsLoading, getTaskInputText } from '@/entities/Matrix';
import { useUIStore } from '@/entities/Matrix';
import { TaskMatrixHeaders } from '@/entities/taskMatrixHeaders';

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
      {!expandedQuadrant && !taskInputText && <TaskMatrixHeaders />}

      <InteractWithMatrix
        expandedQuadrant={expandedQuadrant}
        setExpandedQuadrant={setExpandedQuadrant}
        taskInputText={taskInputText}
      />
    </div>
  );
};
