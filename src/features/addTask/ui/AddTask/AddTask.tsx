'use client';

import { useEffect, useState } from 'react';
import { AddTaskForm } from '@/entities/addTaskForm/ui/addTaskForm/AddTaskForm';
import { MatrixKey } from '@/entities/taskMatrix';
import { addTaskAction } from '@/entities/taskMatrix';
import {
  getSelectedCategory,
  getTaskInputText,
} from '@/entities/taskMatrix/model/selectors/uiSelectors';
import {
  setRecentlyAddedQuadrantAction,
  setSelectedCategoryAction,
  setTaskInputTextAction,
  useUIStore,
} from '@/entities/taskMatrix/model/store/uiStore';

const useFormValidation = (taskInputText: string) => {
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setIsValid(taskInputText.length <= 200);
  }, [taskInputText]);

  return isValid;
};

export const AddTask = () => {
  const selectedCategory = useUIStore(getSelectedCategory);
  const taskInputText = useUIStore(getTaskInputText);

  const isValid = useFormValidation(taskInputText);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = taskInputText.trim().length > 0;
    if (isValid) {
      addTaskAction(selectedCategory, taskInputText);
      setTaskInputTextAction('');
      setRecentlyAddedQuadrantAction(selectedCategory);
    }
  };

  const handleCategoryChange = (key: MatrixKey) => {
    setSelectedCategoryAction(key);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLSpanElement>,
    key: MatrixKey,
  ) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleCategoryChange(key);
    }
  };

  return (
    <AddTaskForm
      handleCategoryChange={handleCategoryChange}
      handleKeyDown={handleKeyDown}
      handleSubmit={handleSubmitForm}
      isValid={isValid}
      selectedCategory={selectedCategory}
      setTaskInputTextAction={setTaskInputTextAction}
      taskInputText={taskInputText}
    />
  );
};
