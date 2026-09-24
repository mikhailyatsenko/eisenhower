'use client';

import { useEffect, useState } from 'react';
import { FloatButton } from '@/entities/addTaskForm';
import { colors, EditTaskForm } from '@/entities/matrixLayout';
import { MATRIX_KEYS } from '@/shared/consts';
import { useTaskStore } from '@/shared/stores/tasksStore';

import { MatrixKey } from '@/shared/stores/tasksStore';
import { addTaskAction } from '@/shared/stores/tasksStore';
import {
  setRecentlyAddedQuadrantAction,
  setIsFormOpenedAction,
  useUIStore,
} from '@/shared/stores/uiStore';

import { Modal } from '@/shared/ui/modal';

export const AddTask = () => {
  const { selectedCategory, isFormOpened } = useUIStore();
  const [currentQuadrant, setCurrentQuadrant] =
    useState<MatrixKey>(selectedCategory);

  useEffect(() => {
    setCurrentQuadrant(selectedCategory);
  }, [selectedCategory]);

  const handleSave = async (
    text: string,
    dueDate: Date | null,
    quadrant?: MatrixKey,
  ) => {
    const { taskInsertIndex } = useUIStore.getState();
    const finalQuadrant = quadrant || selectedCategory;
    const taskId = await addTaskAction(
      finalQuadrant,
      text,
      dueDate,
      taskInsertIndex,
    );

    if (taskId) {
      setRecentlyAddedQuadrantAction(finalQuadrant);
    }
    setIsFormOpenedAction(false);
  };

  const [inNoTasks, setInNoTasks] = useState(true);
  const { firebaseTasks, localTasks } = useTaskStore();

  useEffect(() => {
    setInNoTasks(
      MATRIX_KEYS.every(
        (key) =>
          localTasks[key].length === 0 && firebaseTasks[key].length === 0,
      ),
    );
  }, [localTasks, firebaseTasks]);

  return (
    <>
      <FloatButton
        isNoTasks={inNoTasks}
        active={isFormOpened}
        toggleActive={() => setIsFormOpenedAction(!isFormOpened)}
      />
      {isFormOpened && (
        <Modal
          label="New task"
          onClose={() => setIsFormOpenedAction(false)}
          width="lg"
          className={`${colors[currentQuadrant]} border-none p-6 shadow-2xl transition-colors duration-300`}
        >
          <div className="flex h-fit max-h-[calc(100dvh-88px)] w-full flex-col overflow-hidden">
            <h3 className="mb-4 shrink-0 text-center text-lg font-bold tracking-widest text-gray-900 uppercase opacity-70 dark:text-gray-100">
              New Task
            </h3>
            <EditTaskForm
              // We reuse EditTaskForm for creating by passing a "virtual" empty task
              task={{
                id: '',
                text: '',
                createdAt: new Date(),
                quadrantKey: selectedCategory,
              }}
              handleSave={handleSave}
              setIsEditing={() => setIsFormOpenedAction(false)}
              onQuadrantChange={setCurrentQuadrant}
            />
          </div>
        </Modal>
      )}
    </>
  );
};
