import { MatrixKey } from '../../tasksStore/types';

export interface UIState {
  selectedCategory: MatrixKey;
  taskInputText: string;
  recentlyAddedQuadrant: MatrixKey | null;
  isFormOpened: boolean;
  isAnalyticsOpened: boolean;
  taskInsertIndex: number | null;
  viewMode: 'matrix' | 'list';
  sortField: 'createdAt' | 'importance';
  sortDirection: 'asc' | 'desc';
}
