import { useMemo } from 'react';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { useUIStore } from '@/shared/stores/uiStore';

export const useQuadrantOrder = (taskInputText: string): MatrixKey[] => {
  const { selectedCategory } = useUIStore();

  return useMemo(() => {
    let newOrder: MatrixKey[] = [
      'ImportantUrgent',
      'ImportantNotUrgent',
      'NotImportantUrgent',
      'NotImportantNotUrgent',
    ];

    if (taskInputText.trim() !== '' && selectedCategory) {
      newOrder = newOrder.filter((q) => q !== selectedCategory);
      newOrder.unshift(selectedCategory);
    }

    return newOrder;
  }, [taskInputText, selectedCategory]);
};
