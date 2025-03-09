'use client';

import { useState } from 'react';
import { InteractWithMatrix } from '@/features/interactWithMatrix';
import { TaskMatrixHeaders } from '@/entities/taskMatrixHeaders';
import { MatrixKey } from '@/entities/Tasks';
import { getTaskInputText } from '@/entities/Tasks';
import { useUIStore } from '@/entities/Tasks';
import { useAuth } from '@/shared/api/auth';

export const TaskMatrix: React.FC = () => {
  const { isLoading } = useAuth();

  const taskInputText = useUIStore(getTaskInputText);

  const [expandedQuadrant, setExpandedQuadrant] = useState<MatrixKey | null>(
    null,
  );

  console.log(isLoading);

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
