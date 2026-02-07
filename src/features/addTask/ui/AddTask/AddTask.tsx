'use client';

import { useEffect, useState } from 'react';
import { AddTaskForm } from '@/entities/addTaskForm';
import { useTaskStore } from '@/shared/stores/tasksStore';

import { MatrixKey, MatrixQuadrants } from '@/shared/stores/tasksStore';
import { addTaskAction } from '@/shared/stores/tasksStore';
import {
  setRecentlyAddedQuadrantAction,
  setSelectedCategoryAction,
  setTaskInputTextAction,
  setIsFormOpenedAction,
  useUIStore,
} from '@/shared/stores/uiStore';

import { showToastNotificationByAddTask } from '../../lib/toastNotifications';

const useFormValidation = (taskInputText: string) => {
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setIsValid(taskInputText.length <= 200);
  }, [taskInputText]);

  return isValid;
};

export const AddTask = () => {
  const { selectedCategory, taskInputText, isFormOpened } = useUIStore();

  const isValid = useFormValidation(taskInputText);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = taskInputText.trim().length > 0;
    if (isValid) {
      addTaskAction(selectedCategory, taskInputText);
      setTaskInputTextAction('');
      setRecentlyAddedQuadrantAction(selectedCategory);
      showToastNotificationByAddTask(selectedCategory);
    }
  };

  const handleCategoryChange = (key: MatrixKey) => {
    setSelectedCategoryAction(key);
  };

  const handleOnRadioKeyDown = (
    e: React.KeyboardEvent<HTMLSpanElement>,
    key: MatrixKey,
  ) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleCategoryChange(key);
    }
  };

  const [inNoTasks, setInNoTasks] = useState(true);

  const { firebaseTasks, localTasks } = useTaskStore();

  useEffect(() => {
    setInNoTasks(true);
    for (const key in MatrixQuadrants) {
      if (
        localTasks[key as MatrixKey].length !== 0 ||
        firebaseTasks[key as MatrixKey].length !== 0
      ) {
        setInNoTasks(false);
        break;
      }
    }
  }, [localTasks, firebaseTasks]);

  return (
    <AddTaskForm
      isNoTasks={inNoTasks}
      handleCategoryChange={handleCategoryChange}
      handleOnRadioKeyDown={handleOnRadioKeyDown}
      handleSubmit={handleSubmitForm}
      isValid={isValid}
      selectedCategory={selectedCategory}
      setTaskInputTextAction={setTaskInputTextAction}
      taskInputText={taskInputText}
      isOpened={isFormOpened}
      setIsOpened={setIsFormOpenedAction}
    />
  );
};
